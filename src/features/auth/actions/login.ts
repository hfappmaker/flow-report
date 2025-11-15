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
    return { error: "Invalid fields" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser?.email || !existingUser.password) {
    return { error: "User not registered!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return { success: "Verification email sent!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

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
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};
