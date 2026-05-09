import * as z from "zod";

export const DELETE_CONFIRMATION_TEXT = "削除";

export const deleteAccountFormSchema = z.object({
  confirmText: z
    .string()
    .refine((value) => value === DELETE_CONFIRMATION_TEXT, {
      message: `確認のため「${DELETE_CONFIRMATION_TEXT}」と入力してください`,
    }),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountFormSchema>;
