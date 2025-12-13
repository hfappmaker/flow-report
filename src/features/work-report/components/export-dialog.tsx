"use client";

import ExcelJS from "exceljs";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { FreeePartner } from "@/features/freee/types/freee-accounting-types";
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_TEMPLATE_FILE_NAME,
  DEFAULT_TEMPLATE_SHEET_NAME,
  DEFAULT_TEMPLATE_FIELD_MAPPINGS,
  isDefaultTemplate,
  DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
  DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
  DEFAULT_INVOICE_TEMPLATE_FILE_NAME,
  DEFAULT_INVOICE_TAX_INCLUSIVE_SHEET_NAME,
  DEFAULT_INVOICE_TAX_EXCLUSIVE_SHEET_NAME,
  DEFAULT_INVOICE_TAX_INCLUSIVE_FIELD_MAPPINGS,
  DEFAULT_INVOICE_TAX_EXCLUSIVE_FIELD_MAPPINGS,
  isDefaultInvoiceTemplate,
} from "@/features/work-report/constants/default-template";
import { useExportSettings } from "@/features/work-report/hooks/use-export-settings";
import type { ExportFile } from "@/features/work-report/types/export-types";
import type { ExcelTemplateWithFields } from "@/features/work-report/types/work-report-template";

import { FreeeConnectionButton } from "./freee-connection-button";

/**
 * システムデフォルトの作業報告書テンプレート（読み取り専用）
 */
const SYSTEM_DEFAULT_WORK_REPORT_TEMPLATE: ExcelTemplateWithFields = {
  id: DEFAULT_TEMPLATE_ID,
  name: DEFAULT_TEMPLATE_NAME,
  type: "WORK_REPORT",
  fileData: "", // 使用しない（publicフォルダから読み込み）
  fileName: DEFAULT_TEMPLATE_FILE_NAME,
  sheetName: DEFAULT_TEMPLATE_SHEET_NAME,
  createUserId: "system",
  fieldMappings: DEFAULT_TEMPLATE_FIELD_MAPPINGS,
};

/**
 * システムデフォルトの請求書テンプレート（上下割・税込）
 */
const SYSTEM_DEFAULT_INVOICE_TAX_INCLUSIVE_TEMPLATE: ExcelTemplateWithFields = {
  id: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
  name: "デフォルトテンプレート（上下割・税込）",
  type: "INVOICE",
  fileData: "",
  fileName: DEFAULT_INVOICE_TEMPLATE_FILE_NAME,
  sheetName: DEFAULT_INVOICE_TAX_INCLUSIVE_SHEET_NAME,
  createUserId: "system",
  fieldMappings: DEFAULT_INVOICE_TAX_INCLUSIVE_FIELD_MAPPINGS,
};

/**
 * システムデフォルトの請求書テンプレート（上下割・税抜）
 */
const SYSTEM_DEFAULT_INVOICE_TAX_EXCLUSIVE_TEMPLATE: ExcelTemplateWithFields = {
  id: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
  name: "デフォルトテンプレート（上下割・税抜）",
  type: "INVOICE",
  fileData: "",
  fileName: DEFAULT_INVOICE_TEMPLATE_FILE_NAME,
  sheetName: DEFAULT_INVOICE_TAX_EXCLUSIVE_SHEET_NAME,
  createUserId: "system",
  fieldMappings: DEFAULT_INVOICE_TAX_EXCLUSIVE_FIELD_MAPPINGS,
};

/**
 * エクスポート結果
 */
export interface ExportResult {
  workReportTemplate: {
    workbook: ExcelJS.Workbook;
    fieldMappings: ExcelTemplateWithFields["fieldMappings"];
    sheetName: string | null;
  } | null;
  invoiceTemplate: {
    workbook: ExcelJS.Workbook;
    fieldMappings: ExcelTemplateWithFields["fieldMappings"];
    sheetName: string | null;
  } | null;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (result: ExportResult) => Promise<ExportFile[]>;
  workReportTemplates: ExcelTemplateWithFields[];
  invoiceTemplates: ExcelTemplateWithFields[];
  targetDate: Date;
  // freee関連props
  isFreeeConnected: boolean;
  isCheckingFreeeConnection: boolean;
  partners: FreeePartner[];
  selectedPartnerId: number | undefined;
  onPartnerIdChange: (partnerId: number) => void;
  workReportId: string;
  clientName: string;
  workTimeText: string;
  baseAmount: number;
  taxAmount: number;
  onFreeeInvoiceCreate: () => Promise<void>;
  onConnectionStart: () => void;
}

