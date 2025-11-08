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
 * Stripeのサブスクリプションステータスをアプリケーション側のステータスにマップ
 * 複数のStripeステータス（paused, canceled, past_due等）は
 * アプリケーションでは統一的に「CANCELED」として扱う
 * @param subscription Stripeサブスクリプション
 * @returns サブスクリプションステータス (ACTIVE | TRIAL | CANCELED)
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
    case "canceled":
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      // これらのStripeステータスはすべて無効な契約として扱う
      return "CANCELED";
    default:
      console.warn("Unexpected subscription status:", subscription.status);
      return "CANCELED";
  }
}
