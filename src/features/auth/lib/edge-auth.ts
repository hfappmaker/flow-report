import NextAuth, { type NextAuthConfig } from "next-auth";

import authConfig from "./auth.config";

const edgeAuthConfig = {
  ...authConfig,
  adapter: undefined,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token }) {
      return token;
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
  },
} satisfies NextAuthConfig;

export const { auth: edgeAuth } = NextAuth(edgeAuthConfig); 