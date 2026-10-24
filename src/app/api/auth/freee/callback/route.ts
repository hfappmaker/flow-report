import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/features/auth/libs/auth";
import { exchangeCodeForToken } from "@/features/freee/libs/freee-oauth";
import {
  FREEE_OAUTH_RESULT_COOKIE,
  type FreeeOAuthResult,
  freeeOAuthResultCookieOptions,
  sanitizeReturnTo,
} from "@/features/freee/libs/freee-oauth-result";
import { saveFreeeToken } from "@/features/freee/repositories/freee-token-repository";
import { getAuthUrl } from "@/utils/get-app-url";

/**
 * 元のページへ戻すレスポンスを作る
 *
 * 結果はURLクエリではなくフラッシュ Cookie で渡し、戻り先URLをきれいなまま保つ。
 */
function redirectBack(request: NextRequest, result: FreeeOAuthResult) {
  const returnTo = sanitizeReturnTo(
    request.cookies.get("freee_oauth_return_to")?.value,
  );
  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set(
    FREEE_OAUTH_RESULT_COOKIE,
    result,
    freeeOAuthResultCookieOptions,
  );
  response.cookies.delete("freee_oauth_state");
  response.cookies.delete("freee_oauth_return_to");
  return response;
}

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
      return redirectBack(request, "denied");
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

    // リダイレクトURI（環境に応じて自動決定）
    let authUrl: string;
    try {
      authUrl = getAuthUrl();
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      return NextResponse.redirect(
        new URL("/?error=invalid_config", request.url),
      );
    }
    const redirectUri = `${authUrl}/api/auth/freee/callback`;

    // 認可コードをアクセストークンに交換
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // トークンをデータベースに保存
    await saveFreeeToken(user.id, tokenData);

    // 元のページにリダイレクト（Cookie もここでクリア）
    return redirectBack(request, "connected");
  } catch (error) {
    console.error("freee auth callback error:", error);
    return redirectBack(request, "failed");
  }
}
