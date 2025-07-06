"use server";
import Stripe from "stripe";

import { currentUser } from "@/features/auth/lib/auth";
import { stripe, TRIAL_PERIOD_DAYS, getStripeEnv } from "@/features/subscription/libs/stripe";
import {
  getUserSubscriptionInfo,
  upsertUserSubscription,
} from "@/features/subscription/repositories/subscription-repository";
import { CheckoutSessionResult } from "@/features/subscription/types/subscription";

export async function createCheckoutSession(): Promise<CheckoutSessionResult> {
  try {
    const user = await currentUser();
    if (!user?.id || !user.email) {
      return { error: "認証が必要です" };
    }

    // 環境変数を安全に取得
    let stripeEnv;
    try {
      stripeEnv = getStripeEnv();
    } catch (error) {
      console.error("Stripe environment variables not configured:", error);
      return { error: "サーバー設定エラーが発生しました" };
    }

    // アプリケーションのベースURLを取得
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not defined");
      return { error: "サーバー設定エラーが発生しました" };
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
        await upsertUserSubscription(user.id, {
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
    const trialPeriodDays = !subscriptionInfo
        ? TRIAL_PERIOD_DAYS
        : undefined;

    // チェックアウトセッションを作成
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripeEnv.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/dashboard`,
      cancel_url: `${baseUrl}/subscription`,
      metadata: {
        userId: user.id,
      },
    };

    // トライアル期間がある場合のみ追加
    if (trialPeriodDays) {
      sessionConfig.subscription_data = {
        trial_period_days: trialPeriodDays,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          }
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      sessionId: session.id,
      url: session.url ?? undefined,
    };
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return { error: "チェックアウトセッションの作成に失敗しました" };
  }
}
