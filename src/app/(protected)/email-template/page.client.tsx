"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  createEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
  getEmailTemplatesByCreateUserIdAction,
} from "@/features/email/actions/email-template";
import { EmailTemplateDialog } from "@/features/email/components/email-template-dialog";
import { type EmailTemplateFormValues } from "@/features/email/schemas/email-template-form-schema";
import { DialogType } from "@/features/email/types/dialog";
import { EmailTemplate } from "@/features/email/types/email-template";
import { useMessageState } from "@/hooks/use-message-state";

export default function EmailTemplateClientPage({
  userId,
}: {
  userId: string;
}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [activeEmailTemplate, setActiveEmailTemplate] =
    useState<EmailTemplate | null>(null);
  const { error, success, showError, showSuccess } = useMessageState();
  const { startTransition } = useTransitionContext();

  const refreshTemplates = useCallback(async () => {
    try {
      const data = await getEmailTemplatesByCreateUserIdAction(userId);
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    startTransition(async () => {
      await refreshTemplates();
    });
  }, [refreshTemplates, startTransition]);

  const closeDialog = () => {
    setActiveDialog(null);
    setActiveEmailTemplate(null);
  };

  // メールテンプレートデータを変換する関数
  const convertEmailTemplateData = (
    data: EmailTemplateFormValues,
    userId: string,
  ) => {
    return {
      name: data.name,
      subject: data.subject,
      body: data.body,
      createUserId: userId,
    };
  };

  // メールテンプレート作成
  const onCreateEmailTemplate = (data: EmailTemplateFormValues) => {
    startTransition(async () => {
      try {
        const templateData = convertEmailTemplateData(data, userId);
        await createEmailTemplateAction(templateData);
        showSuccess(`メールテンプレート '${data.name}' を作成しました`);
        closeDialog();
        await refreshTemplates();
      } catch (err) {
        console.error(err);
        showError("メールテンプレートの作成に失敗しました");
      }
    });
  };

  // メールテンプレート編集
  const onEditEmailTemplate = (data: EmailTemplateFormValues) => {
    if (!activeEmailTemplate) return;
    startTransition(async () => {
      try {
        const templateData = convertEmailTemplateData(data, userId);
        await updateEmailTemplateAction(activeEmailTemplate.id, templateData);
        showSuccess(`メールテンプレート '${data.name}' を編集しました`);
        closeDialog();
        await refreshTemplates();
      } catch (err) {
        console.error(err);
        showError("メールテンプレートの更新に失敗しました");
      }
    });
  };

  // メールテンプレート削除
  const onDeleteEmailTemplate = () => {
    if (!activeEmailTemplate) return;
    startTransition(async () => {
      try {
        await deleteEmailTemplateAction(activeEmailTemplate.id);
        showSuccess(
          `メールテンプレート '${activeEmailTemplate.name}' を削除しました`,
        );
        closeDialog();
        await refreshTemplates();
      } catch (err) {
        console.error(err);
        showError("メールテンプレートの削除に失敗しました");
      }
    });
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">メールテンプレート一覧</h1>
      <div className="mb-4">
        <FormError message={error.message} resetSignal={error.date.getTime()} />
      </div>
      <div className="mb-4">
        <FormSuccess
          message={success.message}
          resetSignal={success.date.getTime()}
        />
      </div>
      <div className="mb-4">
        <Button
          onClick={() => {
            setActiveDialog("create");
          }}
        >
          新規作成
        </Button>
      </div>
      {templates.length > 0 ? (
        <ul>
          {templates.map((template) => (
            <li
              key={template.id}
              className="mb-2 flex items-center justify-between border p-3"
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  setActiveEmailTemplate(template);
                  setActiveDialog("details");
                }}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground">
                  Subject: {template.subject}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveEmailTemplate(template);
                    setActiveDialog("details");
                  }}
                >
                  詳細
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>メールテンプレートがありません。</p>
      )}

      <EmailTemplateDialog
        type={activeDialog}
        isOpen={activeDialog !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        template={activeEmailTemplate}
        onSubmit={
          activeDialog === "create"
            ? onCreateEmailTemplate
            : onEditEmailTemplate
        }
        onDelete={onDeleteEmailTemplate}
        onCancel={closeDialog}
      />
    </div>
  );
}
