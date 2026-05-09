"use server";

import * as z from "zod";

import { sendPasswordResetEmail } from "@/features/auth/libs/mail";
import { generatePasswordResetToken } from "@/features/auth/libs/tokens";
import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { ResetSchema } from "@/features/auth/schemas/reset";
import { isBotRequest } from "@/libs/bot-protection";
import { checkRateLimit } from "@/libs/rate-limit";
import { getRequestIp } from "@/libs/request-ip";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  if (await isBotRequest()) {
    return { error: "不正なリクエストとして拒否されました" };
  }

  const ip = await getRequestIp();
  const rateLimit = await checkRateLimit("passwordReset", ip);
  if (!rateLimit.success) {
    return {
      error:
        "リクエストが多すぎます。しばらく時間を置いてから再度お試しください",
    };
  }

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

  return {
    success:
      "パスワード再設定メールを送信しました。メール内のリンクから新しいパスワードを設定してください",
  };
};
