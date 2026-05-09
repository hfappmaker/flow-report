import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";
import type { UserInfoFormValues } from "../schemas/user-info-form-schema";

export async function updateUserInfo(
  userId: string,
  values: UserInfoFormValues,
): Promise<Result<void>> {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name: values.name ?? null,
        invoiceRegistrationNumber: values.invoiceRegistrationNumber ?? null,
        postalCode: values.postalCode ?? null,
        address: values.address ?? null,
        bankName: values.bankName ?? null,
        bankBranchName: values.bankBranchName ?? null,
        bankAccountType: values.bankAccountType ?? null,
        bankAccountNumber: values.bankAccountNumber ?? null,
        bankAccountHolder: values.bankAccountHolder ?? null,
      },
    });
    return ok(undefined);
  } catch (error) {
    console.error("ユーザー情報更新エラー:", error);
    return err("ユーザー情報の更新に失敗しました");
  }
}

export async function deleteUser(userId: string): Promise<Result<void>> {
  try {
    await db.user.delete({
      where: { id: userId },
    });
    return ok(undefined);
  } catch (error) {
    console.error("ユーザー削除エラー:", error);
    return err("アカウントの削除に失敗しました");
  }
}
