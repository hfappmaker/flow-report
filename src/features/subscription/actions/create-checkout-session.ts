"use server";
import Stripe from "stripe";

import { currentUser } from "@/features/auth/libs/auth";
import {
  stripe,
  TRIAL_PERIOD_DAYS,
  getStripeEnv,
} from "@/features/subscription/libs/stripe";
import {
  getSubscriptionInfoByUserId,
  getStripeCustomerByUserId,
} from "@/features/subscription/repositories/subscription-repository";
import { CheckoutSessionResult } from "@/features/subscription/types/subscription";
import { getAppUrl } from "@/utils/get-app-url";

export async function createCheckoutSession(): Promise<CheckoutSessionResult> {
  try {
    console.log("Creating checkout session...");
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

    // アプリケーションのベースURLを取得（環境に応じて自動決定）
    let baseUrl: string;
    try {
      baseUrl = getAppUrl();
    } catch (error) {
      console.error("Failed to get application URL:", error);
      return { error: "サーバー設定エラーが発生しました" };
    }

    const subscriptionInfoResult = await getSubscriptionInfoByUserId(user.id);
    if (!subscriptionInfoResult.success) {
      console.error(
        "Error fetching subscription info:",
        subscriptionInfoResult.error,
      );
      return { error: subscriptionInfoResult.error };
    }
    const subscriptionInfo = subscriptionInfoResult.data;

    // 既に有効なサブスクリプションがある場合
    if (subscriptionInfo?.status === "active") {
      return { error: "既に有効なサブスクリプションがあります" };
    }

    // StripeCustomer情報を取得
    const stripeCustomerResult = await getStripeCustomerByUserId(user.id);
    if (!stripeCustomerResult.success) {
      console.error(
        "Error fetching stripe customer:",
        stripeCustomerResult.error,
      );
      return { error: stripeCustomerResult.error };
    }
    let customerId = stripeCustomerResult.data?.stripeCustomerId;

    // Stripeカスタマーが存在しない場合は作成（API呼び出しを最小限に）
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // トライアル期間の設定
    const trialPeriodDays = !subscriptionInfo ? TRIAL_PERIOD_DAYS : undefined;

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
          },
        },
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
