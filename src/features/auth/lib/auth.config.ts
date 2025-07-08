import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { LoginSchema } from "@/features/auth/schemas/login";

export default {
  providers: [
    // テスト環境ではOAuth認証を無効化
    ...(process.env.NODE_ENV === "test" 
      ? []
      : [
          GitHub,
          Google,
        ]
    ),
    Credentials({
      async authorize(credentials): Promise<User | null> {
        // テスト環境用のテストユーザー認証
        if (process.env.NODE_ENV === "test" && credentials?.email === "test@example.com") {
          return {
            id: "test-user-id",
            name: "Test User",
            email: "test@example.com",
            emailVerified: new Date(),
            image: null,
            password: null,
            role: "USER",
            isTwoFactorEnabled: false,
          } as User;
        }

        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user?.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
