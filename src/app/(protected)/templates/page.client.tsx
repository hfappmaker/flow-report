"use client";

import type { TemplateType } from "@prisma/client";
import {
  FileSpreadsheet,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  getEmailTemplatesByCreateUserIdAction,
  createEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
} from "@/features/email/actions/email-template";
import { EmailTemplateDialog } from "@/features/email/components/email-template-dialog";
import type { EmailTemplateFormValues } from "@/features/email/schemas/email-template-form-schema";
import {
  DEFAULT_EMAIL_TEMPLATE_ID,
  DEFAULT_EMAIL_TEMPLATE_NAME,
  DEFAULT_EMAIL_TEMPLATE_SUBJECT,
  DEFAULT_EMAIL_TEMPLATE_BODY,
  isDefaultEmailTemplate,
} from "@/features/email/constants/default-email-template";
import type { DialogType as EmailDialogType } from "@/features/email/types/dialog";
import type { EmailTemplate } from "@/features/email/types/email-template";
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
  sheetName: DEFAULT_TEMPLATE_SHEET_NAME,
  createUserId: "system",
  fieldMappings: DEFAULT_TEMPLATE_FIELD_MAPPINGS,
};

/**
 * システムデフォルトのメールテンプレート（読み取り専用）
 */
const SYSTEM_DEFAULT_EMAIL_TEMPLATE: EmailTemplate = {
  id: DEFAULT_EMAIL_TEMPLATE_ID,
  name: DEFAULT_EMAIL_TEMPLATE_NAME,
  subject: DEFAULT_EMAIL_TEMPLATE_SUBJECT,
  body: DEFAULT_EMAIL_TEMPLATE_BODY,
  toAddresses: [],
  ccAddresses: [],
  createUserId: "system",
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
  initialWorkReportTemplates: ExcelTemplateWithFields[];
  initialInvoiceTemplates: ExcelTemplateWithFields[];
  initialEmailTemplates: EmailTemplate[];
}

type TabType = TemplateType | "EMAIL";

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
  EMAIL: {
    label: "メール",
    icon: Mail,
    emptyMessage: "メールテンプレートがありません。",
  },
} as const;

