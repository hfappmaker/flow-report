import Stripe from "stripe";

// Stripe APIクライアントの初期化
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-08-27.basil",
});

// 定数
export const TRIAL_PERIOD_DAYS = 30; // 1ヶ月のトライアル期間
export const SUBSCRIPTION_PRICE = 500; // 月額500円

// 環境変数の型定義
type StripeEnvVars = {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
};

// 環境変数の検証
export const getStripeEnv = (): StripeEnvVars => {
  const requiredEnvVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  // 型アサーション：すべての環境変数が存在することを確認済み
  return requiredEnvVars as StripeEnvVars;
};
