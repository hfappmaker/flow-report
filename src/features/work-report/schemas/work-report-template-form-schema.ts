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
 * Excelテンプレートフォームのスキーマ（新規作成時）
 */
export const excelTemplateCreateFormSchema = z.object({
  name: z.string().min(1, "テンプレート名は必須です"),
  file: z.instanceof(File, { message: "Excelファイルは必須です" }),
  sheetName: z.string().nullable().optional(),
  fieldMappings: z.array(fieldMappingSchema),
});

export type ExcelTemplateCreateFormValues = z.infer<
  typeof excelTemplateCreateFormSchema
>;

/**
 * Excelテンプレートフォームのスキーマ（編集時）
 */
export const excelTemplateEditFormSchema = z.object({
  name: z.string().min(1, "テンプレート名は必須です"),
  file: z.instanceof(File).nullable().optional(),
  sheetName: z.string().nullable().optional(),
  fieldMappings: z.array(fieldMappingSchema),
});

export type ExcelTemplateEditFormValues = z.infer<
  typeof excelTemplateEditFormSchema
>;

/**
 * ファイルアップロードのバリデーション
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template", // .xltx
];

export function validateExcelFile(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "ファイル形式が正しくありません。.xlsxまたは.xltxファイルを選択してください。";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。";
  }
  return null;
}

/**
 * Excelの名前付き範囲の命名規則に基づくバリデーション
 *
 * Excelの名前付き範囲の規則:
 * - 先頭が英文字、ひらがな、カタカナ、漢字、またはアンダースコア（_）である
 * - 空白または他の無効な文字が含まれていない
 * - セル参照（例: A1, $B$2）と同じ形式は使用不可
 */
export function validateNamedRange(name: string): string | null {
  if (!name || name.trim() === "") {
    return "名前付き範囲名は必須です";
  }

  const trimmedName = name.trim();

  // 先頭文字のチェック: 英文字、ひらがな、カタカナ、漢字、アンダースコア
  // ひらがな: \u3040-\u309F
  // カタカナ: \u30A0-\u30FF
  // 漢字: \u4E00-\u9FFF
  const validFirstCharPattern =
    /^[a-zA-Z_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
  if (!validFirstCharPattern.test(trimmedName)) {
    return "先頭は英文字、ひらがな、カタカナ、漢字、またはアンダースコア（_）にしてください";
  }

  // 無効な文字のチェック（空白、特殊記号など）
  // 許可: 英数字、ひらがな、カタカナ、漢字、アンダースコア、ピリオド、バックスラッシュ
  const invalidCharPattern =
    /[\s!@#$%^&*()+\-=\[\]{};':"\\|,<>\/?～！＠＃＄％＾＆＊（）＋－＝［］｛｝；'："＼｜，＜＞／？　]/;
  if (invalidCharPattern.test(trimmedName)) {
    return "空白や無効な記号は使用できません";
  }

  // セル参照形式のチェック（例: A1, $B$2, AA100）
  const cellReferencePattern = /^\$?[A-Za-z]{1,3}\$?\d+$/;
  if (cellReferencePattern.test(trimmedName)) {
    return "セル参照と同じ形式（例: A1）は使用できません";
  }

  // 長さチェック（Excelの名前は255文字まで）
  if (trimmedName.length > 255) {
    return "名前は255文字以内にしてください";
  }

  return null;
}
