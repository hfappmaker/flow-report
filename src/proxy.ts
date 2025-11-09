import { NextRequest } from "next/server";
import NextAuth from "next-auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  apiWebhookPrefix,
  authRoutes,
  errorRoutes,
} from "@/app/routes";
import authConfig from "@/features/auth/lib/auth-edge.config";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

const { auth } = NextAuth(authConfig);

console.log("proxy file is being loaded");
// サブスクリプション情報を取得する関数
async function getSubscriptionInfo(
  req: NextRequest,
): Promise<SubscriptionInfo | null> {
  const baseUrl = req.nextUrl.origin;
  const response = await fetch(`${baseUrl}/api/auth/get-subscription-info`, {
    headers: {
      Cookie: req.headers.get("cookie") ?? "",
    },
  });

  if (response.ok) {
    const data = (await response.json()) as SubscriptionInfo | null;
    if (!data) {
      return null;
    }
    return data;
  }

  console.error("Failed to fetch subscription status:", response.statusText);
  throw new Error("Failed to fetch subscription status");
}

// 認証済みユーザーのサブスクリプション状態をチェックし、必要に応じてリダイレクト
async function handleAuthenticatedUser(req: NextRequest) {
  const { nextUrl } = req;
  const isSubscriptionRoute = nextUrl.pathname === "/subscription";
  const isSubscriptionExpiredRoute =
    nextUrl.pathname === "/subscription/expired";
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  try {
    const subscriptionInfo = await getSubscriptionInfo(req);
    console.log("Subscription info retrieved:", subscriptionInfo);

    // サブスクリプション情報がない場合は、サブスクリプションページにリダイレクト
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!subscriptionInfo || subscriptionInfo.status === null) {
      console.log(
        "No subscription info found, redirecting to subscription page",
      );

      if (isSubscriptionRoute) {
        return;
      }

      return Response.redirect(new URL("/subscription", nextUrl));
    }

    const isExpired =
      subscriptionInfo.status == "CANCELED" &&
      !!subscriptionInfo.currentPeriodEnd &&
      new Date(subscriptionInfo.currentPeriodEnd) < new Date();
    // サブスクリプションが有効でない場合は、サブスクリプション期限切れページにリダイレクト
    if (isExpired) {
      console.log(
        "Subscription is expired, redirecting to expired subscription page",
      );

      if (isSubscriptionExpiredRoute) {
        return;
      }

      return Response.redirect(new URL("/subscription/expired", nextUrl));
    }

    console.log("User is authorized and subscription is valid");

    if (isAuthRoute || isSubscriptionRoute || isSubscriptionExpiredRoute) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    // 認証済みユーザーのリクエストをそのまま通過
    return;
  } catch (error) {
    console.error("Error fetching subscription info:", error);
    // リクエストを通過させ、Next.jsの通常のエラーハンドリングに任せる
    throw error;
  }
}

// 未認証ユーザーの処理
function handleUnauthenticatedUser(req: NextRequest) {
  const { nextUrl } = req;
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // 認証ルートの場合は何もしない
  if (isAuthRoute) {
    return;
  }

  // その他の場合はログインページにリダイレクト
  let callbackUrl = nextUrl.pathname;
  if (nextUrl.search) {
    callbackUrl += nextUrl.search;
  }

  const encodedCallbackUrl = encodeURIComponent(callbackUrl);
  console.log(
    "Redirecting unauthorized user to login with callback:",
    callbackUrl,
  );

  return Response.redirect(
    new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
  );
}

export default auth(async (req) => {
  console.log("proxy Request URL:", req.nextUrl.toString());
  console.log("proxy Request Method:", req.method);
  console.log(
    "proxy Request Headers:",
    Object.fromEntries(req.headers.entries()),
  );

  const { nextUrl } = req;
  const isAuthorized = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiWebhookRoute = nextUrl.pathname.startsWith(apiWebhookPrefix);
  const isErrorRoute = errorRoutes.includes(nextUrl.pathname);

  // エラールートの場合は何もしない
  if (isErrorRoute) {
    console.log(
      "Request is for an error route, skipping proxy processing.",
    );
    return;
  }

  // APIルートの場合はスキップ
  if (isApiAuthRoute || isApiWebhookRoute) {
    console.log("Request is for API route, skipping proxy processing.");
    return;
  }

  // 認証済みユーザーの処理
  if (isAuthorized) {
    return await handleAuthenticatedUser(req);
  }

  // 未認証ユーザーの処理
  return handleUnauthenticatedUser(req);
});

// Optionally, don't invoke proxy on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
