import axios from "axios";

import {
  getFreeeToken,
  saveFreeeToken,
} from "@/features/freee/repositories/freee-token-repository";
import type {
  FreeeTokenResponse,
  FreeeTokenData,
} from "@/features/freee/types/freee-types";

/**
 * freee OAuth認可URLを生成
 */
export function generateFreeeAuthUrl(
  redirectUri: string,
  state: string,
): string {
  const clientId = process.env.AUTH_FREEE_ID;
  const baseUrl = process.env.FREEE_OAUTH_BASE_URL;

  if (!clientId || !baseUrl) {
    throw new Error("freee OAuth環境変数が設定されていません");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    prompt: "select_company",
  });

  return `${baseUrl}/authorize?${params.toString()}`;
}

/**
 * 認可コードをアクセストークンに交換
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<FreeeTokenData> {
  const baseUrl = process.env.FREEE_OAUTH_BASE_URL;
  const clientId = process.env.AUTH_FREEE_ID;
  const clientSecret = process.env.AUTH_FREEE_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error("freee OAuth環境変数が設定されていません");
  }

  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post<FreeeTokenResponse>(
      `${baseUrl}/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // トークンレスポンスから必要な情報を抽出
    const tokenData = response.data;
    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in;

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      companyId: tokenData.company_id,
      scope: tokenData.scope,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("freee token exchange error:", error.response?.data);
      const errorData = error.response?.data as
        | { error_description?: string }
        | undefined;
      const errorDescription = errorData?.error_description;
      throw new Error(
        `トークンの取得に失敗しました: ${errorDescription ?? error.message}`,
      );
    }
    throw error;
  }
}

/**
 * リフレッシュトークンで新しいアクセストークンを取得
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<FreeeTokenData> {
  const baseUrl = process.env.FREEE_OAUTH_BASE_URL;
  const clientId = process.env.AUTH_FREEE_ID;
  const clientSecret = process.env.AUTH_FREEE_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error("freee OAuth環境変数が設定されていません");
  }

  try {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });

    const response = await axios.post<FreeeTokenResponse>(
      `${baseUrl}/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const tokenData = response.data;
    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in;

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      companyId: tokenData.company_id,
      scope: tokenData.scope,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("freee token refresh error:", error.response?.data);
      const errorData = error.response?.data as
        | { error_description?: string }
        | undefined;
      const errorDescription = errorData?.error_description;
      throw new Error(
        `トークンのリフレッシュに失敗しました: ${errorDescription ?? error.message}`,
      );
    }
    throw error;
  }
}

/**
 * 有効なアクセストークンを取得（必要に応じてリフレッシュ）
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const tokenResult = await getFreeeToken(userId);

  if (!tokenResult.success) {
    throw new Error(tokenResult.error);
  }

  let tokenData = tokenResult.data;

  if (!tokenData) {
    throw new Error("freeeとの連携が必要です");
  }

  // トークンの有効期限をチェック
  if (isTokenExpired(tokenData.expiresAt)) {
    // トークンをリフレッシュ
    try {
      tokenData = await refreshAccessToken(tokenData.refreshToken);
      const saveResult = await saveFreeeToken(userId, tokenData);
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }
    } catch (error) {
      console.error("Failed to refresh freee token:", error);
      throw new Error(
        "freeeトークンのリフレッシュに失敗しました。再度連携してください。",
      );
    }
  }

  return tokenData.accessToken;
}

/**
 * アクセストークンが有効かチェック
 */
export function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  // 5分のバッファを持たせる
  return now >= expiresAt - 300;
}
