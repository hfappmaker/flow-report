"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { sendVerificationEmail } from "@/features/auth/libs/mail";
import { generateVerificationToken } from "@/features/auth/libs/tokens";
import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { RegisterSchema } from "@/features/auth/schemas/register";
import { isBotRequest } from "@/libs/bot-protection";
import { checkRateLimit } from "@/libs/rate-limit";
import { getRequestIp } from "@/libs/request-ip";
import { db } from "@/repositories/db";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  if (await isBotRequest()) {
    return { error: "不正なリクエストとして拒否されました" };
  }

  const ip = await getRequestIp();
  const rateLimit = await checkRateLimit("register", ip);
  if (!rateLimit.success) {
    return {
      error:
        "リクエストが多すぎます。しばらく時間を置いてから再度お試しください",
    };
  }

  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "入力内容に誤りがあります" };
  }

  const { name, password, email } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUserResult = await getUserByEmail(email);

  if (!existingUserResult.success) {
    return { error: existingUserResult.error };
  }

  const existingUser = existingUserResult.data;

  // 既に認証済みのユーザーが存在する場合のみ拒否する。
  // 未認証のまま放置されている場合は同じメアドでの再登録を許可し、
  // パスワードを更新したうえで新しい確認メールを送る。
  if (existingUser?.emailVerified) {
    return { error: "このメールアドレスはすでに登録されています" };
  }

  if (existingUser) {
    await db.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        password: hashedPassword,
      },
    });
  } else {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return {
    success:
      "確認メールを送信しました。メール内のリンクから登録を完了してください",
  };
};
