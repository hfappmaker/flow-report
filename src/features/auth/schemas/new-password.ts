import { z } from "zod";

export const NewPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "パスワードは6文字以上で入力してください",
    }),
    passwordConfirmation: z.string().min(6, {
      message: "確認用パスワードは6文字以上で入力してください",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "パスワードが一致しません",
    path: ["passwordConfirmation"],
  });
