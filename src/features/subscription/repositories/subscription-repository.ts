import type {
  StripeCustomer,
  Subscription,
  SubscriptionStatus,
  User,
} from "@prisma/client";

import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";

// StripeCustomer関連の操作
export async function upsertStripeCustomer(
  userId: string,
  stripeCustomerId: string,
  created: Date,
): Promise<Result<StripeCustomer>> {
  try {
    // 既存のStripeCustomerをstripeCustomerIdで検索
    const existingCustomer = await db.stripeCustomer.findUnique({
      where: { stripeCustomerId },
    });

    if (existingCustomer && created < existingCustomer.created) {
      return ok(existingCustomer); // 既存のレコードが新しい場合は何もしない
    }

    const customer = await db.stripeCustomer.upsert({
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
    return ok(customer);
  } catch (error) {
    console.error("Error upserting stripe customer:", error);
    return err("Stripe顧客情報の更新に失敗しました");
  }
}

export async function getStripeCustomerByUserId(
  userId: string,
): Promise<Result<StripeCustomer | null>> {
  try {
    const customer = await db.stripeCustomer.findUnique({
      where: { userId },
    });
    return ok(customer);
  } catch (error) {
    console.error("Error fetching stripe customer by user id:", error);
    return err("Stripe顧客情報の取得に失敗しました");
  }
}

export async function upsertUserSubscription(
  stripeCustomerId: string,
  data: {
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    cancelAt?: Date | null;
  },
  created: Date,
): Promise<Result<Subscription>> {
  try {
    const stripeSubscription = await db.subscription.findUnique({
      where: { stripeSubscriptionId: data.stripeSubscriptionId },
    });

    if (stripeSubscription && created < stripeSubscription.created) {
      return ok(stripeSubscription); // 既存のレコードが新しい場合は何もしない
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

    return ok(result);
  } catch (error) {
    console.error("Error upserting user subscription:", error);
    return err("サブスクリプション情報の更新に失敗しました");
  }
}

export async function getSubscriptionInfoByUserId(
  userId: string,
): Promise<Result<Subscription | null>> {
  try {
    const stripeCustomer = await db.stripeCustomer.findUnique({
      where: { userId },
    });

    if (!stripeCustomer) {
      return ok(null);
    }

    // 手動でSubscriptionを取得
    const subscription = await db.subscription.findFirst({
      where: { stripeCustomerId: stripeCustomer.stripeCustomerId },
      orderBy: { created: "desc" },
    });

    return ok(subscription ?? null);
  } catch (error) {
    console.error("Error fetching subscription info by user id:", error);
    return err("サブスクリプション情報の取得に失敗しました");
  }
}

export async function getUserByStripeCustomerId(
  stripeCustomerId: string,
): Promise<Result<User | null>> {
  try {
    const stripeCustomer = await db.stripeCustomer.findUnique({
      where: { stripeCustomerId },
    });

    if (!stripeCustomer?.userId) {
      return ok(null);
    }

    // 手動でUserを取得
    const user = await db.user.findUnique({
      where: { id: stripeCustomer.userId },
    });

    return ok(user);
  } catch (error) {
    console.error("Error fetching user by stripe customer id:", error);
    return err("ユーザー情報の取得に失敗しました");
  }
}
