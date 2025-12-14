"use client";

import ExcelJS from "exceljs";
import { FileSpreadsheet, Upload, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExcelTemplateWithFields } from "@/features/work-report/types/work-report-template";

/**
 * テンプレート選択時に返却する情報
 */
export interface TemplateSelectionResult {
  workbook: ExcelJS.Workbook;
  fieldMappings: ExcelTemplateWithFields["fieldMappings"];
  sheetName: string | null;
}

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: TemplateSelectionResult | null) => Promise<void>;
  customTemplates: ExcelTemplateWithFields[];
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

export function TemplateSelectionDialog({
  open,
  onOpenChange,
  onConfirm,
  customTemplates,
}: TemplateSelectionDialogProps) {
  const [templateType, setTemplateType] = useState<"default" | "custom">(
    "default",
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ダイアログが開いたときに状態をリセット
  useEffect(() => {
    if (open) {
      setError("");
      // カスタムテンプレートが1つだけの場合は自動選択
      if (customTemplates.length === 1 && templateType === "custom") {
        setSelectedTemplateId(customTemplates[0].id);
      }
    }
  }, [open, customTemplates, templateType]);

  // テンプレートタイプが変わったときに選択をリセット
  useEffect(() => {
    if (templateType === "custom" && customTemplates.length === 1) {
      setSelectedTemplateId(customTemplates[0].id);
    } else if (templateType === "default") {
      setSelectedTemplateId("");
    }
  }, [templateType, customTemplates]);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError("");

      if (templateType === "default") {
        // デフォルトテンプレートを使用（フィールドマッピングなし）
        await onConfirm(null);
      } else {
        // カスタムテンプレートを使用
        if (!selectedTemplateId) {
          setError("テンプレートを選択してください。");
          return;
        }

        const selectedTemplate = customTemplates.find(
          (t) => t.id === selectedTemplateId,
        );
        if (!selectedTemplate) {
          setError("選択されたテンプレートが見つかりません。");
          return;
        }

        // Base64からワークブックを読み込み
        const bytes = base64ToUint8Array(selectedTemplate.fileData);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(bytes.buffer as ArrayBuffer);

        await onConfirm({
          workbook,
          fieldMappings: selectedTemplate.fieldMappings,
          sheetName: selectedTemplate.sheetName,
        });
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

  const selectedTemplate = customTemplates.find(
    (t) => t.id === selectedTemplateId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>作業報告書テンプレート選択</DialogTitle>
          <DialogDescription>
            デフォルトテンプレートまたはカスタムテンプレートを選択してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={templateType}
            onValueChange={(value) => {
              setTemplateType(value as "default" | "custom");
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="size-4" />
                  <span>デフォルトテンプレート</span>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="custom"
                id="custom"
                disabled={customTemplates.length === 0}
              />
              <Label
                htmlFor="custom"
                className={`cursor-pointer ${customTemplates.length === 0 ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="size-4" />
                  <span>カスタムテンプレート</span>
                  {customTemplates.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      (未登録)
                    </span>
                  )}
                </div>
              </Label>
            </div>
          </RadioGroup>

          {templateType === "custom" && customTemplates.length > 0 && (
            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label htmlFor="template-select">テンプレートを選択</Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="テンプレートを選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {customTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="size-4" />
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileSpreadsheet className="size-4" />
                      <span>{selectedTemplate.fileName}</span>
                    </div>
                    {selectedTemplate.sheetName && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        シート: {selectedTemplate.sheetName}
                      </div>
                    )}
                    {selectedTemplate.fieldMappings.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {selectedTemplate.fieldMappings.length}{" "}
                        件のフィールドマッピング
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {templateType === "custom" && customTemplates.length === 0 && (
            <div className="ml-6 rounded-md border border-dashed border-gray-300 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                カスタムテンプレートが登録されていません。
              </p>
              <Link href="/templates">
                <Button variant="link" size="sm" className="mt-2">
                  <Settings className="mr-1 size-4" />
                  テンプレート管理画面へ
                </Button>
              </Link>
            </div>
          )}

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
              onClick={handleConfirm}
              disabled={
                isProcessing ||
                (templateType === "custom" && !selectedTemplateId)
              }
            >
              {isProcessing ? "処理中..." : "作成"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