/**
 * Base64文字列をUint8Arrayに変換
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function ExportDialog({
  open,
  onOpenChange,
  onExport,
  workReportTemplates,
  invoiceTemplates,
  targetDate,
  // freee関連props
  isFreeeConnected,
  isCheckingFreeeConnection,
  partners,
  selectedPartnerId,
  onPartnerIdChange,
  clientName,
  workTimeText,
  baseAmount,
  taxAmount,
  onFreeeInvoiceCreate,
  onConnectionStart,
}: ExportDialogProps) {
  const { settings, isLoaded, setWorkReportTemplateId, setInvoiceTemplateId } =
    useExportSettings();

  // ダイアログ状態
  const [isWorkReportEnabled, setIsWorkReportEnabled] = useState(true);
  const [isInvoiceEnabled, setIsInvoiceEnabled] = useState(false);
  const [workReportTemplateId, setWorkReportTemplateIdState] = useState<
    string | null
  >(null);
  const [invoiceTemplateId, setInvoiceTemplateIdState] = useState<
    string | null
  >(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // 初期化済みフラグ（localStorageからの復元を1回だけ実行するため）
  const isInitializedRef = useRef(false);

  // 作業報告書テンプレート一覧にデフォルトテンプレートを追加
  const allWorkReportTemplates = useMemo(
    () => [SYSTEM_DEFAULT_WORK_REPORT_TEMPLATE, ...workReportTemplates],
    [workReportTemplates],
  );

  // 請求書テンプレート一覧にデフォルトテンプレートを追加
  const allInvoiceTemplates = useMemo(
    () => [
      SYSTEM_DEFAULT_INVOICE_TAX_INCLUSIVE_TEMPLATE,
      SYSTEM_DEFAULT_INVOICE_TAX_EXCLUSIVE_TEMPLATE,
      ...invoiceTemplates,
    ],
    [invoiceTemplates],
  );

  // localStorageから設定を復元（1回だけ実行）
  useEffect(() => {
    // すでに初期化済みの場合は何もしない
    if (isInitializedRef.current) {
      return;
    }

    if (isLoaded) {
      isInitializedRef.current = true;

      if (settings.workReportTemplateId) {
        // 保存されたテンプレートが存在するか確認（デフォルトテンプレートも含む）
        const exists =
          isDefaultTemplate(settings.workReportTemplateId) ||
          workReportTemplates.some(
            (t) => t.id === settings.workReportTemplateId,
          );
        if (exists) {
          setWorkReportTemplateIdState(settings.workReportTemplateId);
        }
      }
      if (settings.invoiceTemplateId) {
        const exists =
          isDefaultInvoiceTemplate(settings.invoiceTemplateId) ||
          invoiceTemplates.some((t) => t.id === settings.invoiceTemplateId);
        if (exists) {
          setInvoiceTemplateIdState(settings.invoiceTemplateId);
          setIsInvoiceEnabled(true);
        }
      }
    }
  }, [isLoaded, settings, workReportTemplates, invoiceTemplates]);

  // テンプレートが選択されていない場合はデフォルトテンプレートを自動選択
  useEffect(() => {
    if (!workReportTemplateId && allWorkReportTemplates.length > 0) {
      setWorkReportTemplateIdState(DEFAULT_TEMPLATE_ID);
    }
    if (invoiceTemplates.length === 1 && !invoiceTemplateId) {
      setInvoiceTemplateIdState(invoiceTemplates[0].id);
    }
  }, [
    allWorkReportTemplates,
    invoiceTemplates,
    workReportTemplateId,
    invoiceTemplateId,
  ]);

  // ダイアログが開いたときにエラーをリセット
  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  // テンプレートID変更時にlocalStorageに保存
  const handleWorkReportTemplateChange = useCallback(
    (value: string) => {
      setWorkReportTemplateIdState(value);
      setWorkReportTemplateId(value);
    },
    [setWorkReportTemplateId],
  );

  const handleInvoiceTemplateChange = useCallback(
    (value: string) => {
      setInvoiceTemplateIdState(value);
      setInvoiceTemplateId(value);
    },
    [setInvoiceTemplateId],
  );

  // ファイルダウンロード処理
  const downloadFile = useCallback((blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }, []);

  // エクスポート実行
  const handleExport = async () => {
    try {
      setIsProcessing(true);
      setError("");

      // バリデーション
      if (!isWorkReportEnabled && !isInvoiceEnabled) {
        setError("少なくとも1つのファイルを選択してください。");
        return;
      }

      if (isWorkReportEnabled && !workReportTemplateId) {
        setError("作業報告書のテンプレートを選択してください。");
        return;
      }

      if (isInvoiceEnabled && !invoiceTemplateId) {
        setError("請求書のテンプレートを選択してください。");
        return;
      }

      // テンプレートの読み込み
      const workReportTemplate = isWorkReportEnabled
        ? await (async () => {
            // デフォルトテンプレートの場合はpublicフォルダから読み込み
            if (isDefaultTemplate(workReportTemplateId ?? "")) {
              const response = await fetch(`/${DEFAULT_TEMPLATE_FILE_NAME}`);
              if (!response.ok) {
                throw new Error(
                  "デフォルトテンプレートの読み込みに失敗しました",
                );
              }
              const arrayBuffer = await response.arrayBuffer();
              const workbook = new ExcelJS.Workbook();
              await workbook.xlsx.load(arrayBuffer);
              return {
                workbook,
                fieldMappings: DEFAULT_TEMPLATE_FIELD_MAPPINGS,
                sheetName: DEFAULT_TEMPLATE_SHEET_NAME,
              };
            }

            // カスタムテンプレートの場合
            const template = workReportTemplates.find(
              (t) => t.id === workReportTemplateId,
            );
            if (!template) return null;
            const bytes = base64ToUint8Array(template.fileData);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(bytes.buffer as ArrayBuffer);
            return {
              workbook,
              fieldMappings: template.fieldMappings,
              sheetName: template.sheetName,
            };
          })()
        : null;

      const invoiceTemplate = isInvoiceEnabled
        ? await (async () => {
            // デフォルトテンプレートの場合はpublicフォルダから読み込み
            if (isDefaultInvoiceTemplate(invoiceTemplateId ?? "")) {
              const response = await fetch(
                `/${DEFAULT_INVOICE_TEMPLATE_FILE_NAME}`,
              );
              if (!response.ok) {
                throw new Error(
                  "デフォルト請求書テンプレートの読み込みに失敗しました",
                );
              }
              const arrayBuffer = await response.arrayBuffer();
              const workbook = new ExcelJS.Workbook();
              await workbook.xlsx.load(arrayBuffer);

              // どちらのテンプレートかを判定
              const template = allInvoiceTemplates.find(
                (t) => t.id === invoiceTemplateId,
              );
              if (!template) return null;

              return {
                workbook,
                fieldMappings: template.fieldMappings,
                sheetName: template.sheetName,
              };
            }

            // カスタムテンプレートの場合
            const template = invoiceTemplates.find(
              (t) => t.id === invoiceTemplateId,
            );
            if (!template) return null;
            const bytes = base64ToUint8Array(template.fileData);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(bytes.buffer as ArrayBuffer);
            return {
              workbook,
              fieldMappings: template.fieldMappings,
              sheetName: template.sheetName,
            };
          })()
        : null;

      // エクスポート結果を生成
      const result: ExportResult = {
        workReportTemplate,
        invoiceTemplate,
      };

      // ファイル生成
      const files = await onExport(result);

      if (files.length === 0) {
        setError("ファイルの生成に失敗しました。");
        return;
      }

      // ダウンロード
      for (const file of files) {
        downloadFile(file.blob, file.fileName);
      }

      onOpenChange(false);
    } catch (err) {
      console.error("Export error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "エクスポート中にエラーが発生しました。",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedWorkReportTemplate = allWorkReportTemplates.find(
    (t) => t.id === workReportTemplateId,
  );
  const selectedInvoiceTemplate = allInvoiceTemplates.find(
    (t) => t.id === invoiceTemplateId,
  );

  const isExcelExportDisabled =
    isProcessing ||
    (!isWorkReportEnabled && !isInvoiceEnabled) ||
    (isWorkReportEnabled &&
      allWorkReportTemplates.length > 0 &&
      !workReportTemplateId) ||
    (isInvoiceEnabled && allInvoiceTemplates.length > 0 && !invoiceTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5" />
            エクスポート
          </DialogTitle>
          {/* <DialogDescription>出力方法を選択してください。</DialogDescription> */}
        </DialogHeader>

        <div className="space-y-5">
          {/* 作業報告書 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workReport"
                checked={isWorkReportEnabled}
                onCheckedChange={(checked) => {
                  setIsWorkReportEnabled(checked === true);
                }}
              />
              <Label
                htmlFor="workReport"
                className="flex cursor-pointer items-center gap-2"
              >
                <FileSpreadsheet className="size-4" />
                作業報告書
              </Label>
            </div>
            <div className="space-y-2 pl-6">
              <Label
                htmlFor="workReportTemplate"
                className={!isWorkReportEnabled ? "text-muted-foreground" : ""}
              >
                テンプレート
              </Label>
              <select
                id="workReportTemplate"
                value={workReportTemplateId ?? ""}
                onChange={(e) => handleWorkReportTemplateChange(e.target.value)}
                disabled={!isWorkReportEnabled}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  テンプレートを選択
                </option>
                {allWorkReportTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                    {isDefaultTemplate(template.id) ? "（システム）" : ""}
                  </option>
                ))}
              </select>
              {selectedWorkReportTemplate && (
                <div className="break-words text-xs text-muted-foreground">
                  {selectedWorkReportTemplate.fileName}
                  {selectedWorkReportTemplate.sheetName &&
                    ` (${selectedWorkReportTemplate.sheetName})`}
                </div>
              )}
            </div>
          </div>

          {/* 請求書 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="invoice"
                checked={isInvoiceEnabled}
                onCheckedChange={(checked) => {
                  setIsInvoiceEnabled(checked === true);
                }}
              />
              <Label
                htmlFor="invoice"
                className="flex cursor-pointer items-center gap-2"
              >
                <FileText className="size-4" />
                請求書
              </Label>
            </div>
            <div className="space-y-2 pl-6">
              <Label
                htmlFor="invoiceTemplate"
                className={!isInvoiceEnabled ? "text-muted-foreground" : ""}
              >
                テンプレート
              </Label>
              {allInvoiceTemplates.length > 0 ? (
                <>
                  <select
                    id="invoiceTemplate"
                    value={invoiceTemplateId ?? ""}
                    onChange={(e) =>
                      handleInvoiceTemplateChange(e.target.value)
                    }
                    disabled={!isInvoiceEnabled}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>
                      テンプレートを選択
                    </option>
                    {allInvoiceTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                        {isDefaultInvoiceTemplate(template.id)
                          ? "（システム）"
                          : ""}
                      </option>
                    ))}
                  </select>
                  {selectedInvoiceTemplate && (
                    <div className="break-words text-xs text-muted-foreground">
                      {selectedInvoiceTemplate.fileName}
                      {selectedInvoiceTemplate.sheetName &&
                        ` (${selectedInvoiceTemplate.sheetName})`}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-md border border-dashed border-gray-300 p-3 text-center text-sm text-muted-foreground">
                  テンプレートが登録されていません
                </div>
              )}
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isProcessing}
          >
            キャンセル
          </Button>
          <Button onClick={handleExport} disabled={isExcelExportDisabled}>
            {isProcessing ? "処理中..." : "エクスポート"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
