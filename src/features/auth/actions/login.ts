"use server";

import { AuthError } from "next-auth";
import * as z from "zod";

import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";
import { signIn } from "@/features/auth/libs/auth";
import { sendTwoFactorTokenEmail } from "@/features/auth/libs/mail";
import { generateTwoFactorToken } from "@/features/auth/libs/tokens";
import { getTwoFactorConfirmationByUserId } from "@/features/auth/repositories/two-factor-confirmation-repository";
import { getTwoFactorTokenByEmail } from "@/features/auth/repositories/two-factor-token-repository";
import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { LoginSchema } from "@/features/auth/schemas/login";
import { isBotRequest } from "@/libs/bot-protection";
import { checkRateLimit } from "@/libs/rate-limit";
import { getRequestIp } from "@/libs/request-ip";
import { db } from "@/repositories/db";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  if (await isBotRequest()) {
    return { error: "不正なリクエストとして拒否されました" };
  }

  const ip = await getRequestIp();
  const rateLimit = await checkRateLimit("login", ip);
  if (!rateLimit.success) {
    return {
      error:
        "リクエストが多すぎます。しばらく時間を置いてから再度お試しください",
    };
  }

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
    return {
      error:
        "メールアドレスが未認証です。お送りした確認メールのリンクから認証を完了してください。期限が切れている場合は再度ご登録ください",
    };
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
      redirect: false,
      email: email,
      password: password,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          // signIn到達時点でユーザー存在は確認済みのため、CredentialsSigninはパスワード不一致を意味する
          return { error: "パスワードが正しくありません" };
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

  return { redirectTo: callbackUrl ?? DEFAULT_LOGIN_REDIRECT };
};
