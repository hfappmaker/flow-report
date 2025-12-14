import type { TwoFactorConfirmation } from "@prisma/client";

import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";

export const getTwoFactorConfirmationByUserId = async (
  userId: string,
): Promise<Result<TwoFactorConfirmation | null>> => {
  try {
    const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
      where: { userId },
    });

    return ok(twoFactorConfirmation);
  } catch (error) {
    console.error("Error fetching two factor confirmation by user id:", error);
    return err("二要素認証確認の取得に失敗しました");
  }
};
