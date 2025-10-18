import { Suspense } from "react";

import NewPasswordForm from "@/features/auth/components/new-password-form";

export const metadata = {
  title: "New Password",
};

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordForm />
    </Suspense>
  );
}
