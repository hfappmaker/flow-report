import type { NextAuthConfig } from "next-auth";

// Lightweight auth config for Edge Runtime (middleware)
// This config excludes Credentials provider to avoid bcrypt and Prisma dependencies
export default {
  providers: [],
} satisfies NextAuthConfig;
