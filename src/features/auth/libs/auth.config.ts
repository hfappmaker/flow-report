import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { LoginSchema } from "@/features/auth/schemas/login";

export default {
  providers: [
    Google,
    ...(process.env.VERCEL_TARGET_ENV === "production"
      ? []
      : [
          Credentials({
            async authorize(credentials): Promise<User | null> {
              const validatedFields = LoginSchema.safeParse(credentials);

              if (validatedFields.success) {
                const { email, password } = validatedFields.data;

                const userResult = await getUserByEmail(email);
                if (!userResult.success || !userResult.data) return null;

                const user = userResult.data;
                if (!user.password) return null;

                const passwordsMatch = await bcrypt.compare(
                  password,
                  user.password,
                );

                if (passwordsMatch) return user;
              }

              return null;
            },
          }),
        ]),
  ],
} satisfies NextAuthConfig;
