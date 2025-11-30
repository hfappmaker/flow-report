import type {
  ExcelTemplate as PrismaExcelTemplate,
  ExcelTemplateField as PrismaExcelTemplateField,
  TemplateType,
} from "@prisma/client";
import type { StrictOmit } from "ts-essentials";

export type { TemplateType };

/**
 * Excelテンプレートの型定義
 */
export type ExcelTemplate = StrictOmit<
  PrismaExcelTemplate,
  "createdAt" | "updatedAt"
>;

/**
 * Excelテンプレートフィールドの型定義
 */
export type ExcelTemplateField = StrictOmit<
  PrismaExcelTemplateField,
  "createdAt" | "updatedAt"
>;

/**
 * フィールドマッピングを含むExcelテンプレートの型定義
 */
export type ExcelTemplateWithFields = ExcelTemplate & {
  fieldMappings: ExcelTemplateField[];
};

/**
 * テンプレート作成時の入力型
 */
export interface CreateExcelTemplateInput {
  name: string;
  type: TemplateType;
  fileData: string;
  fileName: string;
  sheetName?: string | null;
  createUserId: string;
  fieldMappings: CreateFieldMappingInput[];
}

/**
 * フィールドマッピング作成時の入力型
 */
export interface CreateFieldMappingInput {
  namedRange: string;
  valueTemplate: string;
  numFmt?: string | null;
}

/**
 * テンプレート更新時の入力型
 */
export interface UpdateExcelTemplateInput {
  name?: string;
  fileData?: string;
  fileName?: string;
  sheetName?: string | null;
  fieldMappings?: CreateFieldMappingInput[];
}
