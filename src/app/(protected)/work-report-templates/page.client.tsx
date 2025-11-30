"use client";

import { FileSpreadsheet, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Spinner } from "@/components/ui/loading/spinner";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  createWorkReportTemplateAction,
  updateWorkReportTemplateAction,
  deleteWorkReportTemplateAction,
  getWorkReportTemplatesByUserIdAction,
} from "@/features/work-report/actions/work-report-template";
import {
  WorkReportTemplateDialog,
  type DialogType,
} from "@/features/work-report/components/work-report-template-dialog";
import type { WorkReportTemplateFormValues } from "@/features/work-report/components/work-report-template-form";
import type { WorkReportTemplateWithFields } from "@/features/work-report/types/work-report-template";
import { useMessageState } from "@/hooks/use-message-state";

/**
 * FileをBase64文字列に変換
 */
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binary);
}

interface WorkReportTemplatesClientPageProps {
  userId: string;
}

export default function WorkReportTemplatesClientPage({
  userId,
}: WorkReportTemplatesClientPageProps) {
  const [templates, setTemplates] = useState<WorkReportTemplateWithFields[]>(
    [],
  );
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [activeTemplate, setActiveTemplate] =
    useState<WorkReportTemplateWithFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, success, showError, showSuccess } = useMessageState();
  const { startTransition } = useTransitionContext();

  const refreshTemplates = useCallback(async () => {
    try {
      const data = await getWorkReportTemplatesByUserIdAction(userId);
      setTemplates(data);
    } catch (err) {
      console.error(err);
      showError("テンプレートの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [userId, showError]);

  useEffect(() => {
    startTransition(async () => {
      await refreshTemplates();
    });
  }, [refreshTemplates, startTransition]);

  const closeDialog = () => {
    setActiveDialog(null);
    setActiveTemplate(null);
  };

  // テンプレート作成
  const onCreateTemplate = async (data: WorkReportTemplateFormValues) => {
    if (!data.file) {
      showError("Excelファイルは必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileData = await fileToBase64(data.file);
      await createWorkReportTemplateAction({
        name: data.name,
        fileData,
        fileName: data.file.name,
        createUserId: userId,
        fieldMappings: data.fieldMappings.map((m) => ({
          namedRange: m.namedRange,
          valueTemplate: m.valueTemplate,
          numFmt: m.numFmt ?? null,
        })),
      });
      showSuccess(`テンプレート '${data.name}' を作成しました`);
      closeDialog();
      await refreshTemplates();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError("テンプレートの作成に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // テンプレート編集
  const onEditTemplate = async (data: WorkReportTemplateFormValues) => {
    if (!activeTemplate) return;

    setIsSubmitting(true);
    try {
      const baseUpdateData = {
        name: data.name,
        fieldMappings: data.fieldMappings.map((m) => ({
          namedRange: m.namedRange,
          valueTemplate: m.valueTemplate,
          numFmt: m.numFmt ?? null,
        })),
      };

      // ファイルが選択されている場合のみ更新
      const updateData = data.file
        ? {
            ...baseUpdateData,
            fileData: await fileToBase64(data.file),
            fileName: data.file.name,
          }
        : baseUpdateData;

      await updateWorkReportTemplateAction(activeTemplate.id, updateData);
      showSuccess(`テンプレート '${data.name}' を更新しました`);
      closeDialog();
      await refreshTemplates();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError("テンプレートの更新に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // テンプレート削除
  const onDeleteTemplate = async () => {
    if (!activeTemplate) return;

    setIsSubmitting(true);
    try {
      await deleteWorkReportTemplateAction(activeTemplate.id);
      showSuccess(`テンプレート '${activeTemplate.name}' を削除しました`);
      closeDialog();
      await refreshTemplates();
    } catch (err) {
      console.error(err);
      showError("テンプレートの削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-3 font-semibold">
          <FileSpreadsheet className="text-3xl text-sky-400" />
          <p className="text-2xl">作業報告書テンプレート</p>
        </div>
        <Button
          onClick={() => {
            setActiveDialog("create");
          }}
          className="flex items-center gap-1"
        >
          <Plus className="size-4" />
          新規作成
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <FormError
            message={error.message}
            resetSignal={error.date.getTime()}
          />
        </div>
        <div className="mb-4">
          <FormSuccess
            message={success.message}
            resetSignal={success.date.getTime()}
          />
        </div>

        {templates.length > 0 ? (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <button
                  type="button"
                  className="flex-1 cursor-pointer text-left"
                  onClick={() => {
                    setActiveTemplate(template);
                    setActiveDialog("details");
                  }}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileSpreadsheet className="size-4" />
                    {template.fileName}
                    {template.fieldMappings.length > 0 && (
                      <span className="ml-2">
                        ({template.fieldMappings.length} フィールド)
                      </span>
                    )}
                  </div>
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTemplate(template);
                      setActiveDialog("details");
                    }}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTemplate(template);
                      setActiveDialog("edit");
                    }}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTemplate(template);
                      setActiveDialog("delete");
                    }}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSpreadsheet className="mb-4 size-12 text-muted-foreground" />
            <p className="text-muted-foreground">テンプレートがありません。</p>
            <p className="text-sm text-muted-foreground">
              「新規作成」ボタンからテンプレートを追加してください。
            </p>
          </div>
        )}

        <WorkReportTemplateDialog
          type={activeDialog}
          isOpen={activeDialog !== null}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          template={activeTemplate}
          onSubmit={
            activeDialog === "create" ? onCreateTemplate : onEditTemplate
          }
          onDelete={onDeleteTemplate}
          onCancel={closeDialog}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
