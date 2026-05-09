"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserCog } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ErrorAlert from "@/components/ui/feedback/error-alert";
import SuccessAlert from "@/components/ui/feedback/success-alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboBoxField } from "@/components/ui/combobox";
import { useTransitionContext } from "@/contexts/transition-context";
import { updateUserInfo } from "@/features/user-info/actions/update-user-info";
import { DeleteAccountSection } from "@/features/user-info/components/delete-account-section";
import {
  BANK_ACCOUNT_TYPES,
  userInfoFormSchema,
  UserInfoFormValues,
} from "@/features/user-info/schemas/user-info-form-schema";

type UserInfo = {
  name: string;
  email: string;
  invoiceRegistrationNumber: string;
  postalCode: string;
  address: string;
  bankName: string;
  bankBranchName: string;
  bankAccountType: "普通" | "当座" | null;
  bankAccountNumber: string;
  bankAccountHolder: string;
};

type UserInfoFormProps = {
  initialInfo: UserInfo | null;
};

export function UserInfoForm({ initialInfo }: UserInfoFormProps) {
  const { isPending, startTransition } = useTransitionContext();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoFormSchema),
    mode: "onBlur",
    defaultValues: {
      name: initialInfo?.name ?? "",
      invoiceRegistrationNumber: initialInfo?.invoiceRegistrationNumber ?? "",
      postalCode: initialInfo?.postalCode ?? "",
      address: initialInfo?.address ?? "",
      bankName: initialInfo?.bankName ?? "",
      bankBranchName: initialInfo?.bankBranchName ?? "",
      bankAccountType: initialInfo?.bankAccountType ?? null,
      bankAccountNumber: initialInfo?.bankAccountNumber ?? "",
      bankAccountHolder: initialInfo?.bankAccountHolder ?? "",
    },
  });

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const values = form.getValues();
    const result = userInfoFormSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof UserInfoFormValues;
        form.setError(path, { message: issue.message });
      });
      return;
    }

    startTransition(async () => {
      const apiResult = await updateUserInfo({
        name: result.data.name || undefined,
        invoiceRegistrationNumber:
          result.data.invoiceRegistrationNumber || undefined,
        postalCode: result.data.postalCode || undefined,
        address: result.data.address || undefined,
        bankName: result.data.bankName || undefined,
        bankBranchName: result.data.bankBranchName || undefined,
        bankAccountType: result.data.bankAccountType ?? null,
        bankAccountNumber: result.data.bankAccountNumber || undefined,
        bankAccountHolder: result.data.bankAccountHolder || undefined,
      });

      if (apiResult.error) {
        setError(apiResult.error);
      } else if (apiResult.success) {
        setSuccess(apiResult.success);
        // 保存成功後、現在の値を新しいdefaultValuesとして設定
        form.reset(form.getValues());
        setIsEditing(false);
      }
    });
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="font-semibold">
        <div className="flex items-center gap-x-3">
          <UserCog className="text-3xl text-primary" />
          <h1 className="text-2xl">ユーザー情報</h1>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <ErrorAlert message={error} onClose={() => setError("")} />
            <SuccessAlert message={success} onClose={() => setSuccess("")} />

            {/* 基本情報セクション */}
            <div className="space-y-4">
              <h3 className="font-medium">基本情報</h3>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名前</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: 山田 太郎"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("name") || "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label>メールアドレス</Label>
                  <p className="py-2 text-sm">
                    {initialInfo?.email || "未設定"}
                  </p>
                </div>
              </div>
            </div>

            {/* 事業者情報セクション */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">事業者情報</h3>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="invoiceRegistrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>適格請求書発行事業者登録番号</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: T1234567890123"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("invoiceRegistrationNumber") ||
                            "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 住所セクション */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">住所情報</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>郵便番号</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: 123-4567"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("postalCode") || "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>住所</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: 東京都渋谷区〇〇1-2-3"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("address") || "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 銀行口座セクション */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">銀行口座情報</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>銀行名</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: 〇〇銀行"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("bankName") ?? "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankBranchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>支店名</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: 〇〇支店"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("bankBranchName") || "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                {isEditing ? (
                  <ComboBoxField
                    control={form.control}
                    name="bankAccountType"
                    label="口座種別"
                    options={BANK_ACCOUNT_TYPES.map((type) => ({
                      value: type,
                      label: type,
                    }))}
                    placeholder="選択してください"
                    variant="native"
                  />
                ) : (
                  <FormItem>
                    <FormLabel>口座種別</FormLabel>
                    <p className="py-2 text-sm">
                      {form.getValues("bankAccountType") || "未設定"}
                    </p>
                  </FormItem>
                )}
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>口座番号</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: 1234567"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("bankAccountNumber") || "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankAccountHolder"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>口座名義</FormLabel>
                      {isEditing ? (
                        <>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="例: ヤマダ タロウ"
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      ) : (
                        <p className="py-2 text-sm">
                          {form.getValues("bankAccountHolder") || "未設定"}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "保存中..." : "保存"}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  編集
                </Button>
              )}
            </div>
          </form>
        </Form>
        <div className="mt-8">
          <DeleteAccountSection />
        </div>
      </CardContent>
    </Card>
  );
}
