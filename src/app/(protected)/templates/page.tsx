import { Metadata } from "next";
import { notFound } from "next/navigation";

import TemplatesClientPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";
import { ExcelTemplateRepository } from "@/features/work-report/repositories/work-report-template-repository";

export const metadata: Metadata = {
  title: "テンプレート一覧",
  description: "テンプレートの管理",
};

export default async function TemplatesPage() {
  const user = await currentUser();
  if (!user?.id) {
    return notFound();
  }

  const repository = new ExcelTemplateRepository();
  const [workReportTemplates, invoiceTemplates] = await Promise.all([
    repository.getByCreateUserIdAndType(user.id, "WORK_REPORT"),
    repository.getByCreateUserIdAndType(user.id, "INVOICE"),
  ]);

  return (
    <TemplatesClientPage
      userId={user.id}
      initialWorkReportTemplates={workReportTemplates}
      initialInvoiceTemplates={invoiceTemplates}
    />
  );
}
