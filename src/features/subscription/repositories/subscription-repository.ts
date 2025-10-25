import type { SubscriptionStatus } from "@prisma/client";

import { getUserById } from "@/features/auth/repositories/user-repository";
import { db } from "@/repositories/db";

// StripeCustomer関連の操作
export async function upsertStripeCustomer(
  userId: string,
  stripeCustomerId: string,
  created: Date,
) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error(`User with ID ${userId} does not exist`);
  }

  const stripeCustomer = await getStripeCustomerByUserId(userId);
  if (stripeCustomer && created < stripeCustomer.created) {
    return stripeCustomer; // 既存のレコードが新しい場合は何もしない
  }

  return await db.stripeCustomer.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      created,
    },
    update: {
      stripeCustomerId,
      created,
    },
  });
}

export async function getStripeCustomerByUserId(userId: string) {
  return await db.stripeCustomer.findUnique({
    where: { userId },
  });
}

export async function upsertUserSubscription(
  stripeCustomerId: string,
  data: {
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date | null;
  },
  created: Date,
) {
  const stripeSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: data.stripeSubscriptionId },
  });

  if (stripeSubscription && created < stripeSubscription.created) {
    return stripeSubscription; // 既存のレコードが新しい場合は何もしない
  }

  return await db.subscription.upsert({
    where: { stripeSubscriptionId: data.stripeSubscriptionId },
    create: {
      stripeCustomerId,
      created,
      ...data,
    },
    update: { created, ...data },
  });
}

export async function getSubscriptionInfoByUserId(userId: string) {
  // Validate that the user exists before attempting to get subscription info
  const user = await getUserById(userId);
  if (!user) {
    throw new Error(`User with ID ${userId} does not exist`);
  }

  const stripeCustomer = await db.stripeCustomer.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1, // 最新のサブスクリプションを取得
      },
    },
  });

  return stripeCustomer?.subscriptions[0] ?? null;
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const stripeCustomer = await db.stripeCustomer.findUnique({
    where: { stripeCustomerId },
    include: { user: true },
  });
  return stripeCustomer?.user;
}
