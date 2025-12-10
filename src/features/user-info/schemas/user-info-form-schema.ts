import * as z from "zod";

/**
 * 口座種別の選択肢
 */
export const BANK_ACCOUNT_TYPES = ["普通", "当座"] as const;
export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[number];

/**
 * 適格請求書発行事業者登録番号のバリデーション
 * T + 13桁の数字（例: T1234567890123）
 */
const invoiceRegistrationNumberSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val === "") return true;
      return /^T\d{13}$/.test(val);
    },
    {
      message: "T + 13桁の数字で入力してください（例: T1234567890123）",
    },
  );

/**
 * ユーザー情報フォームのスキーマ
 */
export const userInfoFormSchema = z.object({
  // 基本情報
  name: z.string().optional(),

  // 事業者情報
  invoiceRegistrationNumber: invoiceRegistrationNumberSchema,

  // 住所情報
  postalCode: z.string().optional(),
  address: z.string().optional(),

  // 銀行口座情報
  bankName: z.string().optional(),
  bankBranchName: z.string().optional(),
  bankAccountType: z.enum(BANK_ACCOUNT_TYPES).nullable(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
});

export type UserInfoFormValues = z.infer<typeof userInfoFormSchema>;
