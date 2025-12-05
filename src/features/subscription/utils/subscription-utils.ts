import type { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

/**
 * Stripeのサブスクリプションステータスをそのまま返す（型安全性のため）
 * @param subscription Stripeサブスクリプション
 * @returns サブスクリプションステータス
 */
export function getSubscriptionStatus(
  subscription: Stripe.Subscription,
): SubscriptionStatus {
  // SubscriptionStatus enumの値と一致していることを確認
  const validStatuses: SubscriptionStatus[] = [
    "active",
    "trialing",
    "canceled",
    "past_due",
    "unpaid",
    "paused",
    "incomplete",
    "incomplete_expired",
  ];

  if (validStatuses.includes(subscription.status as SubscriptionStatus)) {
    return subscription.status as SubscriptionStatus;
  }

  console.warn("Unexpected subscription status:", subscription.status);
  return "canceled";
}

/**
 * cancel_atを取得
 * @param subscription Stripeサブスクリプション
 * @returns キャンセル予定日時またはnull
 */
export function getSubscriptionCancelAt(
  subscription: Stripe.Subscription,
): Date | null {
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  return null;
}

/**
 * cancel_atから表示用のメッセージを生成
 * @param cancelAt キャンセル予定日時
 * @returns 表示用メッセージまたはnull
 */
export function formatCancelAtMessage(cancelAt: Date | null): string | null {
  if (!cancelAt) return null;

  const formatted = cancelAt.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return `${formatted}にキャンセル`;
}

/**
 * サブスクリプションが有効かどうかを判定
 * @param status サブスクリプションステータス
 * @param cancelAt キャンセル予定日時
 * @returns 有効ならtrue
 */
export function isSubscriptionValid(
  status: SubscriptionStatus | null,
  cancelAt: Date | null,
): boolean {
  if (!status) return false;

  // activeまたはtrialingなら有効
  if (status === "active" || status === "trialing") {
    return true;
  }

  return false;
}
