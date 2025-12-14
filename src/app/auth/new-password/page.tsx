import { Suspense } from "react";
import { notFound } from "next/navigation";

import NewPasswordForm from "@/features/auth/components/new-password-form";

export const metadata = {
  title: "New Password",
};

export default function NewPasswordPage() {
  return notFound();
  return (
    <Suspense>
      <NewPasswordForm />
    </Suspense>
  );
}
