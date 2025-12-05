"use server";

import { currentUser } from "@/features/auth/libs/auth";
import { stripe } from "@/features/subscription/libs/stripe";
import {
  getSubscriptionInfoByUserId,
  upsertUserSubscription,
  getStripeCustomerByUserId,
} from "@/features/subscription/repositories/subscription-repository";
import { getSubscriptionCancelAt } from "@/features/subscription/utils/subscription-utils";
import { formatDateAsUTC } from "@/utils/date-utils";

export async function fixCanceledSubscription() {
  try {
    console.log("Fixing canceled subscription...");

    const user = await currentUser();
    if (!user?.id) {
      return { error: "認証が必要です" };
    }

    const subscriptionInfoResult = await getSubscriptionInfoByUserId(user.id);
    if (!subscriptionInfoResult.success) {
      return { error: subscriptionInfoResult.error };
    }
    const subscriptionInfo = subscriptionInfoResult.data;

    if (!subscriptionInfo?.stripeSubscriptionId) {
      return { error: "サブスクリプション情報が見つかりません" };
    }

    if (subscriptionInfo.status !== "canceled") {
      return { error: "キャンセル済みのサブスクリプションではありません" };
    }

    // Stripeから現在の情報を取得
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscriptionInfo.stripeSubscriptionId,
    );

    console.log("Stripe subscription data:", stripeSubscription);

    const cancelAt = getSubscriptionCancelAt(stripeSubscription);

    if (cancelAt) {
      console.log("Updating cancelAt to:", cancelAt);

      const stripeCustomerResult = await getStripeCustomerByUserId(user.id);
      if (!stripeCustomerResult.success) {
        return { error: stripeCustomerResult.error };
      }
      const stripeCustomer = stripeCustomerResult.data;
      if (!stripeCustomer) {
        return { error: "Stripe顧客情報が見つかりません" };
      }

      const upsertResult = await upsertUserSubscription(
        stripeCustomer.stripeCustomerId,
        {
          stripeSubscriptionId: subscriptionInfo.stripeSubscriptionId,
          status: subscriptionInfo.status,
          cancelAt,
        },
        new Date(stripeSubscription.created * 1000),
      );

      if (!upsertResult.success) {
        return { error: upsertResult.error };
      }

      const formattedDate = formatDateAsUTC(cancelAt);
      return {
        success: `キャンセル予定日を修正しました。${formattedDate}にキャンセルされます。`,
      };
    } else {
      return { error: "Stripeからキャンセル予定日を取得できませんでした" };
    }
  } catch (error) {
    console.error("Failed to fix canceled subscription:", error);
    return {
      error: `修正に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
