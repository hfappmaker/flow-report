import { SubscriptionStatus } from "@prisma/client";

import { SubscriptionInfo } from "@/features/subscription/types/subscription";

export function calculateSubscriptionInfo(subscription: {
  status: SubscriptionStatus | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  hasUsedTrial: boolean;
}): SubscriptionInfo {
  const now = new Date();
  const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const currentPeriodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : null;

  // トライアル期間中かどうかを判定
  const isTrialActive =
    subscription.status === "TRIAL" &&
    trialEndsAt !== null &&
    trialEndsAt > now;

  // トライアル期間の残り日数を計算
  let daysLeftInTrial: number | null = null;
  if (isTrialActive) {
    const diffTime = trialEndsAt.getTime() - now.getTime();
    daysLeftInTrial = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    status: subscription.status,
    trialEndsAt,
    currentPeriodEnd,
    hasUsedTrial: subscription.hasUsedTrial,
    isTrialActive,
    daysLeftInTrial,
  };
}

export function shouldShowSubscriptionPrompt(
  subscriptionInfo: SubscriptionInfo | null | undefined,
): boolean {
  // サブスクリプション情報がない場合はプロンプトを表示
  if (!subscriptionInfo) {
    return true;
  }

  const now = new Date();
  
  // キャンセル済みでも現在の期間中は表示しない
  if (subscriptionInfo.status === "CANCELED" && 
      subscriptionInfo.currentPeriodEnd && 
      subscriptionInfo.currentPeriodEnd > now) {
    return false;
  }

  // トライアル期間中はプロンプトを表示しない
  if (subscriptionInfo.isTrialActive) {
    return false;
  }

  // アクティブなサブスクリプションがある場合はプロンプトを表示しない
  if (subscriptionInfo.status === "ACTIVE") {
    return false;
  }

  // 支払い遅延でも現在の期間中は表示しない（猶予期間）
  if (subscriptionInfo.status === "PAST_DUE" && 
      subscriptionInfo.currentPeriodEnd && 
      subscriptionInfo.currentPeriodEnd > now) {
    return false;
  }

  // その他の場合はプロンプトを表示
  return true;
}

export function canAccessPaidFeatures(
  subscriptionInfo: SubscriptionInfo | null | undefined,
): boolean {
  console.log("=== canAccessPaidFeatures ===");
  console.log("Input subscriptionInfo:", subscriptionInfo);
  
  // サブスクリプション情報がない場合はアクセス拒否
  if (!subscriptionInfo) {
    console.log("No subscription info - access denied");
    return false;
  }

  const now = new Date();
  console.log("Current time:", now);
  console.log("Subscription status:", subscriptionInfo.status);
  console.log("Current period end:", subscriptionInfo.currentPeriodEnd);
  console.log("Is trial active:", subscriptionInfo.isTrialActive);

  // キャンセル済みでも現在の期間中はアクセス可能
  if (subscriptionInfo.status === "CANCELED" && 
      subscriptionInfo.currentPeriodEnd && 
      subscriptionInfo.currentPeriodEnd > now) {
    console.log("CANCELED but within current period - access granted");
    return true;
  }

  // トライアル期間中または有効なサブスクリプションがある場合はアクセス可能
  const hasAccess = (
    subscriptionInfo.isTrialActive ||
    subscriptionInfo.status === "ACTIVE" ||
    subscriptionInfo.status === "PAST_DUE"
  );

  console.log("Final access decision:", hasAccess);
  return hasAccess;
}
