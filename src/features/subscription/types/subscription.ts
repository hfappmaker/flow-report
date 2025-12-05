// Use type-only import to avoid bundling Prisma Client in proxy
import type { SubscriptionStatus } from "@prisma/client";

export interface SubscriptionInfo {
  status: SubscriptionStatus | null;
  cancelAt: Date | null;
}

export const STATUS_DISPLAY_MAP: Record<SubscriptionStatus, string> = {
  active: "ご利用中",
  trialing: "トライアル期間中",
  canceled: "キャンセル済み",
  past_due: "支払い期限超過",
  unpaid: "未支払い",
  paused: "一時停止",
  incomplete: "設定未完了",
  incomplete_expired: "設定期限切れ",
};

export interface CreateSubscriptionResult {
  success?: boolean;
  error?: string;
  subscriptionId?: string;
  clientSecret?: string;
}

export interface CheckoutSessionResult {
  sessionId?: string;
  url?: string;
  error?: string;
}

export interface CustomerPortalSessionResult {
  url?: string;
  error?: string;
}
