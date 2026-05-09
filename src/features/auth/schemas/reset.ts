import * as z from "zod";

export const ResetSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください",
  }),
});
