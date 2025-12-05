"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success ?? "");
        setError(data.error ?? "");
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex w-full items-center justify-center">
        {success === "" && error === "" && <Spinner />}
        <FormError message={error} onClose={() => setError("")} />
        <FormSuccess message={success} onClose={() => setSuccess("")} />
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;
