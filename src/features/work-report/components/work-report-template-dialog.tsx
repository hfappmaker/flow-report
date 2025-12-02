"use client";

import { Download, FileSpreadsheet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_TEMPLATE_FILE_NAME,
  isDefaultTemplate,
} from "@/features/work-report/constants/default-template";
import type { ExcelTemplateWithFields } from "@/features/work-report/types/work-report-template";
import {
  ExcelTemplateForm,
  type ExcelTemplateFormValues,
} from "./work-report-template-form";

export type DialogType = "create" | "edit" | "delete" | "details" | null;

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

interface ExcelTemplateDialogProps {
  type: DialogType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ExcelTemplateWithFields | null;
  onSubmit: (values: ExcelTemplateFormValues) => void;
  onDelete?: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ExcelTemplateDialog({
  type,
  isOpen,
  onOpenChange,
  template,
  onSubmit,
  onDelete,
  onCancel,
  isSubmitting = false,
}: ExcelTemplateDialogProps) {
  const handleDownloadTemplate = async () => {
    if (!template) return;

    const isSystem = isDefaultTemplate(template.id);

    if (isSystem) {
      const response = await fetch(`/${DEFAULT_TEMPLATE_FILE_NAME}`);
      const blob = await response.blob();
      downloadBlob(blob, DEFAULT_TEMPLATE_FILE_NAME);
    } else {
      const bytes = base64ToUint8Array(template.fileData);
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, template.fileName);
    }
  };

  const getDialogTitle = () => {
    switch (type) {
      case "create":
        return "新規テンプレート作成";
      case "edit":
        return "テンプレートを編集";
      case "delete":
        return "テンプレートの削除確認";
      case "details":
        return "テンプレート詳細";
      default:
        return "";
    }
  };

  const renderContent = () => {
    switch (type) {
      case "create":
        return (
          <ExcelTemplateForm
            onSubmit={onSubmit}
            submitButtonText="作成"
            onCancel={onCancel}
            isSubmitting={isSubmitting}
          />
        );
      case "edit":
        return (
          <ExcelTemplateForm
            defaultValues={
              template
                ? {
                    name: template.name,
                    fileName: template.fileName,
                    sheetName: template.sheetName,
                    fieldMappings: template.fieldMappings.map((m) => ({
                      namedRange: m.namedRange,
                      valueTemplate: m.valueTemplate,
                      numFmt: m.numFmt,
                    })),
                  }
                : undefined
            }
            onSubmit={onSubmit}
            submitButtonText="更新"
            onCancel={onCancel}
            isSubmitting={isSubmitting}
          />
        );
      case "delete":
        return (
          <>
            <div>
              <p>
                本当にテンプレート &quot;{template?.name}&quot; を削除しますか？
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                この操作は元に戻すことができません。
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "削除中..." : "削除"}
              </Button>
            </div>
          </>
        );
      case "details": {
        const isSystem = template ? isDefaultTemplate(template.id) : false;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">基本情報</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">テンプレート名:</span>
                  <span>{template?.name}</span>
                  {isSystem && (
                    <Badge variant="secondary" className="text-xs">
                      システム
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">ファイル名:</span>
                  <div className="flex items-center gap-1">
                    <FileSpreadsheet className="size-4 text-gray-500" />
                    <span>{template?.fileName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">シート名:</span>
                  <span>{template?.sheetName ?? "（最初のシート）"}</span>
                </div>
              </div>
            </div>

            {template && template.fieldMappings.length > 0 && (
              <div>
                <h3 className="text-lg font-medium">フィールドマッピング</h3>
                <div className="mt-2 space-y-2">
                  {template.fieldMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center gap-2 rounded border p-2 text-sm"
                    >
                      <span className="font-mono text-muted-foreground">
                        {mapping.namedRange}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono">{mapping.valueTemplate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  void handleDownloadTemplate();
                }}
              >
                <Download className="mr-2 size-4" />
                ダウンロード
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                閉じる
              </Button>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">{renderContent()}</div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
