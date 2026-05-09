"use server";

import { currentUser, signOut } from "@/features/auth/libs/auth";
import { deleteUser } from "@/features/user-info/repositories/user-info-repository";

export const deleteAccount = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "認証されていません" };
  }

  const result = await deleteUser(user.id);
  if (!result.success) {
    return { error: result.error };
  }

  // 削除成功時はセッションも破棄する
  await signOut({ redirect: false });

  return { success: "アカウントを削除しました" };
};
