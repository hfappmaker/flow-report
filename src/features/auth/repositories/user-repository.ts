// prismaの型定義をいれてしまうと、middlewareが容量オーバーでビルドできないため、Userを直書きしています。
// import type { User } from "@prisma/client";
interface User {
  id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: "USER" | "ADMIN";
  isTwoFactorEnabled: boolean;
};
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
