import * as z from "zod";

export const emailTemplateFormSchema = z.object({
  name: z.string().min(1, "メールテンプレート名は必須です"),
  subject: z.string().min(1, "件名は必須です"),
  body: z.string().min(1, "本文は必須です"),
  toAddresses: z.array(
    z.string().email("有効なメールアドレスを入力してください"),
  ),
  ccAddresses: z.array(
    z.string().email("有効なメールアドレスを入力してください"),
  ),
});

export type EmailTemplateFormValues = z.infer<typeof emailTemplateFormSchema>;
