"use server";

import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { getVerificationTokenByToken } from "@/features/auth/repositories/verification-token-repository";
import { db } from "@/repositories/db";

export const newVerification = async (token: string) => {
  const existingTokenResult = await getVerificationTokenByToken(token);

  if (!existingTokenResult.success) {
    return { error: existingTokenResult.error };
  }

  const existingToken = existingTokenResult.data;

  if (!existingToken) {
    return { error: "トークンが見つかりません" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "トークンの有効期限が切れています" };
  }

  const existingUserResult = await getUserByEmail(existingToken.email);

  if (!existingUserResult.success) {
    return { error: existingUserResult.error };
  }

  const existingUser = existingUserResult.data;

  if (!existingUser) {
    return { error: "ユーザーが登録されていません" };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return {
    success:
      "メールアドレスの確認が完了しました。ログインできるようになりました",
  };
};
