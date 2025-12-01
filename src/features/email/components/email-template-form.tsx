import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import {
  emailTemplateFormSchema,
  type EmailTemplateFormValues,
} from "@/features/email/schemas/email-template-form-schema";
import { PlaceholderHelp } from "@/features/work-report/components/placeholder-help";

interface EmailTemplateFormProps {
  defaultValues?: EmailTemplateFormValues;
  onSubmit: (values: EmailTemplateFormValues) => void;
  submitButtonText: string;
  onCancel: () => void;
}

export const EmailTemplateForm = ({
  defaultValues,
  onSubmit,
  submitButtonText,
  onCancel,
}: EmailTemplateFormProps) => {
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const activeFieldRef = useRef<"subject" | "body">("body");

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      subject: "",
      body: "",
    },
  });

  const handleInsertPlaceholder = (placeholder: string) => {
    const fieldName = activeFieldRef.current;
    const currentValue = form.getValues(fieldName);
    const inputElement =
      fieldName === "subject"
        ? subjectInputRef.current
        : bodyTextAreaRef.current;

    if (inputElement) {
      const start = inputElement.selectionStart ?? currentValue.length;
      const end = inputElement.selectionEnd ?? currentValue.length;
      const newValue =
        currentValue.slice(0, start) + placeholder + currentValue.slice(end);
      form.setValue(fieldName, newValue, { shouldDirty: true });

      // カーソル位置を更新
      setTimeout(() => {
        inputElement.focus();
        const newPosition = start + placeholder.length;
        inputElement.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      form.setValue(fieldName, currentValue + placeholder, {
        shouldDirty: true,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>テンプレート名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="テンプレート名を入力" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>件名</FormLabel>
                <PlaceholderHelp onInsert={handleInsertPlaceholder} />
              </div>
              <FormControl>
                <Input
                  {...field}
                  ref={subjectInputRef}
                  placeholder="メールの件名を入力"
                  onFocus={() => {
                    activeFieldRef.current = "subject";
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>本文</FormLabel>
                <PlaceholderHelp onInsert={handleInsertPlaceholder} />
              </div>
              <FormControl>
                <TextArea
                  {...field}
                  ref={bodyTextAreaRef}
                  placeholder="メール本文を入力"
                  rows={8}
                  onFocus={() => {
                    activeFieldRef.current = "body";
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
};
