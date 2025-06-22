"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { stripe, TRIAL_PERIOD_DAYS } from "@/features/subscription/libs/stripe";
import {
  getUserSubscriptionInfo,
  updateUserSubscription,
} from "@/features/subscription/repositories/subscription-repository";
import { CheckoutSessionResult } from "@/features/subscription/types/subscription";

export async function createCheckoutSession(): Promise<CheckoutSessionResult> {
  try {
    const user = await currentUser();
    if (!user?.id || !user.email) {
      return { error: "認証が必要です" };
    }

    let subscriptionInfo;
    try {
      subscriptionInfo = await getUserSubscriptionInfo(user.id);
    } catch (error) {
      if (error instanceof Error && error.message.includes("does not exist")) {
        return { error: "ユーザー情報が見つかりません。再度ログインしてください。" };
      }
      throw error;
    }

    // 既に有効なサブスクリプションがある場合
    if (subscriptionInfo?.status === "ACTIVE") {
      return { error: "既に有効なサブスクリプションがあります" };
    }

    let customerId = subscriptionInfo?.stripeCustomerId;

    // Stripeカスタマーが存在しない場合は作成（API呼び出しを最小限に）
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // カスタマーIDを保存
      try {
        await updateUserSubscription(user.id, {
          stripeCustomerId: customerId,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes("does not exist")) {
          return { error: "ユーザー情報が見つかりません。再度ログインしてください。" };
        }
        throw error;
      }
    }

    // トライアル期間の設定
    const trialPeriodDays = subscriptionInfo?.hasUsedTrial
      ? undefined
      : TRIAL_PERIOD_DAYS;

    // チェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
      subscription_data: {
        trial_period_days: trialPeriodDays,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel'
          }
        }
      },
      metadata: {
        userId: user.id,
      },
    });

    return {
      sessionId: session.id,
      url: session.url ?? undefined,
    };
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return { error: "チェックアウトセッションの作成に失敗しました" };
  }
}
