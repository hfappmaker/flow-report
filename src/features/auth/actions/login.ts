"use server";

import { AuthError } from "next-auth";
import * as z from "zod";

import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";
import { signIn } from "@/features/auth/libs/auth";
import {
  sendVerificationEmail,
  sendTwoFactorTokenEmail,
} from "@/features/auth/libs/mail";
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from "@/features/auth/libs/tokens";
import { getTwoFactorConfirmationByUserId } from "@/features/auth/repositories/two-factor-confirmation-repository";
import { getTwoFactorTokenByEmail } from "@/features/auth/repositories/two-factor-token-repository";
import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { LoginSchema } from "@/features/auth/schemas/login";
import { db } from "@/repositories/db";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "入力内容に誤りがあります" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUserResult = await getUserByEmail(email);

  if (!existingUserResult.success) {
    return { error: existingUserResult.error };
  }

  const existingUser = existingUserResult.data;

  if (!existingUser?.email || !existingUser.password) {
    return { error: "ユーザーが登録されていません" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return { success: "確認メールを送信しました" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorTokenResult = await getTwoFactorTokenByEmail(
        existingUser.email,
      );

      if (!twoFactorTokenResult.success) {
        return { error: twoFactorTokenResult.error };
      }

      const twoFactorToken = twoFactorTokenResult.data;

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "認証コードが正しくありません" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "認証コードの有効期限が切れています" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmationResult = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

      if (!existingConfirmationResult.success) {
        return { error: existingConfirmationResult.error };
      }

      const existingConfirmation = existingConfirmationResult.data;

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      redirectTo: callbackUrl ?? DEFAULT_LOGIN_REDIRECT,
      email: email,
      password: password,
    });
  } catch (error) {
    // Next.js の redirect シグナルは再スローして通常のリダイレクト処理に委ねる
    if (isNextRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "メールアドレスまたはパスワードが正しくありません" };
        case "AccessDenied":
          return {
            error:
              "アクセスが拒否されました。メールアドレスの認証が完了していない可能性があります",
          };
        case "CallbackRouteError":
          console.error("CallbackRouteError:", error);
          return { error: "認証処理でエラーが発生しました" };
        default:
          console.error("AuthError:", error.type, error.message);
          return { error: `ログインに失敗しました（${error.type}）` };
      }
    }

    console.error("Unexpected login error:", error);
    return {
      error: `ログイン処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const isNextRedirectError = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
};
