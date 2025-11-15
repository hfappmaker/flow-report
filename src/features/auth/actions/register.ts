"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { sendVerificationEmail } from "@/features/auth/libs/mail";
import { generateVerificationToken } from "@/features/auth/libs/tokens";
import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { RegisterSchema } from "@/features/auth/schemas/register";
import { db } from "@/repositories/db";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields." };
  }

  const { name, password, email } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "User email already exists." };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Successfully registered. Verify your email!" };
};
