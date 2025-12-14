import type { Account } from "@prisma/client";

import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";

export const getAccountByUserId = async (
  userId: string,
): Promise<Result<Account | null>> => {
  try {
    const account = await db.account.findFirst({
      where: { userId },
    });

    return ok(account);
  } catch (error) {
    console.error("Error fetching account by user id:", error);
    return err("アカウントの取得に失敗しました");
  }
};
