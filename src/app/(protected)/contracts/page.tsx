import { redirect } from "next/navigation";

import { currentUser } from "@/features/auth/lib/auth";

import ContractsClientPage from "./page.client";

export default async function ContractsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <ContractsClientPage userId={user.id!} />;
}