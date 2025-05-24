import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { edgeAuth } from "@/features/auth/lib/edge-auth";

// 認証不要のパス
const publicPaths = ["/auth/login", "/auth/register", "/auth/error", "/auth/reset", "/auth/new-verification"];
const subscriptionPaths = ["/subscription", "/api/webhooks/stripe", "/api/auth/check-subscription"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公開パスとサブスクリプション関連パスはスキップ
  if (publicPaths.some(path => pathname.startsWith(path)) || 
      subscriptionPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // セッションを確認
  const session = await edgeAuth();
  
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // サブスクリプション情報を確認
  try {
    const response = await fetch(new URL("/api/auth/check-subscription", request.url));
    const data = await response.json();

    if (data.needsSubscription) {
      return NextResponse.redirect(new URL("/subscription/expired", request.url));
    }
  } catch (error) {
    console.error("Error checking subscription:", error);
    // エラーの場合はアクセスを許可（フォールバック）
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 