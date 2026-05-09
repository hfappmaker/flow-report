"use server";

import { signOut } from "@/features/auth/libs/auth";

export const logout = async () => {
  await signOut({ redirect: false });
};
