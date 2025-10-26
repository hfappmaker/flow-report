import { Metadata } from "next";
import { notFound } from "next/navigation";

import { currentUser } from "@/features/auth/lib/auth";
import { getContractsByUserId } from "@/features/contract/repositories/contract-repository";
import { ensureMonthlyWorkReportsExistForUser } from "@/features/dashboard/actions/dashboard";
import { getSubscriptionInfoByUserId } from "@/features/subscription/repositories/subscription-repository";
import {
  getDraftWorkReports,
  getSubmittedWorkReportsByRecentMonths,
} from "@/features/work-report/repositories/work-report-repository";

import DashboardClientPage from "./page.client";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "ダッシュボード",
};

export default async function DashboardPage() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return notFound();
  }

  await ensureMonthlyWorkReportsExistForUser(userId);

  const [
    draftWorkReports,
    submittedWorkReportsLast3Months,
    subscriptionInfo,
    contracts,
  ] = await Promise.all([
    getDraftWorkReports(userId),
    getSubmittedWorkReportsByRecentMonths(userId),
    getSubscriptionInfoByUserId(userId),
    getContractsByUserId(userId),
  ]);

  const hasContracts = contracts.length > 0;

  return (
    <DashboardClientPage
      draftWorkReports={draftWorkReports}
      submittedWorkReportsLast3Months={submittedWorkReportsLast3Months}
      subscriptionInfo={subscriptionInfo}
      hasContracts={hasContracts}
    />
  );
}
