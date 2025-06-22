import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/features/subscription/libs/stripe";
import {
  getUserByStripeCustomerId,
  getUserByStripeSubscriptionId,
  updateUserSubscription,
} from "@/features/subscription/repositories/subscription-repository";

export async function POST(req: Request) {
  console.log("Stripe webhook received");
  
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  if (!signature) {
    console.error("No Stripe signature found");
    return new NextResponse("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
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
        const session = event.data.object as Stripe.Checkout.Session;

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

            const currentPeriodEnd = (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : null;

            // ユーザーのサブスクリプション情報を更新
            try {
              await updateUserSubscription(user.id, {
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
        const subscription = event.data.object as Stripe.Subscription;
        const user = await getUserByStripeSubscriptionId(subscription.id);

        if (user) {
          let status: "TRIAL" | "ACTIVE" | "CANCELED" | "PAST_DUE" | "UNPAID";

          if (subscription.status === "active") {
            status =
              subscription.trial_end &&
              subscription.trial_end > Math.floor(Date.now() / 1000)
                ? "TRIAL"
                : "ACTIVE";
          } else if (subscription.status === "canceled") {
            status = "CANCELED";
          } else if (subscription.status === "past_due") {
            status = "PAST_DUE";
          } else {
            status = "UNPAID";
          }

          const currentPeriodEnd = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000)
            : null;

          try {
            await updateUserSubscription(user.id, {
              status,
              currentPeriodEnd,
            });
            console.log("Subscription updated for customer.subscription.updated");
          } catch (error) {
            console.error("Failed to update user subscription for customer.subscription.updated:", error);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await getUserByStripeSubscriptionId(subscription.id);

        if (user) {
          try {
            await updateUserSubscription(user.id, {
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
        const invoice = event.data.object as any;

        // invoice.subscriptionは文字列またはSubscriptionオブジェクトの可能性がある
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;

        if (subscriptionId) {
          const user = await getUserByStripeSubscriptionId(subscriptionId);

          if (user) {
            try {
              await updateUserSubscription(user.id, {
                status: "ACTIVE",
              });
              console.log("Subscription updated for invoice.payment_succeeded/invoice.paid");
            } catch (error) {
              console.error("Failed to update user subscription for invoice.payment_succeeded:", error);
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;

        // invoice.subscriptionは文字列またはSubscriptionオブジェクトの可能性がある
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;

        if (subscriptionId) {
          const user = await getUserByStripeSubscriptionId(subscriptionId);

          if (user) {
            try {
              await updateUserSubscription(user.id, {
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