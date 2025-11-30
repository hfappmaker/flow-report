import { Metadata } from "next";
import { notFound } from "next/navigation";

import TemplatesClientPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";

export const metadata: Metadata = {
  title: "テンプレート一覧",
  description: "テンプレートの管理",
};

export default async function TemplatesPage() {
  const user = await currentUser();
  if (!user?.id) {
    return notFound();
  }

  return <TemplatesClientPage userId={user.id} />;
}
