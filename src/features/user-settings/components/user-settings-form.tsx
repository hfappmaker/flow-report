"use client";

import { useState, useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ErrorAlert from "@/components/ui/feedback/error-alert";
import SuccessAlert from "@/components/ui/feedback/success-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/loading/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUserSettings,
  updateUserSettings,
} from "@/features/user-settings/actions/update-user-settings";
import { BANK_ACCOUNT_TYPES } from "@/features/user-settings/schemas/user-settings-form-schema";

export function UserSettingsForm() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // フォームの状態
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [bankAccountType, setBankAccountType] = useState<string>("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getUserSettings();
      if (settings) {
        setPostalCode(settings.postalCode);
        setAddress(settings.address);
        setBankName(settings.bankName);
        setBankBranchName(settings.bankBranchName);
        setBankAccountType(settings.bankAccountType ?? "");
        setBankAccountNumber(settings.bankAccountNumber);
        setBankAccountHolder(settings.bankAccountHolder);
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await updateUserSettings({
        postalCode: postalCode || undefined,
        address: address || undefined,
        bankName: bankName || undefined,
        bankBranchName: bankBranchName || undefined,
        bankAccountType:
          bankAccountType === "普通" || bankAccountType === "当座"
            ? bankAccountType
            : undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        bankAccountHolder: bankAccountHolder || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(result.success);
      }
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Card className="w-auto shadow-sm">
      <CardHeader className="font-semibold">
        <p className="text-lg">ユーザー情報</p>
        <p className="text-sm font-normal text-muted-foreground">
          住所や銀行口座情報を設定すると、請求書テンプレートのプレースホルダーとして使用できます
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 住所セクション */}
          <div className="space-y-4">
            <h3 className="font-medium">住所情報</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">郵便番号</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="例: 123-4567"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例: 東京都渋谷区..."
                />
              </div>
            </div>
          </div>

          {/* 銀行口座セクション */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">銀行口座情報</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">銀行名</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="例: ○○銀行"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBranchName">支店名</Label>
                <Input
                  id="bankBranchName"
                  value={bankBranchName}
                  onChange={(e) => setBankBranchName(e.target.value)}
                  placeholder="例: ○○支店"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountType">口座種別</Label>
                <Select
                  value={bankAccountType}
                  onValueChange={setBankAccountType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">口座番号</Label>
                <Input
                  id="bankAccountNumber"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="例: 1234567"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bankAccountHolder">口座名義</Label>
                <Input
                  id="bankAccountHolder"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="例: ヤマダ タロウ"
                />
              </div>
            </div>
          </div>

          <ErrorAlert message={error} />
          <SuccessAlert message={success} />

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
