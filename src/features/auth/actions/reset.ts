"use server";

import * as z from "zod";

import { sendPasswordResetEmail } from "@/features/auth/libs/mail";
import { generatePasswordResetToken } from "@/features/auth/libs/tokens";
import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { ResetSchema } from "@/features/auth/schemas/reset";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid emaiL!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "Reset password email sent!" };
};
