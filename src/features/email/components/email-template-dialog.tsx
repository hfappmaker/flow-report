import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailTemplateForm } from "@/features/email/components/email-template-form";
import { type EmailTemplateFormValues } from "@/features/email/schemas/email-template-form-schema";
import { type DialogType } from "@/features/email/types/dialog";
import { EmailTemplate } from "@/features/email/types/email-template";

const highlightPlaceholders = (text: string): React.ReactNode => {
  const parts = text.split(/(\$\{[^}]+\})/g);
  return parts.map((part, index) =>
    part.startsWith("${") ? (
      <span key={index} className="text-blue-600 dark:text-blue-400">
        {part}
      </span>
    ) : (
      part
    ),
  );
};

interface EmailTemplateDialogProps {
  type: DialogType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
  onSubmit: (values: EmailTemplateFormValues) => void;
  onDelete?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  onRequestDelete?: () => void;
  isSystem?: boolean;
}

export const EmailTemplateDialog = ({
  type,
  isOpen,
  onOpenChange,
  template,
  onSubmit,
  onDelete,
  onCancel,
  onEdit,
  onRequestDelete,
  isSystem = false,
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
                    toAddresses: template.toAddresses ?? [],
                    ccAddresses: template.ccAddresses ?? [],
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
              <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <div className="font-semibold">テンプレート名</div>
                <div>{template?.name}</div>
                <div className="font-semibold">宛先（To）</div>
                <div>
                  {template?.toAddresses && template.toAddresses.length > 0
                    ? template.toAddresses.join(", ")
                    : "（未設定）"}
                </div>
                <div className="font-semibold">CC</div>
                <div>
                  {template?.ccAddresses && template.ccAddresses.length > 0
                    ? template.ccAddresses.join(", ")
                    : "（未設定）"}
                </div>
                <div className="font-semibold">件名</div>
                <div>
                  {template?.subject && highlightPlaceholders(template.subject)}
                </div>
                <div className="font-semibold">本文</div>
                <div className="whitespace-pre-wrap">
                  {template?.body && highlightPlaceholders(template.body)}
                </div>
              </div>
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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        {type === "details" && (
          <DialogFooter sticky className="p-6">
            {!isSystem && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                編集
              </Button>
            )}
            {!isSystem && onRequestDelete && (
              <Button variant="destructive" onClick={onRequestDelete}>
                削除
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              閉じる
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
