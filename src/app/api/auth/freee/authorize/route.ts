import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/features/auth/lib/auth";
import { generateFreeeAuthUrl } from "@/features/freee/lib/freee-oauth";

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

    // リダイレクトURI
    const authUrl = process.env.AUTH_URL;
    if (!authUrl) {
      return NextResponse.json(
        { error: "環境変数が設定されていません" },
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
