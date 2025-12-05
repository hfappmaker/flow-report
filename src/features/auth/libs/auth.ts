import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";

import { getAccountByUserId } from "@/features/auth/repositories/account-repository";
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
  events: {
    async linkAccount({ user }) {
      await baseDb.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUserResult = await getUserById(user.id ?? "");

      // Prevent sign in without email verification
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

        // Delete two factor confirmation for next sign in
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
      session.user.isOAuth = token.isOAuth;
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

      const existingAccountResult = await getAccountByUserId(existingUser.id);

      token.isOAuth =
        existingAccountResult.success && !!existingAccountResult.data;
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
