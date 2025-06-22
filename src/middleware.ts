import { NextRequest } from "next/server";
import NextAuth from "next-auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  apiWebhookPrefix,
  authRoutes,
  publicRoutes,
} from "@/app/routes";
import authConfig from "@/features/auth/lib/auth.config";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

const { auth } = NextAuth(authConfig);

console.log("Middleware file is being loaded");

// サブスクリプション情報を取得する関数
async function checkSubscriptionStatus(req: NextRequest): Promise<{
  needsSubscription: boolean;
  subscriptionInfo: SubscriptionInfo;
} | null> {
  try {
    const baseUrl = req.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/auth/check-subscription`, {
      headers: {
        'Cookie': req.headers.get('cookie') ?? '',
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to check subscription status:", error);
  }
  return null;
}

// 認証済みユーザーのサブスクリプション状態をチェックし、必要に応じてリダイレクト
async function handleAuthenticatedUser(req: NextRequest) {
  const { nextUrl } = req;
  const isSubscriptionRoute = nextUrl.pathname === "/subscription";
  const isSubscriptionExpiredRoute = nextUrl.pathname === "/subscription/expired";

  try {
    console.log("Checking subscription for authorized user");
    const subscriptionResult = await checkSubscriptionStatus(req);
    
    // サブスクリプション情報の取得に失敗した場合
    if (!subscriptionResult) {
      console.log("Failed to get subscription info, blocking access for security");
      // セキュリティ上の理由で、サブスクリプションページ以外はブロック
      if (!isSubscriptionRoute && !isSubscriptionExpiredRoute) {
        return Response.redirect(new URL("/subscription", nextUrl));
      }
      // サブスクリプションページでもエラー状態では制限的にアクセスを許可
      return null;
    }

    const { needsSubscription, subscriptionInfo } = subscriptionResult;
    console.log("Subscription needs:", needsSubscription);
    console.log("Subscription status:", subscriptionInfo.status);
    console.log("Is trial active:", subscriptionInfo.isTrialActive);
    
    // サブスクリプションが不要な場合（有効なサブスクリプションまたはトライアル中）
    if (!needsSubscription) {
      // サブスクリプションページにいる場合はダッシュボードにリダイレクト
      if (isSubscriptionRoute || isSubscriptionExpiredRoute) {
        console.log("Redirecting from subscription page to dashboard");
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }
      // その他のページへのアクセスを許可
      return null;
    }

    // サブスクリプションが必要な場合
    // 既にサブスクリプションページにいる場合は何もしない
    if (isSubscriptionRoute || isSubscriptionExpiredRoute) {
      console.log("User is already on subscription page");
      return null;
    }
    
    // トライアル期間が終了した場合は専用ページにリダイレクト
    if (subscriptionInfo.hasUsedTrial && !subscriptionInfo.isTrialActive) {
      console.log("Redirecting to subscription expired page");
      return Response.redirect(new URL("/subscription/expired", nextUrl));
    }
    
    // その他の場合は通常のサブスクリプションページにリダイレクト
    console.log("Redirecting to subscription page");
    return Response.redirect(new URL("/subscription", nextUrl));

  } catch (error) {
    console.error("Subscription check error:", error);
    // エラーの場合はセキュリティ上の理由でサブスクリプションページにリダイレクト
    if (!isSubscriptionRoute && !isSubscriptionExpiredRoute) {
      console.log("Error occurred, redirecting to subscription page for security");
      return Response.redirect(new URL("/subscription", nextUrl));
    }
    return null;
  }
}

// 未認証ユーザーの処理
function handleUnauthenticatedUser(req: NextRequest) {
  const { nextUrl } = req;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // パブリックルートまたは認証ルートの場合は何もしない
  if (isPublicRoute || isAuthRoute) {
    return null;
  }

  // その他の場合はログインページにリダイレクト
  let callbackUrl = nextUrl.pathname;
  if (nextUrl.search) {
    callbackUrl += nextUrl.search;
  }

  const encodedCallbackUrl = encodeURIComponent(callbackUrl);
  console.log("Redirecting unauthorized user to login with callback:", callbackUrl);

  return Response.redirect(
    new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
  );
}

export default auth(async (req) => {
  console.log("=== Middleware Execution Start ===");
  console.log("Request URL:", req.nextUrl.toString());
  console.log("Request Method:", req.method);
  console.log("Request Headers:", Object.fromEntries(req.headers.entries()));
  
  const { nextUrl } = req;
  console.log("Middleware executing for path:", nextUrl.pathname);

  const isAuthorized = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiWebhookRoute = nextUrl.pathname.startsWith(apiWebhookPrefix);

  console.log("Is authorized:", isAuthorized);
  console.log("Is API auth route:", isApiAuthRoute);
  console.log("Is API webhook route:", isApiWebhookRoute);

  // APIルートの場合はスキップ
  if (isApiAuthRoute || isApiWebhookRoute) {
    console.log("Skipping middleware for API route");
    return;
  }

  // 認証済みユーザーの処理
  if (isAuthorized) {
    const result = await handleAuthenticatedUser(req);
    if (result) return result;
    console.log("=== Middleware Execution End ===");
    return;
  }

  // 未認証ユーザーの処理
  const result = handleUnauthenticatedUser(req);
  if (result) return result;

  console.log("=== Middleware Execution End ===");
  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};