import type { SubscriptionStatus } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe, getStripeEnv } from "@/features/subscription/libs/stripe";
import {
  getUserByStripeCustomerId,
  upsertUserSubscription,
  upsertStripeCustomer,
} from "@/features/subscription/repositories/subscription-repository";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return new NextResponse("No signature", { status: 400 });
  }

  // 環境変数を安全に取得
  let stripeEnv;
  try {
    stripeEnv = getStripeEnv();
  } catch (error) {
    console.error("Stripe environment variables not configured:", error);
    return new NextResponse("Server configuration error", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeEnv.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 400 },
    );
  }

  const created = new Date(event.created * 1000);

  console.log(
    `[${created}] 🎯 Processing webhook event: ${event.type} (ID: ${event.id})`,
  );

  try {
    switch (event.type) {
      case "customer.created":
      case "customer.updated": {
        const customer = event.data.object;
        console.log(`[${created}] 👤 ${event.type}:`);
        console.log(`   - Customer ID: ${customer.id}`);
        console.log(`   - User ID: ${customer.metadata.userId || "N/A"}`);
        console.log(`   - Email: ${customer.email ?? "N/A"}`);

        // ユーザーのStripeカスタマーIDをDBに保存
        if (customer.metadata.userId) {
          try {
            await upsertStripeCustomer(customer.metadata.userId, customer.id, created);
            console.log(
              `[${created}] ✅ Successfully linked Stripe customer to user DB`,
            );
          } catch (error) {
            console.error(
              `[${created}] ❌ Failed to link Stripe customer:`,
              error,
            );
            throw error;
          }
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const user = await getUserByStripeCustomerId(
          subscription.customer as string,
        );

        if (user) {
          console.log(`[${created}] 📊 ${event.type}:`);
          console.log(`   - Subscription ID: ${subscription.id}`);
          console.log(`   - User ID: ${user.id}`);
          console.log(`   - Status: ${subscription.status}`);
          console.log(
            `   - Trial end: ${subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : "N/A"}`,
          );
          console.log(
            `   - Current period end: ${new Date(subscription.items.data[0].current_period_end * 1000).toISOString()}`,
          );
          console.log(
            `   - Cancel at period end: ${subscription.cancel_at_period_end}`,
          );

          // ステータスを決定する関数（改善版）
          const getSubscriptionStatus = (
            subscription: Stripe.Subscription,
          ): SubscriptionStatus => {
            // キャンセル予定（期間終了時にキャンセル）の場合
            if (subscription.cancel_at_period_end) {
              return "CANCELED";
            }

            // Stripeのステータスベースで判定
            switch (subscription.status) {
              case "active":
                return "ACTIVE";
              case "trialing":
                return "TRIAL";
              case "paused":
                return "CANCELED";
              case "canceled":
                return "CANCELED";
              case "past_due":
                return "CANCELED";
              case "unpaid":
              case "incomplete":
              case "incomplete_expired":
                return "CANCELED";
              default:
                console.warn(
                  "Unexpected subscription status:",
                  subscription.status,
                );
                return "CANCELED";
            }
          };

          const newStatus = getSubscriptionStatus(subscription);

          // Stripeのサブスクリプションから期間終了日を取得
          // トライアル期間中: trial_end、通常期間: items.data[0].current_period_end
          const getPeriodEnd = (subscription: Stripe.Subscription) => {
            const now = Math.floor(Date.now() / 1000);

            // トライアル期間中の場合
            if (subscription.trial_end && subscription.trial_end > now) {
              return new Date(subscription.trial_end * 1000);
            }
            if (subscription.items.data[0].current_period_end) {
              return new Date(
                subscription.items.data[0].current_period_end * 1000,
              );
            }
            return null;
          };

          const newCurrentPeriodEnd = getPeriodEnd(subscription);

          try {
            await upsertUserSubscription(subscription.customer as string, {
              stripeSubscriptionId: subscription.id,
              status: newStatus,
              currentPeriodEnd: newCurrentPeriodEnd,
            },created);
            console.log(
              `[${created}] ✅ Subscription updated: ${subscription.id} -> ${newStatus}`,
            );
          } catch (error) {
            console.error(
              `[${created}] ❌ Failed to update subscription:`,
              error,
            );
            throw error;
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user = await getUserByStripeCustomerId(
          subscription.customer as string,
        );

        if (user) {
          try {
            await upsertUserSubscription(subscription.customer as string, {
              stripeSubscriptionId: subscription.id,
              status: "CANCELED",
            },created);
            console.log(
              "Subscription updated for customer.subscription.deleted",
            );
          } catch (error) {
            console.error(
              "Failed to update user subscription for customer.subscription.deleted:",
              error,
            );
            throw error;
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log(`[${created}] ✅ Webhook processed successfully`);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error(`[${created}] ❌ Webhook processing error:`, error);
    return new NextResponse(
      `Webhook handler failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 },
    );
  }
}
