import { Metadata } from "next";
import { notFound } from "next/navigation";

import TemplatesClientPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";
import { EmailTemplateRepository } from "@/features/email/repositories/email-template-repository";
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

  const excelRepository = new ExcelTemplateRepository();
  const emailRepository = new EmailTemplateRepository();
  const [
    workReportTemplatesResult,
    invoiceTemplatesResult,
    emailTemplatesResult,
  ] = await Promise.all([
    excelRepository.getByCreateUserIdAndType(user.id, "WORK_REPORT"),
    excelRepository.getByCreateUserIdAndType(user.id, "INVOICE"),
    emailRepository.getByCreateUserId(user.id),
  ]);

  const workReportTemplates = workReportTemplatesResult.success
    ? workReportTemplatesResult.data
    : [];
  const invoiceTemplates = invoiceTemplatesResult.success
    ? invoiceTemplatesResult.data
    : [];
  const emailTemplates = emailTemplatesResult.success
    ? emailTemplatesResult.data
    : [];

  return (
    <TemplatesClientPage
      userId={user.id}
      initialWorkReportTemplates={workReportTemplates}
      initialInvoiceTemplates={invoiceTemplates}
      initialEmailTemplates={emailTemplates}
    />
  );
}
