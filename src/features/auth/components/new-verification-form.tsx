"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Spinner } from "@/components/ui/loading/spinner";
import { newVerification } from "@/features/auth/actions/new-verification";
import CardWrapper from "@/features/auth/components/card-wrapper";

const NewVerificationForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success !== "" || error !== "") return;

    if (!token) {
      setError("トークンが見つかりません");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success ?? "");
        setError(data.error ?? "");
      })
      .catch(() => {
        setError("エラーが発生しました");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  const isTokenExpired = error.includes("有効期限");

  return (
    <CardWrapper
      headerLabel="メールアドレスを確認しています"
      backButtonLabel="ログイン画面に戻る"
      backButtonHref="/auth/login"
    >
      <div className="flex w-full flex-col items-center justify-center gap-y-3">
        {success === "" && error === "" && <Spinner />}
        <FormError message={error} onClose={() => setError("")} />
        <FormSuccess message={success} onClose={() => setSuccess("")} />
        {isTokenExpired && (
          <Button asChild variant="default" className="w-full">
            <Link href="/auth/register">再度ご登録する</Link>
          </Button>
        )}
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;
