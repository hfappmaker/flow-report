import { z } from "zod";

export interface ExcelRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export const createWorkReportFormSchema = z.object({
  yearMonth: z.date(),
});

export const searchFormSchema = z.object({
  from: z.date().nullable(),
  to: z.date().nullable(),
});

export const editFormSchema = z.object({
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  breakDuration: z.number().nullable(),
  memo: z.string().nullable(),
});

export const bulkEditFormSchema = z.object({
  startDate: z
    .date()
    .nullable()
    .refine((val) => val !== null, {
      message: "開始日を入力してください",
    }),
  endDate: z
    .date()
    .nullable()
    .refine((val) => val !== null, {
      message: "終了日を入力してください",
    }),
  selectedDays: z.number().array().nullable(),
  excludeHolidays: z.boolean().default(true).nullable(),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  breakDuration: z.number().nullable(),
  memo: z.string().nullable(),
  prompt: z.string().nullable(),
});

export const templateUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "ファイルサイズは5MB以下にしてください",
    })
    .refine(
      (file) =>
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      {
        message: ".xlsx形式のファイルを選択してください",
      },
    ),
});

export type CreateWorkReportFormValues = z.infer<
  typeof createWorkReportFormSchema
>;
export type SearchFormValues = z.infer<typeof searchFormSchema>;
export type EditFormValues = z.infer<typeof editFormSchema>;
export type BulkEditFormValues = z.infer<typeof bulkEditFormSchema>;
export type TemplateUploadValues = z.infer<typeof templateUploadSchema>;

/**
 * テンプレート設定のフィールドマッピングスキーマ
 */
export const templateFieldMappingSchema = z.object({
  // ヘッダー系フィールド
  title: z.string().nullable(),
  userName: z.string().nullable(),
  basicStartTime: z.string().nullable(),
  basicEndTime: z.string().nullable(),
  basicBreakDuration: z.string().nullable(),
  dailyWorkMinutes: z.string().nullable(),
  monthlyWorkMinutes: z.string().nullable(),
  remarks: z.string().nullable(),
  totalWorkTime: z.string().nullable(),
  basicWorkTime: z.string().nullable(),
  workingDays: z.string().nullable(),

  // フォームデータ系フィールド
  date: z.string().nullable(),
  dayOfWeek: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  breakDuration: z.string().nullable(),
  workDuration: z.string().nullable(),
  memo: z.string().nullable(),
});

/**
 * テンプレート設定作成スキーマ
 */
export const createTemplateConfigSchema = z.object({
  name: z
    .string()
    .min(1, "テンプレート名を入力してください")
    .max(100, "テンプレート名は100文字以内で入力してください"),
  templateFile: z.string().min(1, "テンプレートファイルをアップロードしてください"),
  templateFileName: z.string().min(1, "ファイル名が必要です"),
  fieldMapping: templateFieldMappingSchema,
});

/**
 * テンプレート設定更新スキーマ
 */
export const updateTemplateConfigSchema = z.object({
  name: z
    .string()
    .min(1, "テンプレート名を入力してください")
    .max(100, "テンプレート名は100文字以内で入力してください")
    .optional(),
  templateFile: z.string().optional(),
  templateFileName: z.string().optional(),
  fieldMapping: templateFieldMappingSchema.partial().optional(),
});

export type TemplateFieldMappingValues = z.infer<
  typeof templateFieldMappingSchema
>;
export type CreateTemplateConfigValues = z.infer<
  typeof createTemplateConfigSchema
>;
export type UpdateTemplateConfigValues = z.infer<
  typeof updateTemplateConfigSchema
>;
