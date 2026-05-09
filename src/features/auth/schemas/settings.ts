import { UserRole } from "@prisma/client";
import * as z from "zod";

interface UserData {
  password: string | null;
  newPassword: string | null;
  newPasswordConfirmation: string | null;
}

const passwordRequired = (
  data: UserData,
  passwordField: keyof UserData,
  newPasswordField: keyof UserData,
  newPasswordConfirmationField: keyof UserData = "newPasswordConfirmation",
) => {
  const newPasswordEntered = data[newPasswordField] !== null;
  const confirmationEntered = data[newPasswordConfirmationField] !== null;

  if (newPasswordEntered && !confirmationEntered) {
    return false;
  }

  return !(
    (data[passwordField] && !data[newPasswordField]) ??
    (data[newPasswordField] && !data[passwordField])
  );
};

export const SettingsSchema = z
  .object({
    name: z.nullable(z.string()),
    isTwoFactorEnabled: z.nullable(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.nullable(z.string().email()),
    password: z.nullable(z.string().min(1)),
    newPassword: z.nullable(
      z.string().min(6, {
        message: "新しいパスワードは6文字以上で入力してください",
      }),
    ),
    newPasswordConfirmation: z.nullable(
      z.string().min(6, {
        message: "確認用の新しいパスワードは6文字以上で入力してください",
      }),
    ),
  })
  .refine((data) => passwordRequired(data, "password", "newPassword"), {
    message: "新しいパスワードを6文字以上で入力してください",
    path: ["newPassword"],
  })
  .refine((data) => passwordRequired(data, "newPassword", "password"), {
    message: "現在のパスワードを入力してください",
    path: ["password"],
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "パスワードが一致しません",
    path: ["newPasswordConfirmation"],
  });
