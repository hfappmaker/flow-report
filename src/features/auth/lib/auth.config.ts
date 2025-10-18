import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { getUserByEmail } from "@/features/auth/repositories/user-repository";
import { LoginSchema } from "@/features/auth/schemas/login";

// Inline User type to avoid importing Prisma Client in middleware
// This matches the User model from Prisma schema
interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: "ADMIN" | "USER";
  isTwoFactorEnabled: boolean;
}

export default {
  providers: [
    // テスト環境ではOAuth認証を無効化
    ...(process.env.LOCAL_NODE_ENV === "test" ? [] : [Google]),
    Credentials({
      async authorize(credentials): Promise<User | null> {
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
