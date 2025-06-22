"use server";
import Stripe from "stripe";

import { currentUser } from "@/features/auth/lib/auth";
import { stripe } from "@/features/subscription/libs/stripe";
import {
  getUserSubscriptionInfo,
  upsertUserSubscription,
} from "@/features/subscription/repositories/subscription-repository";

export async function cancelSubscription() {
  try {
    console.log("Starting subscription cancellation...");
    
    const user = await currentUser();
    if (!user?.id) {
      console.log("User not authenticated");
      return { error: "認証が必要です" };
    }

    console.log("User ID:", user.id);

    const subscriptionInfo = await getUserSubscriptionInfo(user.id);
    console.log("Subscription info:", subscriptionInfo);
    
    if (!subscriptionInfo?.stripeSubscriptionId) {
      console.log("No active subscription found");
      return { error: "有効なサブスクリプションが見つかりません" };
    }

    console.log("Canceling Stripe subscription:", subscriptionInfo.stripeSubscriptionId);

    // まず現在のサブスクリプション情報をStripeから取得
    const currentSubscription = await stripe.subscriptions.retrieve(
      subscriptionInfo.stripeSubscriptionId
    );
    console.log("Current Stripe subscription:", currentSubscription);

    // Stripeでサブスクリプションをキャンセル
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionInfo.stripeSubscriptionId,
      {
        cancel_at_period_end: true, // 期間終了時にキャンセル
      }
    );

    console.log("Stripe cancellation successful:", canceledSubscription.id);
    console.log("Current period end from Stripe:", canceledSubscription.items.data[0].current_period_end);

    // Stripeのサブスクリプションから期間終了日を取得
    // トライアル期間中: trial_end、通常期間: items[0].current_period_end
    const getPeriodEnd = (subscription: Stripe.Subscription) => {
      if (subscription.trial_end) {
        return subscription.trial_end;
      }
      if (subscription.items.data[0].current_period_end) {
        return subscription.items.data[0].current_period_end;
      }
      return null;
    };

    const currentPeriodEnd = 
      getPeriodEnd(canceledSubscription) ?? getPeriodEnd(currentSubscription);

    if (!currentPeriodEnd) {
      console.error(
        "Neither current_period_end nor trial_end found in Stripe subscription",
      );
      return {
        error: "サブスクリプション期間情報の取得に失敗しました",
      };
    }

    const periodEndDate = new Date(currentPeriodEnd * 1000);
    console.log("Setting currentPeriodEnd to:", periodEndDate);

    await upsertUserSubscription(user.id, {
      status: "CANCELED",
      currentPeriodEnd: periodEndDate,
    });

    console.log("Database updated successfully");

    // 期間終了日をフォーマットして表示
    const formattedDate = periodEndDate.toLocaleDateString('ja-JP');
    
    return { 
      success: `サブスクリプションがキャンセルされました。${formattedDate}まで引き続きご利用いただけます。` 
    };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return { error: `サブスクリプションのキャンセルに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 