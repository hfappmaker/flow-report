"use client";

import ExcelJS from "exceljs";
import { FileSpreadsheet, Settings, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getTemplateConfigAction,
  getTemplateConfigsAction,
} from "@/features/work-report/actions/work-report-template-config";
import { TemplateConfigDialog } from "@/features/work-report/components/template-config-dialog";
import type {
  TemplateConfigListItem,
  TemplateFieldMapping,
} from "@/features/work-report/types/work-report-template-config";

export interface TemplateSelectionResult {
  workbook: ExcelJS.Workbook | null;
  fieldMapping: TemplateFieldMapping | null;
}

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: TemplateSelectionResult) => Promise<void>;
}

type TemplateType = "default" | "saved" | "upload";

export function TemplateSelectionDialog({
  open,
  onOpenChange,
  onConfirm,
}: TemplateSelectionDialogProps) {
  const [templateType, setTemplateType] = useState<TemplateType>("default");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // 保存済みテンプレート設定
  const [savedConfigs, setSavedConfigs] = useState<TemplateConfigListItem[]>(
    [],
  );
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSavedConfigs = useCallback(async () => {
    try {
      setIsLoadingConfigs(true);
      const configs = await getTemplateConfigsAction();
      setSavedConfigs(configs);
      // 設定がある場合、最初のものを選択
      if (configs.length > 0 && !selectedConfigId) {
        setSelectedConfigId(configs[0].id);
      }
    } catch (err) {
      console.error("Failed to load configs:", err);
    } finally {
      setIsLoadingConfigs(false);
    }
  }, [selectedConfigId]);

  useEffect(() => {
    if (open) {
      loadSavedConfigs();
    }
  }, [open, loadSavedConfigs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setError(
        "ファイル形式が正しくありません。.xlsxファイルを選択してください。",
      );
      setSelectedFile(null);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。",
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError("");

      if (templateType === "default") {
        // デフォルトテンプレートを使用
        await onConfirm({ workbook: null, fieldMapping: null });
      } else if (templateType === "saved") {
        // 保存済みの設定を使用
        if (!selectedConfigId) {
          setError("テンプレート設定を選択してください。");
          return;
        }

        const config = await getTemplateConfigAction(selectedConfigId);
        if (!config) {
          setError("選択したテンプレート設定が見つかりません。");
          return;
        }

        // Base64からワークブックを読み込み
        const binary = atob(config.templateFile);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(bytes.buffer);

        await onConfirm({ workbook, fieldMapping: config.fieldMapping });
      } else if (templateType === "upload") {
        // アップロードされたファイルを使用（フィールドマッピングなし）
        if (!selectedFile) {
          setError("テンプレートファイルを選択してください。");
          return;
        }

        const buffer = await selectedFile.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        await onConfirm({ workbook, fieldMapping: null });
      }

      onOpenChange(false);
    } catch (err) {
      console.error("Template processing error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "テンプレートの処理中にエラーが発生しました。",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfigDialogClose = (isOpen: boolean) => {
    setIsConfigDialogOpen(isOpen);
    if (!isOpen) {
      // ダイアログを閉じた時に設定を再読み込み
      loadSavedConfigs();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>作業報告書テンプレート選択</DialogTitle>
            <DialogDescription>
              テンプレートを選択してください。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup
              value={templateType}
              onValueChange={(value) => setTemplateType(value as TemplateType)}
            >
              {/* デフォルトテンプレート */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="default" />
                <Label htmlFor="default" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>デフォルトテンプレート</span>
                  </div>
                </Label>
              </div>

              {/* 保存済みカスタムテンプレート */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="saved"
                  id="saved"
                  disabled={savedConfigs.length === 0}
                />
                <Label
                  htmlFor="saved"
                  className={`cursor-pointer ${savedConfigs.length === 0 ? "text-gray-400" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>保存済みカスタムテンプレート</span>
                    {savedConfigs.length > 0 && (
                      <span className="text-sm text-gray-500">
                        ({savedConfigs.length}件)
                      </span>
                    )}
                  </div>
                </Label>
              </div>

              {/* ファイルアップロード */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>ファイルをアップロード</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* 保存済みテンプレート選択 */}
            {templateType === "saved" && (
              <div className="space-y-3 pl-6">
                {isLoadingConfigs ? (
                  <div className="text-sm text-gray-500">読み込み中...</div>
                ) : savedConfigs.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    保存済みのテンプレート設定がありません。
                    <br />
                    「テンプレート設定」ボタンから新規作成してください。
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedConfigs.map((config) => (
                      <div
                        key={config.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
                          selectedConfigId === config.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedConfigId(config.id)}
                      >
                        <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm text-gray-500">
                            {config.templateFileName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ファイルアップロード */}
            {templateType === "upload" && (
              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="template-file">
                    テンプレートファイル (.xlsx)
                  </Label>
                  <Input
                    id="template-file"
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      選択: {selectedFile.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    ※
                    アップロードしたファイルはデフォルトの名前付き範囲名で処理されます。
                    <br />
                    カスタムの名前付き範囲名を使用する場合は「テンプレート設定」から登録してください。
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsConfigDialogOpen(true)}
              className="sm:mr-auto"
            >
              <Settings className="mr-2 h-4 w-4" />
              テンプレート設定
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                キャンセル
              </Button>
              <Button onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? "処理中..." : "作成"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TemplateConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={handleConfigDialogClose}
      />
    </>
  );
}
