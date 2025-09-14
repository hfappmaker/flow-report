import type { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

/**
 * Stripeのサブスクリプションから期間終了日を取得
 * トライアル期間中: trial_end、通常期間: items.data[0].current_period_end
 * @param subscription Stripeサブスクリプション
 * @returns 期間終了日またはnull
 */
export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription,
): Date | null {
  if (subscription.items.data[0].current_period_end) {
    return new Date(subscription.items.data[0].current_period_end * 1000);
  }
  return null;
}

/**
 * ステータスを決定する関数（改善版）
 * @param subscription Stripeサブスクリプション
 * @returns サブスクリプションステータス
 */
export function getSubscriptionStatus(
  subscription: Stripe.Subscription,
): SubscriptionStatus {
  // キャンセル予定（期間終了時にキャンセル）の場合
  if (subscription.cancel_at_period_end) {
    return "CANCELED";
  }

  // Stripeのステータスベースで判定
  switch (subscription.status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIAL";
    case "paused":
      return "CANCELED";
    case "canceled":
      return "CANCELED";
    case "past_due":
      return "CANCELED";
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "CANCELED";
    default:
      console.warn("Unexpected subscription status:", subscription.status);
      return "CANCELED";
  }
}
