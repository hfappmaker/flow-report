"use server";

import { signOut } from "@/features/auth/libs/auth";

export const logout = async () => {
  // Server-side actions, like clearing cookies in the client-side code,
  // before or after calling signOut().
  // ...
  await signOut();
};
