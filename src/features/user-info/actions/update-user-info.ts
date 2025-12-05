"use server";

import * as z from "zod";

import { currentUser } from "@/features/auth/libs/auth";
import { getUserById } from "@/features/auth/repositories/user-repository";
import { userInfoFormSchema } from "@/features/user-info/schemas/user-info-form-schema";
import { db } from "@/repositories/db";

export const updateUserInfo = async (
  values: z.infer<typeof userInfoFormSchema>,
) => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "認証されていません" };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "ユーザーが見つかりません" };
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      name: values.name ?? null,
      postalCode: values.postalCode ?? null,
      address: values.address ?? null,
      bankName: values.bankName ?? null,
      bankBranchName: values.bankBranchName ?? null,
      bankAccountType: values.bankAccountType ?? null,
      bankAccountNumber: values.bankAccountNumber ?? null,
      bankAccountHolder: values.bankAccountHolder ?? null,
    },
  });

  return { success: "設定を更新しました" };
};

export const getUserInfo = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return null;
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return null;
  }

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
