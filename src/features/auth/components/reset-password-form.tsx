"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { MessageDisplay } from "@/components/ui/feedback/message-display";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { reset } from "@/features/auth/actions/reset";
import CardWrapper from "@/features/auth/components/card-wrapper";
import { ResetSchema } from "@/features/auth/schemas/reset";
import { useMessageState } from "@/hooks/use-message-state";

const ResetPasswordForm = () => {
  const { error, success, showError, showSuccess, clearError, clearSuccess } =
    useMessageState();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    startTransition(() => {
      void (async () => {
        try {
          const data = await reset(values);
          if (data.error) showError(data.error);
          if (data.success) showSuccess(data.success);
        } catch (err) {
          console.error(err);
          showError("エラーが発生しました");
        }
      })();
    });
  };

  return (
    <CardWrapper
      headerLabel="パスワードをお忘れですか？"
      backButtonLabel="ログイン画面に戻る"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="your.email@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <MessageDisplay
            error={error}
            success={success}
            onCloseError={clearError}
            onCloseSuccess={clearSuccess}
          />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full hover:bg-primary/90"
          >
            再設定メールを送信
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ResetPasswordForm;
