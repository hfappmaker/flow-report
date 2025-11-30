import type { TemplateType } from "@prisma/client";

/**
 * エクスポート設定（localStorageに保存）
 */
export interface ExportSettings {
  workReportTemplateId: string | null;
  invoiceTemplateId: string | null;
}

/**
 * エクスポートダイアログの状態
 */
export interface ExportDialogState {
  isWorkReportEnabled: boolean;
  isInvoiceEnabled: boolean;
  workReportTemplateId: string | null;
  invoiceTemplateId: string | null;
  isZipEnabled: boolean;
  isPasswordEnabled: boolean;
  password: string;
}

/**
 * エクスポート対象ファイル
 */
export interface ExportFile {
  fileName: string;
  blob: Blob;
  type: TemplateType;
}

/**
 * localStorage保存キー
 */
export const EXPORT_SETTINGS_KEY = "export-settings";
