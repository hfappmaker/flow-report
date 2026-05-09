import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";

import { getTwoFactorConfirmationByUserId } from "@/features/auth/repositories/two-factor-confirmation-repository";
import { getUserById } from "@/features/auth/repositories/user-repository";
import { baseDb } from "@/repositories/base-db";

import authConfig from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      const existingUserResult = await getUserById(user.id ?? "");

      // メール未認証ユーザーのサインインを防止
      if (
        !existingUserResult.success ||
        !existingUserResult.data?.emailVerified
      )
        return false;

      const existingUser = existingUserResult.data;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmationResult =
          await getTwoFactorConfirmationByUserId(existingUser.id);

        if (
          !twoFactorConfirmationResult.success ||
          !twoFactorConfirmationResult.data
        )
          return false;

        const twoFactorConfirmation = twoFactorConfirmationResult.data;

        // 次回サインイン用に二要素認証確認情報を削除
        await baseDb.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },

    session({ token, session }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      session.user.role = token.role;
      session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
      session.user.name = token.name;

      if (token.email) {
        session.user.email = token.email;
      }
      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUserResult = await getUserById(token.sub);

      if (!existingUserResult.success || !existingUserResult.data) return token;

      const existingUser = existingUserResult.data;

      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;

      return token;
    },
  },

  adapter: PrismaAdapter(baseDb),
  session: { strategy: "jwt" },

  debug:
    process.env.VERCEL_TARGET_ENV === "development" ||
    process.env.VERCEL_TARGET_ENV === "preview",
  ...authConfig,
} satisfies NextAuthConfig);

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};
