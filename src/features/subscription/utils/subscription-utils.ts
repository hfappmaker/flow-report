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
  subscriptionInfo: SubscriptionInfo,
): boolean {
  // サブスクリプションがない、キャンセル済み、期限切れ、またはトライアル期間が終了した場合はプロンプトを表示
  return (
    !subscriptionInfo.status ||
    subscriptionInfo.status === "CANCELED" ||
    subscriptionInfo.status === "UNPAID" ||
    (subscriptionInfo.hasUsedTrial && !subscriptionInfo.isTrialActive && subscriptionInfo.status !== "ACTIVE")
  );
}

export function canAccessPaidFeatures(
  subscriptionInfo: SubscriptionInfo,
): boolean {
  // トライアル期間中または有効なサブスクリプションがある場合はアクセス可能
  return (
    subscriptionInfo.isTrialActive ||
    subscriptionInfo.status === "ACTIVE" ||
    subscriptionInfo.status === "PAST_DUE"
  );
}
