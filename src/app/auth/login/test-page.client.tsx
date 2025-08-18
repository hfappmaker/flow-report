"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { BsCalendarCheck } from "react-icons/bs";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import ErrorAlert from "@/components/ui/feedback/error-alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/features/auth/actions/login";
import { LoginSchema } from "@/features/auth/schemas/login";

export default function TestLoginPage() {
  const [error, setError] = useState<{ message: string; date: Date }>({
    message: "",
    date: new Date(),
  });
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      await login(values).then((data) => {
        if (data?.error) {
          form.reset();
          setError({ message: data.error, date: new Date() });
        }
      });
    });
  };

  const handleQuickLogin = (
    testUserEmail: string,
    testUserPassword: string,
  ) => {
    form.setValue("email", testUserEmail);
    form.setValue("password", testUserPassword);
  };

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-y-4 rounded-md border-2 p-6 w-full max-w-md">
        <div className="flex items-center justify-center gap-x-2">
          <BsCalendarCheck className="text-3xl text-sky-400" />
          <h1 className="text-3xl font-semibold text-primary drop-shadow-md">
            勤怠管理システム
          </h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 w-full">
          <p className="text-sm text-yellow-800 text-center">
            テスト環境 - 開発用ログイン
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="test@example.com"
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
                    <Input
                      {...field}
                      type="password"
                      placeholder="パスワード"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ErrorAlert
              message={error.message}
              resetSignal={error.date.getTime()}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "ログイン中..." : "テストログイン"}
            </Button>
          </form>
        </Form>

        <div className="w-full space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            クイックログイン
          </p>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleQuickLogin("loadtest1@example.com", "LoadTest123!");
              }}
            >
              テストユーザー1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleQuickLogin("loadtest2@example.com", "LoadTest123!");
              }}
            >
              テストユーザー2
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleQuickLogin("loadtest3@example.com", "LoadTest123!");
              }}
            >
              テストユーザー3
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
