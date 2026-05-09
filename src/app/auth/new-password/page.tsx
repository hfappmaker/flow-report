import { Suspense } from "react";

import NewPasswordForm from "@/features/auth/components/new-password-form";

export const metadata = {
  title: "新しいパスワードの設定",
};

export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordForm />
    </Suspense>
  );
}
