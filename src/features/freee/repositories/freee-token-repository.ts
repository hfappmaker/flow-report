import type { FreeeTokenData } from "@/features/freee/types/freee-types";
import { baseDb } from "@/repositories/base-db";

/**
 * ユーザーのfreeeトークンを取得
 */
export async function getFreeeToken(
  userId: string,
): Promise<FreeeTokenData | null> {
  const account = await baseDb.account.findFirst({
    where: {
      userId: userId,
      provider: "freee",
    },
  });

  if (!account) {
    return null;
  }

  if (
    !account.access_token ||
    !account.refresh_token ||
    !account.expires_at ||
    !account.providerAccountId
  ) {
    return null;
  }

  return {
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
    expiresAt: account.expires_at,
    companyId: parseInt(account.providerAccountId, 10),
    scope: account.scope ?? "",
  };
}

/**
 * freeeトークンを保存
 */
export async function saveFreeeToken(
  userId: string,
  tokenData: FreeeTokenData,
): Promise<void> {
  await baseDb.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "freee",
        providerAccountId: tokenData.companyId.toString(),
      },
    },
    create: {
      userId: userId,
      type: "oauth",
      provider: "freee",
      providerAccountId: tokenData.companyId.toString(),
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      expires_at: tokenData.expiresAt,
      token_type: "Bearer",
      scope: tokenData.scope,
    },
    update: {
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      expires_at: tokenData.expiresAt,
      scope: tokenData.scope,
    },
  });
}

/**
 * freeeトークンを削除
 */
export async function deleteFreeeToken(userId: string): Promise<void> {
  await baseDb.account.deleteMany({
    where: {
      userId: userId,
      provider: "freee",
    },
  });
}

/**
 * ユーザーがfreeeと連携しているかチェック
 */
export async function isFreeeConnected(userId: string): Promise<boolean> {
  const count = await baseDb.account.count({
    where: {
      userId: userId,
      provider: "freee",
    },
  });

  return count > 0;
}
