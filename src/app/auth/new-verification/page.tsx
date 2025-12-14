import { Suspense } from "react";
import { notFound } from "next/navigation";

import NewVerificationForm from "@/features/auth/components/new-verification-form";

export const metadata = {
  title: "Verification",
};

export default function NewVerificationPage() {
  return notFound();
  return (
    <Suspense>
      <NewVerificationForm />
    </Suspense>
  );
}
