import { Metadata } from "next";
import { notFound } from "next/navigation";

import WorkReportTemplatesClientPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";

export const metadata: Metadata = {
  title: "作業報告書テンプレート",
  description: "作業報告書テンプレートの管理",
};

export default async function WorkReportTemplatesPage() {
  const user = await currentUser();
  if (!user?.id) {
    return notFound();
  }

  return <WorkReportTemplatesClientPage userId={user.id} />;
}
