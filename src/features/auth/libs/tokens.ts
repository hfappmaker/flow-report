import crypto from "crypto";

import { v4 as uuidv4 } from "uuid";

import { getPasswordResetTokenByEmail } from "@/features/auth/repositories/password-reset-token-repository";
import { getTwoFactorTokenByEmail } from "@/features/auth/repositories/two-factor-token-repository";
import { getVerificationTokenByEmail } from "@/features/auth/repositories/verification-token-repository";
import { db } from "@/repositories/db";

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingTokenResult = await getTwoFactorTokenByEmail(email);

  if (existingTokenResult.success && existingTokenResult.data) {
    await db.twoFactorToken.delete({
      where: {
        id: existingTokenResult.data.id,
      },
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingTokenResult = await getPasswordResetTokenByEmail(email);

  if (existingTokenResult.success && existingTokenResult.data) {
    await db.passwordResetToken.delete({
      where: { id: existingTokenResult.data.id },
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingTokenResult = await getVerificationTokenByEmail(email);

  if (existingTokenResult.success && existingTokenResult.data) {
    await db.verificationToken.delete({
      where: {
        id: existingTokenResult.data.id,
      },
    });
  }

  const verficationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verficationToken;
};
