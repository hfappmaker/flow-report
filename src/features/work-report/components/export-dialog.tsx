"use client";

import ExcelJS from "exceljs";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  Settings,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExportSettings } from "@/features/work-report/hooks/use-export-settings";
import {
  formatZipFileName,
  generateZipFile,
} from "@/features/work-report/libs/zip-generator";
import type { ExportFile } from "@/features/work-report/types/export-types";
import type { WorkReportTemplateWithFields } from "@/features/work-report/types/work-report-template";

/**
 * エクスポート結果
 */
export interface ExportResult {
  workReportTemplate: {
    workbook: ExcelJS.Workbook;
    fieldMappings: WorkReportTemplateWithFields["fieldMappings"];
    sheetName: string | null;
  } | null;
  invoiceTemplate: {
    workbook: ExcelJS.Workbook;
    fieldMappings: WorkReportTemplateWithFields["fieldMappings"];
    sheetName: string | null;
  } | null;
  zipOptions: {
    enabled: boolean;
    password: string | null;
  };
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (result: ExportResult) => Promise<ExportFile[]>;
  workReportTemplates: WorkReportTemplateWithFields[];
  invoiceTemplates: WorkReportTemplateWithFields[];
  targetDate: Date;
  userName: string;
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
  userName,
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
  const [isZipEnabled, setIsZipEnabled] = useState(false);
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // localStorageから設定を復元
  useEffect(() => {
    if (isLoaded) {
      if (settings.workReportTemplateId) {
        // 保存されたテンプレートが存在するか確認
        const exists = workReportTemplates.some(
          (t) => t.id === settings.workReportTemplateId,
        );
        if (exists) {
          setWorkReportTemplateIdState(settings.workReportTemplateId);
        }
      }
      if (settings.invoiceTemplateId) {
        const exists = invoiceTemplates.some(
          (t) => t.id === settings.invoiceTemplateId,
        );
        if (exists) {
          setInvoiceTemplateIdState(settings.invoiceTemplateId);
          setIsInvoiceEnabled(true);
        }
      }
    }
  }, [isLoaded, settings, workReportTemplates, invoiceTemplates]);

  // テンプレートが1つだけの場合は自動選択
  useEffect(() => {
    if (workReportTemplates.length === 1 && !workReportTemplateId) {
      setWorkReportTemplateIdState(workReportTemplates[0].id);
    }
    if (invoiceTemplates.length === 1 && !invoiceTemplateId) {
      setInvoiceTemplateIdState(invoiceTemplates[0].id);
    }
  }, [
    workReportTemplates,
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

      if (isZipEnabled && isPasswordEnabled && !password) {
        setError("パスワードを入力してください。");
        return;
      }

      // テンプレートの読み込み
      const workReportTemplate = isWorkReportEnabled
        ? await (async () => {
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
        zipOptions: {
          enabled: isZipEnabled,
          password: isPasswordEnabled ? password : null,
        },
      };

      // ファイル生成
      const files = await onExport(result);

      if (files.length === 0) {
        setError("ファイルの生成に失敗しました。");
        return;
      }

      // ダウンロード
      if (isZipEnabled) {
        const zipBlob = await generateZipFile(
          files,
          isPasswordEnabled ? password : undefined,
        );
        const zipFileName = formatZipFileName(targetDate, userName);
        downloadFile(zipBlob, zipFileName);
      } else {
        // 個別ダウンロード
        for (const file of files) {
          downloadFile(file.blob, file.fileName);
        }
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

  const selectedWorkReportTemplate = workReportTemplates.find(
    (t) => t.id === workReportTemplateId,
  );
  const selectedInvoiceTemplate = invoiceTemplates.find(
    (t) => t.id === invoiceTemplateId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5" />
            エクスポート
          </DialogTitle>
          <DialogDescription>
            出力するファイルとテンプレートを選択してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
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
            {isWorkReportEnabled && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="workReportTemplate">テンプレート</Label>
                {workReportTemplates.length > 0 ? (
                  <>
                    <Select
                      value={workReportTemplateId ?? ""}
                      onValueChange={handleWorkReportTemplateChange}
                    >
                      <SelectTrigger id="workReportTemplate">
                        <SelectValue placeholder="テンプレートを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {workReportTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="size-4" />
                              <span>{template.name}</span>
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
                  </>
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 p-3 text-center text-sm text-muted-foreground">
                    テンプレートが登録されていません
                  </div>
                )}
              </div>
            )}
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
            {isInvoiceEnabled && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="invoiceTemplate">テンプレート</Label>
                {invoiceTemplates.length > 0 ? (
                  <>
                    <Select
                      value={invoiceTemplateId ?? ""}
                      onValueChange={handleInvoiceTemplateChange}
                    >
                      <SelectTrigger id="invoiceTemplate">
                        <SelectValue placeholder="テンプレートを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoiceTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="size-4" />
                              <span>{template.name}</span>
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
            )}
          </div>

          {/* 区切り線 */}
          <div className="border-t" />

          {/* ZIP圧縮オプション */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="zip"
                checked={isZipEnabled}
                onCheckedChange={(checked) => {
                  setIsZipEnabled(checked === true);
                  if (!checked) {
                    setIsPasswordEnabled(false);
                    setPassword("");
                  }
                }}
              />
              <Label
                htmlFor="zip"
                className="flex cursor-pointer items-center gap-2"
              >
                <Archive className="size-4" />
                ZIPに圧縮する
              </Label>
            </div>

            {isZipEnabled && (
              <div className="space-y-3 pl-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="password"
                    checked={isPasswordEnabled}
                    onCheckedChange={(checked) => {
                      setIsPasswordEnabled(checked === true);
                      if (!checked) {
                        setPassword("");
                      }
                    }}
                  />
                  <Label
                    htmlFor="password"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Lock className="size-4" />
                    パスワードを設定する
                  </Label>
                </div>

                {isPasswordEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="passwordInput">パスワード</Label>
                    <Input
                      id="passwordInput"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      placeholder="パスワードを入力"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Link href="/templates">
            <Button variant="ghost" size="sm" type="button">
              <Settings className="mr-1 size-4" />
              テンプレート管理
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
              disabled={isProcessing}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleExport}
              disabled={
                isProcessing ||
                (!isWorkReportEnabled && !isInvoiceEnabled) ||
                (isWorkReportEnabled &&
                  workReportTemplates.length > 0 &&
                  !workReportTemplateId) ||
                (isInvoiceEnabled &&
                  invoiceTemplates.length > 0 &&
                  !invoiceTemplateId)
              }
            >
              {isProcessing ? "処理中..." : "エクスポート"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
