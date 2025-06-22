import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe, getStripeEnv } from "@/features/subscription/libs/stripe";
import {
  getUserByStripeCustomerId,
  getUserByStripeSubscriptionId,
  getUserSubscriptionInfo,
  upsertUserSubscription,
} from "@/features/subscription/repositories/subscription-repository";

export async function POST(req: Request) {
  console.log("Stripe webhook received");
  
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

  console.log("Webhook event type:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (
          session.mode === "subscription" &&
          session.subscription &&
          session.customer
        ) {
          const user = await getUserByStripeCustomerId(
            session.customer as string,
          );

          if (user) {
            // サブスクリプション情報を取得
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string,
            );

            const trialEnd = subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null;

            // Stripeのサブスクリプションから期間終了日を取得
            // トライアル期間中: trial_end、通常期間: items.data[0].current_period_end
            const getPeriodEnd = (subscription: Stripe.Subscription) => {
              const now = Math.floor(Date.now() / 1000);
              if (subscription.trial_end && subscription.trial_end > now) {
                return new Date(subscription.trial_end * 1000);
              }
              if (subscription.items.data[0].current_period_end) {
                return new Date(subscription.items.data[0].current_period_end * 1000);
              }
              return null;
            };

            const currentPeriodEnd = getPeriodEnd(subscription);

            // ユーザーのサブスクリプション情報を更新
            try {
              await upsertUserSubscription(user.id, {
                stripeSubscriptionId: subscription.id,
                status:
                  trialEnd && trialEnd > new Date() ? "TRIAL" : "ACTIVE",
                trialEndsAt: trialEnd,
                currentPeriodEnd,
                hasUsedTrial: true,
              });
              console.log("Subscription updated for checkout.session.completed");
            } catch (error) {
              console.error("Failed to update user subscription for checkout.session.completed:", error);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const user = await getUserByStripeSubscriptionId(subscription.id);

        if (user) {
          console.log("Processing subscription update:");
          console.log("- Subscription ID:", subscription.id);
          console.log("- Status:", subscription.status);
          console.log("- Trial end:", subscription.trial_end);
          console.log("- Current period end:", subscription.items.data[0].current_period_end);
          console.log("- Cancel at period end:", subscription.cancel_at_period_end);

          // 現在のDB情報を取得
          const currentDbInfo = await getUserSubscriptionInfo(user.id);

          // ステータスを決定する関数（改善版）
          const getSubscriptionStatus = (subscription: Stripe.Subscription): "TRIAL" | "ACTIVE" | "CANCELED" | "PAST_DUE" | "UNPAID" => {
            const now = Math.floor(Date.now() / 1000);
            
            // キャンセル予定（期間終了時にキャンセル）の場合
            if (subscription.cancel_at_period_end) {
              return "CANCELED";
            }
            
            // Stripeのステータスベースで判定
            switch (subscription.status) {
              case "active":
                // トライアル期間中かどうかを判定
                if (subscription.trial_end && subscription.trial_end > now) {
                  return "TRIAL";
                } else {
                  return "ACTIVE";
                }
              case "canceled":
                return "CANCELED";
              case "past_due":
                return "PAST_DUE";
              case "unpaid":
              case "incomplete":
              case "incomplete_expired":
                return "UNPAID";
              default:
                console.warn("Unexpected subscription status:", subscription.status);
                return "UNPAID";
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
              return new Date(subscription.items.data[0].current_period_end * 1000);
            }
            return null;
          };

          const newCurrentPeriodEnd = getPeriodEnd(subscription);
          const newTrialEndsAt = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000) 
            : null;

          // 変更があるかチェック
          const hasStatusChanged = currentDbInfo?.status !== newStatus;
          const hasPeriodEndChanged = currentDbInfo?.currentPeriodEnd?.getTime() !== newCurrentPeriodEnd?.getTime();
          const hasTrialEndChanged = currentDbInfo?.trialEndsAt?.getTime() !== newTrialEndsAt?.getTime();

          const hasChanges = hasStatusChanged || hasPeriodEndChanged || hasTrialEndChanged;

          if (hasChanges) {
            console.log("Changes detected:");
            if (hasStatusChanged) console.log(`- Status: ${currentDbInfo?.status} → ${newStatus}`);
            if (hasPeriodEndChanged) console.log(`- Period end: ${currentDbInfo?.currentPeriodEnd} → ${newCurrentPeriodEnd}`);
            if (hasTrialEndChanged) console.log(`- Trial end: ${currentDbInfo?.trialEndsAt} → ${newTrialEndsAt}`);

            try {
              await upsertUserSubscription(user.id, {
                status: newStatus,
                currentPeriodEnd: newCurrentPeriodEnd,
                trialEndsAt: newTrialEndsAt,
              });
              console.log(`Subscription updated: ${subscription.id} -> ${newStatus}`);
              
              // トライアル終了時の特別ログ
              if (newStatus === "ACTIVE" && hasStatusChanged && currentDbInfo?.status === "TRIAL") {
                console.log("🎉 Trial period ended, subscription is now ACTIVE");
              }
              
              // 月次更新の場合は簡潔なログ
              if (newStatus === "ACTIVE" && !hasStatusChanged && hasPeriodEndChanged) {
                console.log("📅 Monthly renewal: subscription period extended");
              }
            } catch (error) {
              console.error("Failed to update user subscription for customer.subscription.updated:", error);
            }
          } else {
            console.log("No changes detected, skipping DB update");
          }
        } else {
          console.warn("User not found for subscription:", subscription.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user = await getUserByStripeSubscriptionId(subscription.id);

        if (user) {
          try {
            await upsertUserSubscription(user.id, {
              status: "CANCELED",
              stripeSubscriptionId: undefined,
            });
            console.log("Subscription updated for customer.subscription.deleted");
          } catch (error) {
            console.error("Failed to update user subscription for customer.subscription.deleted:", error);
          }
        }
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("Invoice payment succeeded:", invoice.id);
        console.log("Subscription ID from invoice:", invoice.lines.data[0].subscription);

        if (invoice.lines.data[0].subscription && invoice.lines.data[0].subscription !== "") {
          const user = await getUserByStripeSubscriptionId(invoice.lines.data[0].subscription as string);

          if (user) {
            // 現在のDB情報を取得
            const currentDbInfo = await getUserSubscriptionInfo(user.id);
            
            // サブスクリプションの最新情報を取得
            const subscription = await stripe.subscriptions.retrieve(invoice.lines.data[0].subscription as string);
            
            const now = Math.floor(Date.now() / 1000);
            const isTrialActive = subscription.trial_end && subscription.trial_end > now;
            const newStatus = isTrialActive ? "TRIAL" : "ACTIVE";
            const newCurrentPeriodEnd = new Date(subscription.items.data[0].current_period_end * 1000);
            
            // ステータスの変更があるかチェック（支払い成功時は必ずACTIVEに）
            const hasStatusChanged = currentDbInfo?.status !== newStatus;
            const hasPeriodEndChanged = currentDbInfo?.currentPeriodEnd?.getTime() !== newCurrentPeriodEnd.getTime();
            
            // トライアル終了後の初回課金または期間更新の場合のみ更新
            const shouldUpdate = hasStatusChanged || hasPeriodEndChanged;
            
            if (shouldUpdate) {
              try {
                await upsertUserSubscription(user.id, {
                  status: newStatus,
                  currentPeriodEnd: newCurrentPeriodEnd,
                });
                
                if (hasStatusChanged) {
                  console.log("Subscription updated for invoice.payment_succeeded");
                  // トライアル終了後の初回課金成功時の特別ログ
                  if (!isTrialActive && subscription.trial_end) {
                    console.log("🎉 First payment after trial succeeded, subscription is ACTIVE");
                  }
                } else if (hasPeriodEndChanged) {
                  console.log("📅 Monthly payment succeeded: subscription period extended");
                }
              } catch (error) {
                console.error("Failed to update user subscription for invoice.payment_succeeded:", error);
              }
            } else {
              console.log("Invoice payment succeeded but no DB update needed");
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("Invoice payment failed:", invoice.id);

        if (invoice.lines.data[0].subscription) {
          const user = await getUserByStripeSubscriptionId(invoice.lines.data[0].subscription as string);

          if (user) {
            try {
              await upsertUserSubscription(user.id, {
                status: "PAST_DUE",
              });
              console.log("Subscription updated for invoice.payment_failed");
            } catch (error) {
              console.error("Failed to update user subscription for invoice.payment_failed:", error);
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("Payment Intent succeeded:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new NextResponse(
      `Webhook handler failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 },
    );
  }
} 