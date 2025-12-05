import type { VerificationToken } from "@prisma/client";

import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";

export const getVerificationTokenByToken = async (
  token: string,
): Promise<Result<VerificationToken | null>> => {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    return ok(verificationToken);
  } catch (error) {
    console.error("Error fetching verification token by token:", error);
    return err("認証トークンの取得に失敗しました");
  }
};

export const getVerificationTokenByEmail = async (
  email: string,
): Promise<Result<VerificationToken | null>> => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    });

    return ok(verificationToken);
  } catch (error) {
    console.error("Error fetching verification token by email:", error);
    return err("認証トークンの取得に失敗しました");
  }
};
