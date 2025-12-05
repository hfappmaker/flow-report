import type { TwoFactorToken } from "@prisma/client";

import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";

export const getTwoFactorTokenByToken = async (
  token: string,
): Promise<Result<TwoFactorToken | null>> => {
  try {
    const twoFactorToken = await db.twoFactorToken.findUnique({
      where: { token },
    });

    return ok(twoFactorToken);
  } catch (error) {
    console.error("Error fetching two factor token by token:", error);
    return err("二要素認証トークンの取得に失敗しました");
  }
};

export const getTwoFactorTokenByEmail = async (
  email: string,
): Promise<Result<TwoFactorToken | null>> => {
  try {
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: { email },
    });

    return ok(twoFactorToken);
  } catch (error) {
    console.error("Error fetching two factor token by email:", error);
    return err("二要素認証トークンの取得に失敗しました");
  }
};
