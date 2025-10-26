import type { SubscriptionStatus } from "@prisma/client";

import { db } from "@/repositories/db";

// StripeCustomer関連の操作
export async function upsertStripeCustomer(
  userId: string,
  stripeCustomerId: string,
  created: Date,
) {
  // 既存のStripeCustomerをstripeCustomerIdで検索
  const existingCustomer = await db.stripeCustomer.findUnique({
    where: { stripeCustomerId },
  });

  if (existingCustomer && created < existingCustomer.created) {
    return existingCustomer; // 既存のレコードが新しい場合は何もしない
  }

  return await db.stripeCustomer.upsert({
    where: { stripeCustomerId },
    create: {
      userId,
      stripeCustomerId,
      created,
    },
    update: {
      userId,
      stripeCustomerId,
      created,
    },
  });
}

export async function getStripeCustomerByUserId(userId: string) {
  return await db.stripeCustomer.findUnique({
    where: { userId }
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

  const result = await db.subscription.upsert({
    where: { stripeSubscriptionId: data.stripeSubscriptionId },
    create: {
      stripeCustomerId,
      created,
      ...data,
    },
    update: { created, ...data },
  });

  // Subscription更新後、該当ユーザーのキャッシュを無効化
  // const user = await getUserByStripeCustomerId(stripeCustomerId);
  // if (user) {
  //   await invalidateSubscriptionCache(user.id);
  // }

  return result;
}

export async function getSubscriptionInfoByUserId(userId: string) {
  const stripeCustomer = await db.stripeCustomer.findUnique({
    where: { userId },
    // cacheStrategy: {
    //   ttl: 60,
    //   tags: [`subscription_user_${userId}`],
    // },
  });

  if (!stripeCustomer) {
    return null;
  }

  // 手動でSubscriptionを取得
  const subscription = await db.subscription.findFirst({
    where: { stripeCustomerId: stripeCustomer.stripeCustomerId },
    orderBy: { created: "desc" },
  });

  return subscription ?? null;
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const stripeCustomer = await db.stripeCustomer.findUnique({
    where: { stripeCustomerId },
  });

  if (!stripeCustomer?.userId) {
    return null;
  }

  // 手動でUserを取得
  const user = await db.user.findUnique({
    where: { id: stripeCustomer.userId },
  });

  return user;
}
