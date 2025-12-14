import * as z from "zod";

/**
 * ファイルアップロードのバリデーション定数
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template", // .xltx
];

/**
 * Excelファイルのバリデーションスキーマ（新規作成用：必須）
 */
const excelFileSchema = z
  .instanceof(File, { message: "Excelファイルは必須です" })
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。",
  )
  .refine(
    (file) => ACCEPTED_FILE_TYPES.includes(file.type),
    "ファイル形式が正しくありません。.xlsxまたは.xltxファイルを選択してください。",
  );

/**
 * Excelファイルのバリデーションスキーマ（編集用：オプショナル）
 */
const excelFileOptionalSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。",
  )
  .refine(
    (file) => ACCEPTED_FILE_TYPES.includes(file.type),
    "ファイル形式が正しくありません。.xlsxまたは.xltxファイルを選択してください。",
  )
  .nullable()
  .optional();

/**
 * フィールドマッピングのスキーマ
 */
export const fieldMappingSchema = z.object({
  namedRange: z.string().min(1, "名前付き範囲名は必須です"),
  valueTemplate: z.string().min(1, "値は必須です"),
});

export type FieldMappingFormValues = z.infer<typeof fieldMappingSchema>;

/**
 * Excelテンプレートフォームのスキーマ（新規作成時）
 */
export const excelTemplateCreateFormSchema = z.object({
  name: z.string().min(1, "テンプレート名は必須です"),
  file: excelFileSchema,
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
  file: excelFileOptionalSchema,
  sheetName: z.string().nullable().optional(),
  fieldMappings: z.array(fieldMappingSchema),
});

export type ExcelTemplateEditFormValues = z.infer<
  typeof excelTemplateEditFormSchema
>;

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

/**
 * フィールドマッピング配列内の名前付き範囲の重複をチェック
 * 重複しているインデックスのセットを返す
 */
export function findDuplicateNamedRanges(
  fieldMappings: FieldMappingFormValues[],
): Set<number> {
  const duplicateIndices = new Set<number>();
  const seenNames = new Map<string, number>();

  fieldMappings.forEach((mapping, index) => {
    const normalizedName = mapping.namedRange.trim().toLowerCase();
    if (normalizedName === "") return;

    const previousIndex = seenNames.get(normalizedName);
    if (previousIndex !== undefined) {
      duplicateIndices.add(previousIndex);
      duplicateIndices.add(index);
    } else {
      seenNames.set(normalizedName, index);
    }
  });

  return duplicateIndices;
}
