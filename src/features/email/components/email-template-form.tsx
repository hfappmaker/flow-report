import { zodResolver } from "@hookform/resolvers/zod";
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
  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      subject: "",
      body: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-end">
          <PlaceholderHelp side="left" />
        </div>
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
              <FormLabel>件名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="メールの件名を入力" />
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
              <FormLabel>本文</FormLabel>
              <FormControl>
                <TextArea {...field} placeholder="メール本文を入力" rows={8} />
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
