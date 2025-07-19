"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { stripe } from "@/features/subscription/libs/stripe";
import {
  getUserSubscriptionInfo,
  upsertUserSubscription,
} from "@/features/subscription/repositories/subscription-repository";
import { formatDateAsUTC } from '@/utils/date-utils';

export async function fixCanceledSubscription() {
  try {
    console.log("Fixing canceled subscription...");
    
    const user = await currentUser();
    if (!user?.id) {
      return { error: "認証が必要です" };
    }

    const subscriptionInfo = await getUserSubscriptionInfo(user.id);
    
    if (!subscriptionInfo?.stripeSubscriptionId) {
      return { error: "サブスクリプション情報が見つかりません" };
    }

    if (subscriptionInfo.status !== "CANCELED") {
      return { error: "キャンセル済みのサブスクリプションではありません" };
    }

    // Stripeから現在の情報を取得
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscriptionInfo.stripeSubscriptionId
    );

    console.log("Stripe subscription data:", stripeSubscription);

    const currentPeriodEnd = stripeSubscription.items.data[0].current_period_end;
    
    if (currentPeriodEnd) {
      const periodEndDate = new Date(currentPeriodEnd * 1000);
      console.log("Updating currentPeriodEnd to:", periodEndDate);

      await upsertUserSubscription(user.id, {
        currentPeriodEnd: periodEndDate,
      });

      const formattedDate = formatDateAsUTC(periodEndDate);
      return { 
        success: `サブスクリプション期間を修正しました。${formattedDate}まで利用可能です。` 
      };
    } else {
      return { error: "Stripeから期間終了日を取得できませんでした" };
    }
  } catch (error) {
    console.error("Failed to fix canceled subscription:", error);
    return { error: `修正に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 