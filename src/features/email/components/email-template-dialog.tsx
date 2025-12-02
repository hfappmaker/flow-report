import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailTemplateForm } from "@/features/email/components/email-template-form";
import { type EmailTemplateFormValues } from "@/features/email/schemas/email-template-form-schema";
import { type DialogType } from "@/features/email/types/dialog";
import { EmailTemplate } from "@/features/email/types/email-template";

interface EmailTemplateDialogProps {
  type: DialogType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
  onSubmit: (values: EmailTemplateFormValues) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export const EmailTemplateDialog = ({
  type,
  isOpen,
  onOpenChange,
  template,
  onSubmit,
  onDelete,
  onCancel,
}: EmailTemplateDialogProps) => {
  const getDialogTitle = () => {
    switch (type) {
      case "create":
        return "新規メールテンプレート作成";
      case "edit":
        return "メールテンプレートを編集";
      case "delete":
        return "メールテンプレートの削除確認";
      case "details":
        return "メールテンプレート詳細";
      default:
        return "";
    }
  };

  const renderContent = () => {
    switch (type) {
      case "create":
        return (
          <EmailTemplateForm
            onSubmit={onSubmit}
            submitButtonText="作成"
            onCancel={onCancel}
          />
        );
      case "edit":
        return (
          <EmailTemplateForm
            defaultValues={
              template
                ? {
                    name: template.name,
                    subject: template.subject,
                    body: template.body,
                  }
                : undefined
            }
            onSubmit={onSubmit}
            submitButtonText="更新"
            onCancel={onCancel}
          />
        );
      case "delete":
        return (
          <>
            <div>
              <p>
                本当にメールテンプレート &quot;{template?.name}&quot;
                を削除しますか？
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                この操作は元に戻すことができません。
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                削除
              </Button>
            </div>
          </>
        );
      case "details":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">基本情報</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="font-semibold">Name</div>
                <div>{template?.name}</div>
                <div className="font-semibold">Subject</div>
                <div>{template?.subject}</div>
                <div className="font-semibold">Body</div>
                <div>{template?.body}</div>
              </div>
            </div>
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
      <DialogContent className="max-w-96">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
