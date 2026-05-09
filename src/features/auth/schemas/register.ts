import * as z from "zod";

export const RegisterSchema = z
  .object({
    name: z.string().min(1, {
      message: "名前を入力してください",
    }),
    email: z.string().email({
      message: "有効なメールアドレスを入力してください",
    }),
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
