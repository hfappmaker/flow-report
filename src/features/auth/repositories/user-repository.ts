import { User } from "@prisma/client";

import { baseDb } from "@/repositories/base-db";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await baseDb.user.findUnique({
      where: { email },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await baseDb.user.findUnique({
      where: { id },
    });

    return user;
  } catch {
    return null;
  }
};
