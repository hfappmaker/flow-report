"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { stripe } from "@/features/subscription/libs/stripe";
import { getUserSubscriptionInfo } from "@/features/subscription/repositories/subscription-repository";
import { CustomerPortalSessionResult } from "@/features/subscription/types/subscription";

export async function createCustomerPortalSession(): Promise<CustomerPortalSessionResult> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { error: "認証が必要です" };
    }

    const subscriptionInfo = await getUserSubscriptionInfo(user.id);
    
    if (!subscriptionInfo?.stripeCustomerId) {
      return { error: "サブスクリプション情報が見つかりません" };
    }

    // アプリケーションのベースURLを取得
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      return { error: "サーバー設定エラーが発生しました" };
    }

    // カスタマーポータルセッションを作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscriptionInfo.stripeCustomerId,
      return_url: `${baseUrl}/subscription`,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Failed to create customer portal session:", error);
    return { 
      error: `カスタマーポータルの作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
} 