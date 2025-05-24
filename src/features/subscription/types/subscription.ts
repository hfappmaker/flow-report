import type { SubscriptionStatus } from "@prisma/client";

export type SubscriptionInfo = {
  status: SubscriptionStatus | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  hasUsedTrial: boolean;
  isTrialActive: boolean;
  daysLeftInTrial: number | null;
};

export type CreateSubscriptionResult = {
  success?: boolean;
  error?: string;
  subscriptionId?: string;
  clientSecret?: string;
};

export type CancelSubscriptionResult = {
  success?: boolean;
  error?: string;
};

export type CheckoutSessionResult = {
  sessionId?: string;
  url?: string;
  error?: string;
};
