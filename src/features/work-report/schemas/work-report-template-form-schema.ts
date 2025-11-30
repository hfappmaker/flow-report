import * as z from "zod";

/**
 * フィールドマッピングのスキーマ
 */
export const fieldMappingSchema = z.object({
  namedRange: z.string().min(1, "名前付き範囲名は必須です"),
  valueTemplate: z.string().min(1, "値は必須です"),
  numFmt: z.string().nullable().optional(),
});

export type FieldMappingFormValues = z.infer<typeof fieldMappingSchema>;

/**
 * 作業報告書テンプレートフォームのスキーマ（新規作成時）
 */
export const workReportTemplateCreateFormSchema = z.object({
  name: z.string().min(1, "テンプレート名は必須です"),
  file: z.instanceof(File, { message: "Excelファイルは必須です" }),
  fieldMappings: z.array(fieldMappingSchema),
});

export type WorkReportTemplateCreateFormValues = z.infer<
  typeof workReportTemplateCreateFormSchema
>;

/**
 * 作業報告書テンプレートフォームのスキーマ（編集時）
 */
export const workReportTemplateEditFormSchema = z.object({
  name: z.string().min(1, "テンプレート名は必須です"),
  file: z.instanceof(File).nullable().optional(),
  fieldMappings: z.array(fieldMappingSchema),
});

export type WorkReportTemplateEditFormValues = z.infer<
  typeof workReportTemplateEditFormSchema
>;

/**
 * ファイルアップロードのバリデーション
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function validateExcelFile(file: File): string | null {
  if (file.type !== ACCEPTED_FILE_TYPE) {
    return "ファイル形式が正しくありません。.xlsxファイルを選択してください。";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。";
  }
  return null;
}
