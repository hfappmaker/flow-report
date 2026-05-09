"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { Spinner } from "@/components/ui/loading/spinner";
import { register } from "@/features/auth/actions/register";
import CardWrapper from "@/features/auth/components/card-wrapper";
import { PasswordInput } from "@/features/auth/components/password-input";
import { RegisterSchema } from "@/features/auth/schemas/register";
import { useTransitionContext } from "@/contexts/transition-context";
import { useIsClient } from "@/hooks/use-is-client";
import { useMessageState } from "@/hooks/use-message-state";

const RegisterForm = () => {
  const isClient = useIsClient();
  const { error, success, showError, showSuccess, clearError, clearSuccess } =
    useMessageState();
  const { isPending, startTransition } = useTransitionContext();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    startTransition(async () => {
      try {
        const data = await register(values);
        if (data.success) showSuccess(data.success);
        if (data.error) showError(data.error);
      } catch (err) {
        console.error(err);
        showError("エラーが発生しました");
      }
    });

    form.reset();
  };

  if (!isClient) return <Spinner />;

  return (
    <CardWrapper
      headerLabel="新規アカウントを作成"
      backButtonLabel="すでにアカウントをお持ちの方はこちら"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名前</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="山田 太郎"
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード（確認）</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                    />
                  </FormControl>
                  <FormMessage />
                  <Button
                    size="sm"
                    variant="link"
                    asChild
                    className="px-0 text-muted-foreground"
                  >
                    <Link href="/auth/reset">パスワードをお忘れですか？</Link>
                  </Button>
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
            type="submit"
            disabled={isPending}
            className="w-full hover:bg-primary/90"
          >
            登録する
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
