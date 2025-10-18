"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Spinner } from "@/components/ui/loading/spinner";
import { newVerification } from "@/features/auth/actions/new-verification";
import CardWrapper from "@/features/auth/components/card-wrapper";

const NewVerificationForm = () => {
  const [error, setError] = useState<{ message: string; date: Date }>({
    message: "",
    date: new Date(),
  });
  const [success, setSuccess] = useState<{ message: string; date: Date }>({
    message: "",
    date: new Date(),
  });

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success.message !== "" || error.message !== "") return;

    if (!token) {
      setError({ message: "Missing token!", date: new Date() });
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess({ message: data.success ?? "", date: new Date() });
        setError({ message: data.error ?? "", date: new Date() });
      })
      .catch(() => {
        setError({ message: "Something went wrong!", date: new Date() });
      });
  }, [token, success.message, error.message]);

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
        {success.message === "" && error.message === "" && <Spinner />}
        <FormError message={error.message} resetSignal={error.date.getTime()} />
        <FormSuccess
          message={success.message}
          resetSignal={success.date.getTime()}
        />
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;
