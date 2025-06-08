import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/repositories/db";

export async function updateUserSubscription(
  userId: string,
  data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status?: SubscriptionStatus;
    trialEndsAt?: Date | null;
    currentPeriodEnd?: Date | null;
    hasUsedTrial?: boolean;
  },
) {
  return await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: data,
  });
}

export async function getUserSubscriptionInfo(userId: string) {
  return await db.subscription.findUnique({
    where: { userId },
  });
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const subscription = await db.subscription.findUnique({
    where: { stripeCustomerId },
    include: { user: true },
  });
  return subscription?.user;
}

export async function getUserByStripeSubscriptionId(
  stripeSubscriptionId: string,
) {
  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId },
    include: { user: true },
  });
  return subscription?.user;
}
