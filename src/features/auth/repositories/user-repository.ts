import type { User } from "@prisma/client";

import { baseDb } from "@/repositories/base-db";
import { type Result, err, ok } from "@/types/result";

export const getUserByEmail = async (
  email: string,
): Promise<Result<User | null>> => {
  try {
    const user = await baseDb.user.findUnique({
      where: { email },
    });

    return ok(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return err("ユーザーの取得に失敗しました");
  }
};

export const getUserById = async (id: string): Promise<Result<User | null>> => {
  try {
    const user = await baseDb.user.findUnique({
      where: { id },
    });

    return ok(user);
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return err("ユーザーの取得に失敗しました");
  }
};
