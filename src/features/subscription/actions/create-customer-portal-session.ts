"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { stripe } from "@/features/subscription/libs/stripe";
import { getStripeCustomerByUserId } from "@/features/subscription/repositories/subscription-repository";
import { CustomerPortalSessionResult } from "@/features/subscription/types/subscription";
import { getAppUrl } from "@/utils/get-app-url";

export async function createCustomerPortalSession(): Promise<CustomerPortalSessionResult> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { error: "認証が必要です" };
    }

    const stripeCustomer = await getStripeCustomerByUserId(user.id);

    if (!stripeCustomer?.stripeCustomerId) {
      return { error: "顧客情報が見つかりません" };
    }

    // アプリケーションのベースURLを取得（環境に応じて自動決定）
    let baseUrl: string;
    try {
      baseUrl = getAppUrl();
    } catch (error) {
      console.error("Failed to get application URL:", error);
      return { error: "サーバー設定エラーが発生しました" };
    }

    console.log(
      "Creating customer portal session for user:",
      user.id,
      "with customer ID:",
      stripeCustomer.stripeCustomerId,
    );

    // カスタマーポータルセッションを作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      return_url: `${baseUrl}/subscription`,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Failed to create customer portal session:", error);
    return {
      error: `カスタマーポータルの作成に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
