import ResetPasswordForm from "@/features/auth/components/reset-password-form";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return notFound();
  return <ResetPasswordForm />;
}