export default function TemplatesClientPage({
  userId,
  initialWorkReportTemplates,
  initialInvoiceTemplates,
  initialEmailTemplates,
}: TemplatesClientPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("WORK_REPORT");
  const [workReportTemplates, setWorkReportTemplates] = useState(
    initialWorkReportTemplates,
  );
  const [invoiceTemplates, setInvoiceTemplates] = useState(
    initialInvoiceTemplates,
  );
  const [emailTemplates, setEmailTemplates] = useState(initialEmailTemplates);
  // Excelテンプレート用
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [activeTemplate, setActiveTemplate] =
    useState<ExcelTemplateWithFields | null>(null);
  // メールテンプレート用
  const [activeEmailDialog, setActiveEmailDialog] =
    useState<EmailDialogType>(null);
  const [activeEmailTemplate, setActiveEmailTemplate] =
    useState<EmailTemplate | null>(null);
  const { error, success, showError, showSuccess, clearError, clearSuccess } =
    useMessageState();
  const { isPending, startTransition, setManualPending } =
    useTransitionContext();

  // ユーザーが作成したテンプレートのみをカウント（デフォルトテンプレートは除く）
  const templates = (() => {
    switch (activeTab) {
      case "WORK_REPORT":
        return workReportTemplates;
      case "INVOICE":
        return invoiceTemplates;
      case "EMAIL":
        return emailTemplates;
    }
  })();

  const refreshTemplates = useCallback(
    async (tabToRefresh: TabType) => {
      setManualPending(true);
      try {
        if (tabToRefresh === "EMAIL") {
          const result = await getEmailTemplatesByCreateUserIdAction(userId);
          if (result.success) {
            setEmailTemplates(result.data);
          } else {
            showError(result.error);
          }
        } else {
          const result = await getExcelTemplatesByUserIdAndTypeAction(
            userId,
            tabToRefresh,
          );
          if (result.success) {
            if (tabToRefresh === "WORK_REPORT") {
              setWorkReportTemplates(result.data);
            } else {
              setInvoiceTemplates(result.data);
            }
          } else {
            showError(result.error);
          }
        }
      } finally {
        setManualPending(false);
      }
    },
    [userId, showError, setManualPending],
  );

  // 作業報告書タブの場合、デフォルトテンプレートを先頭に追加
  // 請求書タブの場合、2つのデフォルトテンプレートを先頭に追加
  const displayExcelTemplates = useMemo(() => {
    if (activeTab === "WORK_REPORT") {
      return [SYSTEM_DEFAULT_WORK_REPORT_TEMPLATE, ...workReportTemplates];
    }
    if (activeTab === "INVOICE") {
      return [
        SYSTEM_DEFAULT_INVOICE_TAX_INCLUSIVE_TEMPLATE,
        SYSTEM_DEFAULT_INVOICE_TAX_EXCLUSIVE_TEMPLATE,
        ...invoiceTemplates,
      ];
    }
    return [];
  }, [activeTab, workReportTemplates, invoiceTemplates]);

  // メールタブの場合、デフォルトテンプレートを先頭に追加
  const displayEmailTemplates = useMemo(() => {
    return [SYSTEM_DEFAULT_EMAIL_TEMPLATE, ...emailTemplates];
  }, [emailTemplates]);

  // ユーザーが作成したテンプレート数が上限に達しているかチェック
  const isTemplateLimitReached = templates.length >= MAX_TEMPLATES_PER_TYPE;

  // 初回マウント時に全タブのデータを取得（タブ切り替え時には再取得しない）
  useEffect(() => {
    const loadInitialData = async () => {
      setManualPending(true);
      try {
        const [workReportResult, invoiceResult, emailResult] =
          await Promise.all([
            getExcelTemplatesByUserIdAndTypeAction(userId, "WORK_REPORT"),
            getExcelTemplatesByUserIdAndTypeAction(userId, "INVOICE"),
            getEmailTemplatesByCreateUserIdAction(userId),
          ]);
        if (workReportResult.success) {
          setWorkReportTemplates(workReportResult.data);
        }
        if (invoiceResult.success) {
          setInvoiceTemplates(invoiceResult.data);
        }
        if (emailResult.success) {
          setEmailTemplates(emailResult.data);
        }
      } catch (err) {
        console.error(err);
        showError("テンプレートの取得に失敗しました");
      } finally {
        setManualPending(false);
      }
    };

    startTransition(() => {
      loadInitialData();
    });
    // 初回マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeDialog = () => {
    setActiveDialog(null);
    setActiveTemplate(null);
  };

  const closeEmailDialog = () => {
    setActiveEmailDialog(null);
    setActiveEmailTemplate(null);
  };

  // テンプレート作成
  const onCreateTemplate = async (data: ExcelTemplateFormValues) => {
    if (!data.file) {
      showError("Excelファイルは必須です");
      return;
    }
    if (activeTab === "EMAIL") {
      showError("メールテンプレートはこのフォームでは作成できません");
      return;
    }

    setManualPending(true);
    const fileData = await fileToBase64(data.file);
    const result = await createExcelTemplateAction({
      name: data.name,
      type: activeTab,
      fileData,
      fileName: data.file.name,
      sheetName: data.sheetName,
      createUserId: userId,
      fieldMappings: data.fieldMappings.map((m) => ({
        namedRange: m.namedRange,
        valueTemplate: m.valueTemplate,
      })),
    });
    if (result.success) {
      showSuccess(`テンプレート '${data.name}' を作成しました`);
      closeDialog();
      await refreshTemplates(activeTab);
    } else {
      console.error(result.error);
      showError(result.error);
    }
    setManualPending(false);
  };

  // テンプレート編集
  const onEditTemplate = async (data: ExcelTemplateFormValues) => {
    if (!activeTemplate) return;
    setManualPending(true);
    const baseUpdateData = {
      name: data.name,
      sheetName: data.sheetName,
      fieldMappings: data.fieldMappings.map((m) => ({
        namedRange: m.namedRange,
        valueTemplate: m.valueTemplate,
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

    const result = await updateExcelTemplateAction(
      activeTemplate.id,
      updateData,
    );
    if (result.success) {
      showSuccess(`テンプレート '${data.name}' を更新しました`);
      closeDialog();
      await refreshTemplates(activeTab);
    } else {
      console.error(result.error);
      showError(result.error);
    }
    setManualPending(false);
  };

  // テンプレート削除
  const onDeleteTemplate = async () => {
    if (!activeTemplate) return;
    setManualPending(true);
    const result = await deleteExcelTemplateAction(activeTemplate.id);
    if (result.success) {
      showSuccess(`テンプレート '${activeTemplate.name}' を削除しました`);
      closeDialog();
      await refreshTemplates(activeTab);
    } else {
      console.error(result.error);
      showError(result.error);
    }
    setManualPending(false);
  };

  // メールテンプレート作成
  const onCreateEmailTemplate = async (data: EmailTemplateFormValues) => {
    setManualPending(true);
    const result = await createEmailTemplateAction({
      name: data.name,
      subject: data.subject,
      body: data.body,
      toAddresses: data.toAddresses,
      ccAddresses: data.ccAddresses,
      createUserId: userId,
    });
    if (result.success) {
      showSuccess(`メールテンプレート '${data.name}' を作成しました`);
      closeEmailDialog();
      await refreshTemplates("EMAIL");
      return;
    } else {
      console.error(result.error);
      showError(result.error);
    }
    setManualPending(false);
  };

  // メールテンプレート編集
  const onEditEmailTemplate = async (data: EmailTemplateFormValues) => {
    if (!activeEmailTemplate) return;
    setManualPending(true);
    const result = await updateEmailTemplateAction(activeEmailTemplate.id, {
      name: data.name,
      subject: data.subject,
      body: data.body,
      toAddresses: data.toAddresses,
      ccAddresses: data.ccAddresses,
      createUserId: userId,
    });
    if (result.success) {
      showSuccess(`メールテンプレート '${data.name}' を更新しました`);
      closeEmailDialog();
      await refreshTemplates("EMAIL");
    } else {
      console.error(result.error);
      showError(result.error);
    }
    setManualPending(false);
  };

  // メールテンプレート削除
  const onDeleteEmailTemplate = async () => {
    if (!activeEmailTemplate) return;
    setManualPending(true);
    const result = await deleteEmailTemplateAction(activeEmailTemplate.id);
    if (result.success) {
      showSuccess(
        `メールテンプレート '${activeEmailTemplate.name}' を削除しました`,
      );
      closeEmailDialog();
      await refreshTemplates("EMAIL");
    } else {
      console.error(result.error);
      showError(result.error);
    }
    setManualPending(false);
  };

  const tabConfig = TAB_CONFIG[activeTab];

  const renderExcelTemplateList = () => {
    if (isPending) {
      return null;
    }

    if (displayExcelTemplates.length > 0) {
      return (
        <div className="space-y-3">
          {displayExcelTemplates.map((template) => {
            const isSystem =
              isDefaultTemplate(template.id) ||
              isDefaultInvoiceTemplate(template.id);
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

  const renderEmailTemplateList = () => {
    if (isPending) {
      return null;
    }

    if (displayEmailTemplates.length > 0) {
      return (
        <div className="space-y-3">
          {displayEmailTemplates.map((template) => {
            const isSystem = isDefaultEmailTemplate(template.id);
            return (
              <div
                key={template.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <button
                  type="button"
                  className="flex-1 cursor-pointer text-left"
                  onClick={() => {
                    setActiveEmailTemplate(template);
                    setActiveEmailDialog("details");
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
                    <Mail className="size-4" />
                    <span className="truncate">
                      To:{" "}
                      {template.toAddresses && template.toAddresses.length > 0
                        ? template.toAddresses.join(", ")
                        : "（未設定）"}
                    </span>
                  </div>
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveEmailTemplate(template);
                      setActiveEmailDialog("details");
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
                          setActiveEmailTemplate(template);
                          setActiveEmailDialog("edit");
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveEmailTemplate(template);
                          setActiveEmailDialog("delete");
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
        <Mail className="mb-4 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">{tabConfig.emptyMessage}</p>
        <p className="text-sm text-muted-foreground">
          「新規作成」ボタンからテンプレートを追加してください。
        </p>
      </div>
    );
  };

  const handleNewButtonClick = () => {
    if (activeTab === "EMAIL") {
      setActiveEmailDialog("create");
    } else {
      setActiveDialog("create");
    }
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
            setActiveTab(value as TabType);
          }}
          className="w-full"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <TabsTrigger value="EMAIL" className="flex items-center gap-2">
                <Mail className="size-4" />
                メール
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <Button
                onClick={handleNewButtonClick}
                className="flex items-center gap-1"
                disabled={isTemplateLimitReached}
              >
                <Plus className="size-4" />
                新規作成
              </Button>
              {isTemplateLimitReached && (
                <p className="text-xs text-muted-foreground">
                  最大{MAX_TEMPLATES_PER_TYPE}個まで登録可能です
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <FormError message={error} onClose={clearError} />
          </div>
          <div className="mb-4">
            <FormSuccess message={success} onClose={clearSuccess} />
          </div>

          <TabsContent value="WORK_REPORT">
            {renderExcelTemplateList()}
          </TabsContent>
          <TabsContent value="INVOICE">{renderExcelTemplateList()}</TabsContent>
          <TabsContent value="EMAIL">{renderEmailTemplateList()}</TabsContent>
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
          isSubmitting={isPending}
        />

        <EmailTemplateDialog
          type={activeEmailDialog}
          isOpen={activeEmailDialog !== null}
          onOpenChange={(open) => {
            if (!open) closeEmailDialog();
          }}
          template={activeEmailTemplate}
          onSubmit={
            activeEmailDialog === "create"
              ? onCreateEmailTemplate
              : onEditEmailTemplate
          }
          onDelete={onDeleteEmailTemplate}
          onCancel={closeEmailDialog}
        />
      </CardContent>
    </Card>
  );
}
