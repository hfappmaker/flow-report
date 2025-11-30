import * as z from "zod";

/**
 * 口座種別の選択肢
 */
export const BANK_ACCOUNT_TYPES = ["普通", "当座"] as const;
export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number];

/**
 * ユーザー設定フォームのスキーマ
 */
export const userSettingsFormSchema = z.object({
  // 基本情報
  name: z.string().optional(),

  // 住所情報
  postalCode: z.string().optional(),
  address: z.string().optional(),

  // 銀行口座情報
  bankName: z.string().optional(),
  bankBranchName: z.string().optional(),
  bankAccountType: z.enum(BANK_ACCOUNT_TYPES).optional().nullable(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
});

export type UserSettingsFormValues = z.infer<typeof userSettingsFormSchema>;
