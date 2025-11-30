"use client";

import { FileSpreadsheet } from "lucide-react";

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
  ExcelTemplateForm,
  type ExcelTemplateFormValues,
} from "@/features/work-report/components/work-report-template-form";
import type { ExcelTemplateWithFields } from "@/features/work-report/types/work-report-template";

export type DialogType = "create" | "edit" | "delete" | "details" | null;

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
      case "details":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">基本情報</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">テンプレート名:</span>
                  <span>{template?.name}</span>
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
                  onOpenChange(false);
                }}
              >
                閉じる
              </Button>
            </div>
          </div>
        );
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
