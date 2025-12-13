"use client";

import ExcelJS from "exceljs";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatAmount } from "@/features/contract/utils/contract-calculation-utils";
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
import type {
  ExportFile,
  ExportTabType,
} from "@/features/work-report/types/export-types";
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
  const {
    settings,
    isLoaded,
    setWorkReportTemplateId,
    setInvoiceTemplateId,
    setActiveTab,
  } = useExportSettings();

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
  // タブ状態
  const [activeTab, setActiveTabState] = useState<ExportTabType>("excel");
  // 初期化済みフラグ（localStorageからの復元を1回だけ実行するため）
  const isInitializedRef = useRef(false);
  // freee請求書作成状態
  const [isCreatingFreeeInvoice, setIsCreatingFreeeInvoice] = useState(false);

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
      // タブ状態を復元（freeeタブは一時的に非表示のため、excelに強制）
      setActiveTabState("excel");
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

  // タブ変更時にlocalStorageに保存
  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as ExportTabType;
      setActiveTabState(tab);
      setActiveTab(tab);
      setError("");
    },
    [setActiveTab],
  );

  // freee請求書作成処理
  const handleCreateFreeeInvoice = useCallback(async () => {
    if (!selectedPartnerId) {
      setError("取引先を選択してください。");
      return;
    }

    setIsCreatingFreeeInvoice(true);
    setError("");

    try {
      await onFreeeInvoiceCreate();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create freee invoice:", err);
      setError(
        err instanceof Error
          ? err.message
          : "請求書の作成中にエラーが発生しました。",
      );
    } finally {
      setIsCreatingFreeeInvoice(false);
    }
  }, [selectedPartnerId, onFreeeInvoiceCreate, onOpenChange]);

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

  const isFreeeCreateDisabled =
    isCreatingFreeeInvoice ||
    !isFreeeConnected ||
    isCheckingFreeeConnection ||
    !selectedPartnerId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5" />
            エクスポート
          </DialogTitle>
          {/* <DialogDescription>出力方法を選択してください。</DialogDescription> */}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <FileSpreadsheet className="size-4" />
                Excelエクスポート
              </TabsTrigger>
              {/* freee請求書タブは将来の変更に備えて一時的に非表示 */}
              {/* <TabsTrigger value="freee" className="flex items-center gap-2">
              freee請求書
            </TabsTrigger> */}
            </TabsList>

            {/* Excelエクスポートタブ */}
            <TabsContent value="excel" className="space-y-5 py-4">
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
                    className={
                      !isWorkReportEnabled ? "text-muted-foreground" : ""
                    }
                  >
                    テンプレート
                  </Label>
                  <Select
                    value={workReportTemplateId ?? ""}
                    onValueChange={handleWorkReportTemplateChange}
                    disabled={!isWorkReportEnabled}
                  >
                    <SelectTrigger id="workReportTemplate">
                      <SelectValue placeholder="テンプレートを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {allWorkReportTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                            <FileSpreadsheet className="size-4 shrink-0" />
                            <span className="truncate">{template.name}</span>
                            {isDefaultTemplate(template.id) && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                              >
                                システム
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWorkReportTemplate && (
                    <div className="text-xs text-muted-foreground">
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
                      <Select
                        value={invoiceTemplateId ?? ""}
                        onValueChange={handleInvoiceTemplateChange}
                        disabled={!isInvoiceEnabled}
                      >
                        <SelectTrigger id="invoiceTemplate">
                          <SelectValue placeholder="テンプレートを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {allInvoiceTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex min-w-0 items-center gap-2 overflow-hidden">
                                <FileText className="size-4 shrink-0" />
                                <span className="truncate">
                                  {template.name}
                                </span>
                                {isDefaultInvoiceTemplate(template.id) && (
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0 text-xs"
                                  >
                                    システム
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedInvoiceTemplate && (
                        <div className="text-xs text-muted-foreground">
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
            </TabsContent>

            {/* freee請求書タブ */}
            {/* <TabsContent value="freee" className="space-y-4 py-4">
            {isCheckingFreeeConnection ? (
              <p className="text-center text-muted-foreground">
                freee連携状態を確認中...
              </p>
            ) : !isFreeeConnected ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    freeeとの連携が必要です。
                  </p>
                  <p className="text-sm text-muted-foreground">
                    freeeアカウントと連携すると、作業報告書から請求書を作成できます。
                  </p>
                </div>
                <FreeeConnectionButton
                  disabled={false}
                  onConnectionStart={onConnectionStart}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-select">取引先（必須）</Label>
                  <Select
                    value={selectedPartnerId?.toString()}
                    onValueChange={(value) => {
                      onPartnerIdChange(parseInt(value, 10));
                    }}
                  >
                    <SelectTrigger id="partner-select">
                      <SelectValue placeholder="取引先を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((partner) => (
                        <SelectItem
                          key={partner.id}
                          value={partner.id.toString()}
                        >
                          {partner.name}
                          {partner.code ? ` (${partner.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    以下の内容でfreee請求書を作成します：
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>
                      対象月: {targetDate.getFullYear()}年
                      {targetDate.getMonth() + 1}月度
                    </li>
                    <li>
                      取引先:{" "}
                      {selectedPartnerId
                        ? (partners.find((p) => p.id === selectedPartnerId)
                            ?.name ?? clientName)
                        : "未選択"}
                    </li>
                    <li>総稼働時間: {workTimeText}</li>
                    <li>金額: {formatAmount(baseAmount + taxAmount)}</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    ※ freee上でドラフト（下書き）として作成されます
                  </p>
                </div>

                {/* freee再連携ボタン *}
                <div className="border-t pt-4">
                  <FreeeConnectionButton
                    disabled={false}
                    onConnectionStart={onConnectionStart}
                    label="freee再連携"
                  />
                </div>
              </div>
            )}
          </TabsContent> */}
          </Tabs>

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isProcessing || isCreatingFreeeInvoice}
          >
            キャンセル
          </Button>
          {activeTab === "excel" ? (
            <Button onClick={handleExport} disabled={isExcelExportDisabled}>
              {isProcessing ? "処理中..." : "エクスポート"}
            </Button>
          ) : (
            <Button
              onClick={handleCreateFreeeInvoice}
              disabled={isFreeeCreateDisabled}
            >
              {isCreatingFreeeInvoice ? "作成中..." : "作成"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
