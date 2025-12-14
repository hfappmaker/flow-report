import type { PasswordResetToken } from "@prisma/client";

import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";

export const getPasswordResetTokenByToken = async (
  token: string,
): Promise<Result<PasswordResetToken | null>> => {
  try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    return ok(passwordResetToken);
  } catch (error) {
    console.error("Error fetching password reset token by token:", error);
    return err("パスワードリセットトークンの取得に失敗しました");
  }
};

export const getPasswordResetTokenByEmail = async (
  email: string,
): Promise<Result<PasswordResetToken | null>> => {
  try {
    const passwordResetToken = await db.passwordResetToken.findFirst({
      where: { email },
    });

    return ok(passwordResetToken);
  } catch (error) {
    console.error("Error fetching password reset token by email:", error);
    return err("パスワードリセットトークンの取得に失敗しました");
  }
};
