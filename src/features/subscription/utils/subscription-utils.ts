import { SubscriptionStatus } from "@prisma/client";

import { SubscriptionInfo } from "@/features/subscription/types/subscription";

export function calculateSubscriptionInfo(user: {
  subscriptionStatus: SubscriptionStatus | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  hasUsedTrial: boolean;
}): SubscriptionInfo {
  const now = new Date();
  const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const currentPeriodEnd = user.currentPeriodEnd
    ? new Date(user.currentPeriodEnd)
    : null;

  // トライアル期間中かどうかを判定
  const isTrialActive =
    user.subscriptionStatus === "TRIAL" &&
    trialEndsAt !== null &&
    trialEndsAt > now;

  // トライアル期間の残り日数を計算
  let daysLeftInTrial: number | null = null;
  if (isTrialActive && trialEndsAt) {
    const diffTime = trialEndsAt.getTime() - now.getTime();
    daysLeftInTrial = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    status: user.subscriptionStatus,
    trialEndsAt,
    currentPeriodEnd,
    hasUsedTrial: user.hasUsedTrial,
    isTrialActive,
    daysLeftInTrial,
  };
}

export function shouldShowSubscriptionPrompt(
  subscriptionInfo: SubscriptionInfo,
): boolean {
  // サブスクリプションがない、またはキャンセル済み、期限切れの場合はプロンプトを表示
  return (
    !subscriptionInfo.status ||
    subscriptionInfo.status === "CANCELED" ||
    subscriptionInfo.status === "UNPAID"
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
