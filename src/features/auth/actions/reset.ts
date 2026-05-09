"use server";

import * as z from "zod";

import { sendPasswordResetEmail } from "@/features/auth/libs/mail";
import { generatePasswordResetToken } from "@/features/auth/libs/tokens";
import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { ResetSchema } from "@/features/auth/schemas/reset";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "メールアドレスが正しくありません" };
  }

  const { email } = validatedFields.data;

  const existingUserResult = await getUserByEmail(email);

  if (!existingUserResult.success) {
    return { error: existingUserResult.error };
  }

  if (!existingUserResult.data) {
    return { error: "ユーザーが見つかりません" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "パスワード再設定メールを送信しました" };
};
