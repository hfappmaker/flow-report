import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/features/auth/lib/auth";
import { generateFreeeAuthUrl } from "@/features/freee/lib/freee-oauth";
import { getAuthUrl } from "@/utils/get-app-url";

/**
 * freee OAuth認可URLへリダイレクト
 */
export async function GET(request: NextRequest) {
  try {
    // ユーザー認証確認
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リダイレクトURI（環境に応じて自動決定）
    let authUrl: string;
    try {
      authUrl = getAuthUrl();
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      return NextResponse.json(
        { error: "認証URLの取得に失敗しました" },
        { status: 500 },
      );
    }
    const redirectUri = `${authUrl}/api/auth/freee/callback`;

    // CSRFトークン（stateパラメータ）を生成
    const state = crypto.randomUUID();

    // stateをセッションに保存（HTTPOnly Cookieとして）
    const response = NextResponse.redirect(
      generateFreeeAuthUrl(redirectUri, state),
    );

    response.cookies.set("freee_oauth_state", state, {
      httpOnly: true,
      secure: process.env.VERCEL_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10分
      path: "/",
    });

    // 元のページURLを保存（認証後に戻るため）
    const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/";
    response.cookies.set("freee_oauth_return_to", returnTo, {
      httpOnly: true,
      secure: process.env.VERCEL_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("freee auth authorize error:", error);
    return NextResponse.json(
      { error: "認可リクエストの作成に失敗しました" },
      { status: 500 },
    );
  }
}
