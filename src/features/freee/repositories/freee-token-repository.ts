import type { FreeeTokenData } from "@/features/freee/types/freee-types";
import { baseDb } from "@/repositories/base-db";
import { type Result, err, ok } from "@/types/result";

/**
 * ユーザーのfreeeトークンを取得
 */
export async function getFreeeToken(
  userId: string,
): Promise<Result<FreeeTokenData | null>> {
  try {
    const account = await baseDb.account.findFirst({
      where: {
        userId: userId,
        provider: "freee",
      },
    });

    if (!account) {
      return ok(null);
    }

    if (
      !account.access_token ||
      !account.refresh_token ||
      !account.expires_at ||
      !account.providerAccountId
    ) {
      return ok(null);
    }

    return ok({
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      expiresAt: account.expires_at,
      companyId: parseInt(account.providerAccountId, 10),
      scope: account.scope ?? "",
    });
  } catch (error) {
    console.error("Error fetching freee token:", error);
    return err("freeeトークンの取得に失敗しました");
  }
}

/**
 * freeeトークンを保存
 */
export async function saveFreeeToken(
  userId: string,
  tokenData: FreeeTokenData,
): Promise<Result<void>> {
  try {
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
    return ok(undefined);
  } catch (error) {
    console.error("Error saving freee token:", error);
    return err("freeeトークンの保存に失敗しました");
  }
}

/**
 * freeeトークンを削除
 */
export async function deleteFreeeToken(userId: string): Promise<Result<void>> {
  try {
    await baseDb.account.deleteMany({
      where: {
        userId: userId,
        provider: "freee",
      },
    });
    return ok(undefined);
  } catch (error) {
    console.error("Error deleting freee token:", error);
    return err("freeeトークンの削除に失敗しました");
  }
}

/**
 * ユーザーがfreeeと連携しているかチェック
 */
export async function isFreeeConnected(
  userId: string,
): Promise<Result<boolean>> {
  try {
    const count = await baseDb.account.count({
      where: {
        userId: userId,
        provider: "freee",
      },
    });

    return ok(count > 0);
  } catch (error) {
    console.error("Error checking freee connection:", error);
    return err("freee連携状態の確認に失敗しました");
  }
}
