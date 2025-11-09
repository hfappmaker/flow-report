// Use type-only import to avoid bundling Prisma Client in proxy
import type { SubscriptionStatus } from "@prisma/client";

export interface SubscriptionInfo {
  status: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
}

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
