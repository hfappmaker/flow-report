"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { unstable_update, currentUser } from "@/features/auth/libs/auth";
import { sendVerificationEmail } from "@/features/auth/libs/mail";
import { generateVerificationToken } from "@/features/auth/libs/tokens";
import {
  getUserByEmail,
  getUserById,
} from "@/features/auth/repositories/user-repository";
import { SettingsSchema } from "@/features/auth/schemas/settings";
import { db } from "@/repositories/db";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "認証されていません" };
  }

  const dbUserResult = await getUserById(user.id);

  if (!dbUserResult.success) {
    return { error: dbUserResult.error };
  }

  const dbUser = dbUserResult.data;

  if (!dbUser) {
    return { error: "認証されていません" };
  }

  if (values.email && values.email !== user.email) {
    const existingUserResult = await getUserByEmail(values.email);

    if (!existingUserResult.success) {
      return { error: existingUserResult.error };
    }

    const existingUser = existingUserResult.data;

    if (existingUser && existingUser.id !== user.id) {
      return { error: "このメールアドレスはすでに使用されています" };
    }

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return { success: "確認メールを送信しました" };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password,
    );

    if (!passwordsMatch) {
      return { error: "パスワードが正しくありません" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = null;
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...values,
      isTwoFactorEnabled: values.isTwoFactorEnabled ?? undefined,
    },
  });

  await unstable_update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      role: updatedUser.role,
    },
  });

  return { success: "設定を更新しました" };
};
