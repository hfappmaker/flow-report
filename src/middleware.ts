import NextAuth from "next-auth";
import { NextRequest } from "next/server";

import authConfig from "@/features/auth/lib/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  apiWebhookPrefix,
  authRoutes,
  publicRoutes,
} from "@/app/routes";

const { auth } = NextAuth(authConfig);

console.log("Middleware file is being loaded");

// サブスクリプション情報を取得する関数
async function checkSubscriptionStatus(req: NextRequest): Promise<{
  needsSubscription: boolean;
  subscriptionInfo: any;
} | null> {
  try {
    const baseUrl = req.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/auth/check-subscription`, {
      headers: {
        'Cookie': req.headers.get('cookie') || '',
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

export default auth(async (req) => {
  console.log("=== Middleware Execution Start ===");
  console.log("Request URL:", req.nextUrl.toString());
  console.log("Request Method:", req.method);
  console.log("Request Headers:", Object.fromEntries(req.headers.entries()));
  
  const { nextUrl } = req;
  console.log("Middleware executing for path:", nextUrl.pathname);
  console.log("Is authorized:", !!req.auth);
  console.log("Is API auth route:", nextUrl.pathname.startsWith(apiAuthPrefix));
  console.log("Is API webhook route:", nextUrl.pathname.startsWith(apiWebhookPrefix));
  console.log("Is public route:", publicRoutes.includes(nextUrl.pathname));
  console.log("Is auth route:", authRoutes.includes(nextUrl.pathname));

  const isAuthorized = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiWebhookRoute = nextUrl.pathname.startsWith(apiWebhookPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isSubscriptionRoute = nextUrl.pathname === "/subscription";
  const isSubscriptionExpiredRoute = nextUrl.pathname === "/subscription/expired";

  if (isApiAuthRoute || isApiWebhookRoute) {
    console.log("Skipping middleware for API route");
    return;
  }

  if (isAuthorized) {
    // サブスクリプション状態のチェック
    try {
      console.log("Checking subscription for authorized user");
      const subscriptionResult = await checkSubscriptionStatus(req);
      
      if (subscriptionResult) {
        const { needsSubscription, subscriptionInfo } = subscriptionResult;
        console.log("Subscription needs:", needsSubscription);
        console.log("Subscription status:", subscriptionInfo?.status);
        console.log("Is trial active:", subscriptionInfo?.isTrialActive);
        
        // サブスクリプションが必要な場合の処理
        if (needsSubscription) {
          // 既にサブスクリプションページにいる場合は何もしない
          if (isSubscriptionRoute || isSubscriptionExpiredRoute) {
            console.log("User is already on subscription page");
            return;
          }
          
          // トライアル期間が終了した場合は専用ページにリダイレクト
          if (subscriptionInfo?.hasUsedTrial && !subscriptionInfo?.isTrialActive) {
            console.log("Redirecting to subscription expired page");
            return Response.redirect(new URL("/subscription/expired", nextUrl));
          }
          
          // その他の場合は通常のサブスクリプションページにリダイレクト
          console.log("Redirecting to subscription page");
          return Response.redirect(new URL("/subscription", nextUrl));
        } else {
          // サブスクリプションが有効な場合、サブスクリプションページからリダイレクト
          if (isSubscriptionRoute || isSubscriptionExpiredRoute) {
            console.log("Redirecting from subscription page to dashboard");
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
          }
        }
      }
      else if(!isSubscriptionRoute){
        console.log("No subscription needed");
        console.log("Redirecting to subscription page");
        return Response.redirect(new URL("/subscription", nextUrl));
      }
    } catch (error) {
      console.error("Subscription check error:", error);
      // エラーの場合は通常通り処理を続行
    }

    return;
  }

  if (!isPublicRoute && !isAuthRoute) {
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

  console.log("=== Middleware Execution End ===");
  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};