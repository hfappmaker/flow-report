"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { stripe } from "@/features/subscription/libs/stripe";
import {
  getUserSubscriptionInfo,
  updateUserSubscription,
} from "@/features/subscription/repositories/subscription-repository";
import { CancelSubscriptionResult } from "@/features/subscription/types/subscription";

export async function cancelSubscription(): Promise<CancelSubscriptionResult> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { error: "認証が必要です" };
    }

    const subscriptionInfo = await getUserSubscriptionInfo(user.id);

    if (!subscriptionInfo?.stripeSubscriptionId) {
      return { error: "有効なサブスクリプションが見つかりません" };
    }

    // Stripeでサブスクリプションをキャンセル（期間終了時にキャンセル）
    await stripe.subscriptions.update(
      subscriptionInfo.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      },
    );

    // データベースを更新
    await updateUserSubscription(user.id, {
      subscriptionStatus: "CANCELED",
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return { error: "サブスクリプションのキャンセルに失敗しました" };
  }
}
