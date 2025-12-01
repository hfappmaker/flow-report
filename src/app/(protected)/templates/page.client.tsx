"use client";

import type { TemplateType } from "@prisma/client";
import { FileSpreadsheet, FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Spinner } from "@/components/ui/loading/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransitionContext } from "@/contexts/transition-context";
import { MAX_TEMPLATES_PER_TYPE } from "@/features/work-report/constants/work-report-constants";
import {
  createExcelTemplateAction,
  updateExcelTemplateAction,
  deleteExcelTemplateAction,
  getExcelTemplatesByUserIdAndTypeAction,
} from "@/features/work-report/actions/work-report-template";
import {
  ExcelTemplateDialog,
  type DialogType,
} from "@/features/work-report/components/work-report-template-dialog";
import type { ExcelTemplateFormValues } from "@/features/work-report/components/work-report-template-form";
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_TEMPLATE_NAME,
  DEFAULT_TEMPLATE_FILE_NAME,
  DEFAULT_TEMPLATE_FIELD_MAPPINGS,
  isDefaultTemplate,
} from "@/features/work-report/constants/default-template";
import type { ExcelTemplateWithFields } from "@/features/work-report/types/work-report-template";
import { useMessageState } from "@/hooks/use-message-state";

/**
 * システムデフォルトの作業報告書テンプレート（読み取り専用）
 */
const SYSTEM_DEFAULT_WORK_REPORT_TEMPLATE: ExcelTemplateWithFields = {
  id: DEFAULT_TEMPLATE_ID,
  name: DEFAULT_TEMPLATE_NAME,
  type: "WORK_REPORT",
  fileData: "", // UIでは使用しない（エクスポート時はpublicフォルダから読み込み）
  fileName: DEFAULT_TEMPLATE_FILE_NAME,
  sheetName: null,
  createUserId: "system",
  fieldMappings: DEFAULT_TEMPLATE_FIELD_MAPPINGS,
};

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

interface TemplatesClientPageProps {
  userId: string;
}

const TAB_CONFIG = {
  WORK_REPORT: {
    label: "作業報告書",
    icon: FileSpreadsheet,
    emptyMessage: "作業報告書テンプレートがありません。",
  },
  INVOICE: {
    label: "請求書",
    icon: FileText,
    emptyMessage: "請求書テンプレートがありません。",
  },
} as const;

export default function TemplatesClientPage({
  userId,
}: TemplatesClientPageProps) {
  const [activeTab, setActiveTab] = useState<TemplateType>("WORK_REPORT");
  const [templates, setTemplates] = useState<ExcelTemplateWithFields[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [activeTemplate, setActiveTemplate] =
    useState<ExcelTemplateWithFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, success, showError, showSuccess } = useMessageState();
  const { startTransition } = useTransitionContext();

  const refreshTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getExcelTemplatesByUserIdAndTypeAction(
        userId,
        activeTab,
      );
      setTemplates(data);
    } catch (err) {
      console.error(err);
      showError("テンプレートの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [userId, activeTab, showError]);

  // 作業報告書タブの場合、デフォルトテンプレートを先頭に追加
  const displayTemplates = useMemo(() => {
    if (activeTab === "WORK_REPORT") {
      return [SYSTEM_DEFAULT_WORK_REPORT_TEMPLATE, ...templates];
    }
    return templates;
  }, [activeTab, templates]);

  // ユーザーが作成したテンプレート数が上限に達しているかチェック
  const isTemplateLimitReached = templates.length >= MAX_TEMPLATES_PER_TYPE;

  useEffect(() => {
    startTransition(() => {
      refreshTemplates().catch(console.error);
    });
  }, [refreshTemplates, startTransition]);

  const closeDialog = () => {
    setActiveDialog(null);
    setActiveTemplate(null);
  };

  // テンプレート作成
  const onCreateTemplate = async (data: ExcelTemplateFormValues) => {
    if (!data.file) {
      showError("Excelファイルは必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      const fileData = await fileToBase64(data.file);
      await createExcelTemplateAction({
        name: data.name,
        type: activeTab,
        fileData,
        fileName: data.file.name,
        sheetName: data.sheetName,
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
  const onEditTemplate = async (data: ExcelTemplateFormValues) => {
    if (!activeTemplate) return;

    setIsSubmitting(true);
    try {
      const baseUpdateData = {
        name: data.name,
        sheetName: data.sheetName,
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

      await updateExcelTemplateAction(activeTemplate.id, updateData);
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
      await deleteExcelTemplateAction(activeTemplate.id);
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

  const tabConfig = TAB_CONFIG[activeTab];

  const renderTemplateList = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    if (displayTemplates.length > 0) {
      return (
        <div className="space-y-3">
          {displayTemplates.map((template) => {
            const isSystem = isDefaultTemplate(template.id);
            return (
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
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{template.name}</span>
                    {isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        システム
                      </Badge>
                    )}
                  </div>
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
                  {!isSystem && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <tabConfig.icon className="mb-4 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">{tabConfig.emptyMessage}</p>
        <p className="text-sm text-muted-foreground">
          「新規作成」ボタンからテンプレートを追加してください。
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-3 font-semibold">
          <FileSpreadsheet className="text-3xl text-sky-400" />
          <p className="text-2xl">テンプレート一覧</p>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as TemplateType);
          }}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger
                value="WORK_REPORT"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="size-4" />
                作業報告書
              </TabsTrigger>
              <TabsTrigger value="INVOICE" className="flex items-center gap-2">
                <FileText className="size-4" />
                請求書
              </TabsTrigger>
            </TabsList>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={() => {
                        setActiveDialog("create");
                      }}
                      className="flex items-center gap-1"
                      disabled={isTemplateLimitReached}
                    >
                      <Plus className="size-4" />
                      新規作成
                    </Button>
                  </div>
                </TooltipTrigger>
                {isTemplateLimitReached && (
                  <TooltipContent>
                    <p>
                      テンプレートは最大{MAX_TEMPLATES_PER_TYPE}
                      個までしか登録できません
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mt-4">
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

          <TabsContent value="WORK_REPORT">{renderTemplateList()}</TabsContent>
          <TabsContent value="INVOICE">{renderTemplateList()}</TabsContent>
        </Tabs>

        <ExcelTemplateDialog
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
