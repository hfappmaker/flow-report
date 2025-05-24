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

      const existingUser = await getUserById(user.id ?? "");

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id,
        );

        if (!twoFactorConfirmation) return false;

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

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;

      return token;
    },
  },

  adapter: PrismaAdapter(baseDb),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
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
