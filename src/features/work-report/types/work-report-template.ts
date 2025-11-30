import type {
  WorkReportTemplate as PrismaWorkReportTemplate,
  WorkReportTemplateField as PrismaWorkReportTemplateField,
} from "@prisma/client";
import type { StrictOmit } from "ts-essentials";

/**
 * 作業報告書テンプレートの型定義
 */
export type WorkReportTemplate = StrictOmit<
  PrismaWorkReportTemplate,
  "createdAt" | "updatedAt"
>;

/**
 * 作業報告書テンプレートフィールドの型定義
 */
export type WorkReportTemplateField = StrictOmit<
  PrismaWorkReportTemplateField,
  "createdAt" | "updatedAt"
>;

/**
 * フィールドマッピングを含む作業報告書テンプレートの型定義
 */
export type WorkReportTemplateWithFields = WorkReportTemplate & {
  fieldMappings: WorkReportTemplateField[];
};

/**
 * テンプレート作成時の入力型
 */
export interface CreateWorkReportTemplateInput {
  name: string;
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
export interface UpdateWorkReportTemplateInput {
  name?: string;
  fileData?: string;
  fileName?: string;
  sheetName?: string | null;
  fieldMappings?: CreateFieldMappingInput[];
}
