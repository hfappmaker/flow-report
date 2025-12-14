import RegisterForm from "@/features/auth/components/register-form";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Register",
};
export default function RegisterPage() {
  return notFound();
  return <RegisterForm />;
}
