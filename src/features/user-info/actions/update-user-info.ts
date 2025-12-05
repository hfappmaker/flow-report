"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { currentUser } from "@/features/auth/libs/auth";
import { getUserById } from "@/features/auth/repositories/user-repository";
import { userInfoFormSchema } from "@/features/user-info/schemas/user-info-form-schema";
import { updateUserInfo as updateUserInfoRepository } from "../repositories/user-info-repository";

export const updateUserInfo = async (
  values: z.infer<typeof userInfoFormSchema>,
) => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "認証されていません" };
  }

  const dbUserResult = await getUserById(user.id);
  if (!dbUserResult.success) {
    return { error: dbUserResult.error };
  }
  const dbUser = dbUserResult.data;

  if (!dbUser) {
    return { error: "ユーザーが見つかりません" };
  }

  const result = await updateUserInfoRepository(dbUser.id, values);
  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/user-info");

  return { success: "ユーザー情報を更新しました" };
};

export const getUserInfo = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return null;
  }

  const dbUserResult = await getUserById(user.id);
  if (!dbUserResult.success || !dbUserResult.data) {
    return null;
  }
  const dbUser = dbUserResult.data;

  return {
    name: dbUser.name ?? "",
    email: dbUser.email ?? "",
    postalCode: dbUser.postalCode ?? "",
    address: dbUser.address ?? "",
    bankName: dbUser.bankName ?? "",
    bankBranchName: dbUser.bankBranchName ?? "",
    bankAccountType: dbUser.bankAccountType as "普通" | "当座" | null,
    bankAccountNumber: dbUser.bankAccountNumber ?? "",
    bankAccountHolder: dbUser.bankAccountHolder ?? "",
  };
};
