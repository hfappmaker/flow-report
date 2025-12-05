import { Metadata } from "next";
import { notFound } from "next/navigation";

import DashboardClientPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";
import { getContractsByUserId } from "@/features/contract/repositories/contract-repository";
import { fetchHolidays } from "@/features/holidays/libs/google-calendar";
import {
  getDraftWorkReportsUpToCurrentMonth,
  getSubmittedWorkReportsByRecentMonths,
} from "@/features/work-report/repositories/work-report-repository";

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

  const currentYear = new Date().getFullYear();

  const [
    draftWorkReports,
    submittedWorkReportsLast3Months,
    contracts,
    holidays,
  ] = await Promise.all([
    getDraftWorkReportsUpToCurrentMonth(userId),
    getSubmittedWorkReportsByRecentMonths(userId),
    getContractsByUserId(userId),
    fetchHolidays(currentYear),
  ]);

  const hasContracts = contracts.length > 0;

  return (
    <DashboardClientPage
      draftWorkReports={draftWorkReports}
      submittedWorkReportsLast3Months={submittedWorkReportsLast3Months}
      hasContracts={hasContracts}
      holidays={holidays}
    />
  );
}
