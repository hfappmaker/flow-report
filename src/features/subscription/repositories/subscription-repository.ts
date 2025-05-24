import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/repositories/db";

export async function updateUserSubscription(
  userId: string,
  data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: SubscriptionStatus;
    trialEndsAt?: Date | null;
    currentPeriodEnd?: Date | null;
    hasUsedTrial?: boolean;
  },
) {
  return await db.user.update({
    where: { id: userId },
    data,
  });
}

export async function getUserSubscriptionInfo(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      hasUsedTrial: true,
    },
  });

  return user;
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  return await db.user.findUnique({
    where: { stripeCustomerId },
  });
}

export async function getUserByStripeSubscriptionId(
  stripeSubscriptionId: string,
) {
  return await db.user.findUnique({
    where: { stripeSubscriptionId },
  });
}
