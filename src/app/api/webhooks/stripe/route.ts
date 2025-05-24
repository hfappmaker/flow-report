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
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 400 },
    );
  }

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

            const currentPeriodEnd = subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null;

            // ユーザーのサブスクリプション情報を更新
            await updateUserSubscription(user.id, {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus:
                trialEnd && trialEnd > new Date() ? "TRIAL" : "ACTIVE",
              trialEndsAt: trialEnd,
              currentPeriodEnd,
              hasUsedTrial: true,
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
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

          const currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null;

          await updateUserSubscription(user.id, {
            subscriptionStatus: status,
            currentPeriodEnd,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const user = await getUserByStripeSubscriptionId(subscription.id);

        if (user) {
          await updateUserSubscription(user.id, {
            subscriptionStatus: "CANCELED",
            stripeSubscriptionId: undefined,
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;

        if (invoice.subscription) {
          const user = await getUserByStripeSubscriptionId(
            invoice.subscription as string,
          );

          if (user) {
            await updateUserSubscription(user.id, {
              subscriptionStatus: "ACTIVE",
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;

        if (invoice.subscription) {
          const user = await getUserByStripeSubscriptionId(
            invoice.subscription as string,
          );

          if (user) {
            await updateUserSubscription(user.id, {
              subscriptionStatus: "PAST_DUE",
            });
          }
        }
        break;
      }
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
