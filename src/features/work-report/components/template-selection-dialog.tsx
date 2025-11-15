"use client";

import ExcelJS from "exceljs";
import { FileSpreadsheet, Upload, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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

const TEMPLATE_STORAGE_KEY = "workReportCustomTemplate";
const TEMPLATE_NAME_STORAGE_KEY = "workReportCustomTemplateName";

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (workbook: ExcelJS.Workbook | null) => Promise<void>;
}

export function TemplateSelectionDialog({
  open,
  onOpenChange,
  onConfirm,
}: TemplateSelectionDialogProps) {
  const [templateType, setTemplateType] = useState<"default" | "custom">(
    "default",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedTemplateName, setSavedTemplateName] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for saved template when dialog opens
  useEffect(() => {
    if (open) {
      const savedName = localStorage.getItem(TEMPLATE_NAME_STORAGE_KEY);
      setSavedTemplateName(savedName);
    }
  }, [open]);

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

  const handleDeleteSavedTemplate = () => {
    localStorage.removeItem(TEMPLATE_STORAGE_KEY);
    localStorage.removeItem(TEMPLATE_NAME_STORAGE_KEY);
    setSavedTemplateName(null);
    setTemplateType("default");
  };

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setError("");

      if (templateType === "default") {
        // Use default template
        await onConfirm(null);
      } else {
        // Use custom template
        let workbook: ExcelJS.Workbook;

        if (selectedFile) {
          // Load from newly uploaded file
          const buffer = await selectedFile.arrayBuffer();
          workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);

          // Save to localStorage for future use
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          localStorage.setItem(TEMPLATE_STORAGE_KEY, base64);
          localStorage.setItem(TEMPLATE_NAME_STORAGE_KEY, selectedFile.name);
          // Update state to reflect the newly saved template
          setSavedTemplateName(selectedFile.name);
          setSelectedFile(null);
        } else if (savedTemplateName) {
          // Load from localStorage
          const base64 = localStorage.getItem(TEMPLATE_STORAGE_KEY);
          if (!base64) {
            throw new Error("保存されたテンプレートが見つかりません。");
          }

          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(bytes.buffer);
        } else {
          setError("カスタムテンプレートを選択してください。");
          return;
        }

        await onConfirm(workbook);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Upload className="size-4" />
                  <span>カスタムテンプレート</span>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {templateType === "custom" && (
            <div className="space-y-3 pl-6">
              {savedTemplateName && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="size-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {savedTemplateName}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteSavedTemplate}
                    className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="template-file">
                  {savedTemplateName
                    ? "新しいテンプレートをアップロード"
                    : "テンプレートファイル (.xlsx)"}
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
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
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
            onClick={() => {
              void handleConfirm();
            }}
            disabled={isProcessing}
          >
            {isProcessing ? "処理中..." : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
