"use client";

import { Mail, Send } from "lucide-react";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_EMAIL_TEMPLATE_ID,
  DEFAULT_EMAIL_TEMPLATE_NAME,
  DEFAULT_EMAIL_TEMPLATE_SUBJECT,
  DEFAULT_EMAIL_TEMPLATE_BODY,
  isDefaultEmailTemplate,
} from "@/features/email/constants/default-email-template";
import type { EmailTemplate } from "@/features/email/types/email-template";
import {
  DAILY_ATTENDANCE_PLACEHOLDER_KEYS,
  replacePlaceholders,
} from "@/features/work-report/utils/placeholder-utils";

interface SystemEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  toAddresses: string[];
  ccAddresses: string[];
  createUserId: string;
}

interface EmailTemplateSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailTemplates: EmailTemplate[];
  placeholderValues: Record<string, string | number>;
  onSend: (
    subject: string,
    body: string,
    toAddresses: string[],
    ccAddresses: string[],
  ) => void;
}

export function EmailTemplateSelectDialog({
  open,
  onOpenChange,
  emailTemplates,
  placeholderValues,
  onSend,
}: EmailTemplateSelectDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    DEFAULT_EMAIL_TEMPLATE_ID,
  );

  // システムデフォルトテンプレートを含める
  const systemDefaultTemplate: SystemEmailTemplate = {
    id: DEFAULT_EMAIL_TEMPLATE_ID,
    name: DEFAULT_EMAIL_TEMPLATE_NAME,
    subject: DEFAULT_EMAIL_TEMPLATE_SUBJECT,
    body: DEFAULT_EMAIL_TEMPLATE_BODY,
    toAddresses: [],
    ccAddresses: [],
    createUserId: "system",
  };

  const allTemplates = useMemo(
    () => [systemDefaultTemplate, ...emailTemplates],
    [emailTemplates],
  );

  const selectedTemplate = allTemplates.find(
    (t) => t.id === selectedTemplateId,
  );

  // プレビュー用にプレースホルダーを置換（日次勤怠カテゴリは除外）
  const previewSubject = selectedTemplate
    ? replacePlaceholders(
        selectedTemplate.subject,
        placeholderValues,
        DAILY_ATTENDANCE_PLACEHOLDER_KEYS,
      )
    : "";
  const previewBody = selectedTemplate
    ? replacePlaceholders(
        selectedTemplate.body,
        placeholderValues,
        DAILY_ATTENDANCE_PLACEHOLDER_KEYS,
      )
    : "";

  const handleSend = () => {
    if (selectedTemplate) {
      onSend(
        previewSubject,
        previewBody,
        selectedTemplate.toAddresses ?? [],
        selectedTemplate.ccAddresses ?? [],
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            メールテンプレート選択
          </DialogTitle>
          <DialogDescription>
            使用するメールテンプレートを選択してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emailTemplate">テンプレート</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger id="emailTemplate">
                <SelectValue placeholder="テンプレートを選択" />
              </SelectTrigger>
              <SelectContent>
                {allTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4" />
                      <span>{template.name}</span>
                      {isDefaultEmailTemplate(template.id) && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          システム
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              {(selectedTemplate.toAddresses?.length ?? 0) > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    宛先（To）
                  </Label>
                  <p className="mt-1 text-sm">
                    {selectedTemplate.toAddresses?.join(", ")}
                  </p>
                </div>
              )}
              {(selectedTemplate.ccAddresses?.length ?? 0) > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">CC</Label>
                  <p className="mt-1 text-sm">
                    {selectedTemplate.ccAddresses?.join(", ")}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">
                  件名プレビュー
                </Label>
                <p className="mt-1 font-medium">{previewSubject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  本文プレビュー
                </Label>
                <pre className="mt-1 whitespace-pre-wrap text-sm">
                  {previewBody}
                </pre>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            ※
            作業報告書、請求書は自動で添付されません。「エクスポート」でダウンロードしたファイルを手動で添付してください。
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            キャンセル
          </Button>
          <Button onClick={handleSend} disabled={!selectedTemplate}>
            <Send className="mr-2 size-4" />
            メール送信
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
