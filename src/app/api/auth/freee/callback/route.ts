import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/features/auth/lib/auth";
import { exchangeCodeForToken } from "@/features/freee/lib/freee-oauth";
import { saveFreeeToken } from "@/features/freee/repositories/freee-token-repository";

/**
 * freee OAuth コールバック処理
 */
export async function GET(request: NextRequest) {
  try {
    // ユーザー認証確認
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.redirect(
        new URL("/auth/login?error=unauthorized", request.url),
      );
    }

    // URLパラメータから認可コードとstateを取得
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // エラーチェック
    if (error) {
      console.error("freee auth callback error:", error);
      const returnTo =
        request.cookies.get("freee_oauth_return_to")?.value ?? "/";
      return NextResponse.redirect(
        new URL(`${returnTo}?error=freee_auth_denied`, request.url),
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/?error=invalid_callback", request.url),
      );
    }

    // CSRF対策：stateパラメータの検証
    const savedState = request.cookies.get("freee_oauth_state")?.value;
    if (!savedState || savedState !== state) {
      console.error("State mismatch:", { savedState, receivedState: state });
      return NextResponse.redirect(
        new URL("/?error=invalid_state", request.url),
      );
    }

    // リダイレクトURI
    const authUrl = process.env.AUTH_URL;
    if (!authUrl) {
      return NextResponse.redirect(
        new URL("/?error=invalid_config", request.url),
      );
    }
    const redirectUri = `${authUrl}/api/auth/freee/callback`;

    // 認可コードをアクセストークンに交換
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // トークンをデータベースに保存
    await saveFreeeToken(user.id, tokenData);

    // 元のページにリダイレクト
    const returnTo = request.cookies.get("freee_oauth_return_to")?.value ?? "/";

    const response = NextResponse.redirect(
      new URL(`${returnTo}?freee_connected=true`, request.url),
    );

    // Cookieをクリア
    response.cookies.delete("freee_oauth_state");
    response.cookies.delete("freee_oauth_return_to");

    return response;
  } catch (error) {
    console.error("freee auth callback error:", error);
    const returnTo = request.cookies.get("freee_oauth_return_to")?.value ?? "/";
    return NextResponse.redirect(
      new URL(`${returnTo}?error=freee_auth_failed`, request.url),
    );
  }
}
