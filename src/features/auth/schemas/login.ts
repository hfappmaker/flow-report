import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください",
  }),
  password: z.string().min(1, {
    message: "パスワードを入力してください",
  }),
  code: z.optional(z.string()),
});
