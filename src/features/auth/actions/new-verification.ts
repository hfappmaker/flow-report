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
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUserResult = await getUserByEmail(existingToken.email);

  if (!existingUserResult.success) {
    return { error: existingUserResult.error };
  }

  const existingUser = existingUserResult.data;

  if (!existingUser) {
    return { error: "User not registered!" };
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

  return { success: "Account verified!" };
};
