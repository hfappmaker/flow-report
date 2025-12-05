import { Decimal } from "@prisma/client/runtime/library";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import DashboardClientPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";
import { getContractsByUserId } from "@/features/contract/repositories/contract-repository";
import { ContractDashboard } from "@/features/dashboard/types/dashboard";
import { fetchHolidays } from "@/features/holidays/libs/google-calendar";
import {
  getDraftWorkReportsUpToCurrentMonth,
  getSubmittedWorkReportsByRecentMonths,
} from "@/features/work-report/repositories/work-report-repository";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "ダッシュボード",
};

const convertDecimalToNumber = (value: Decimal | null): number | null =>
  value ? Number(value) : null;

const convertWorkReportsForClient = (
  reports: Awaited<ReturnType<typeof getDraftWorkReportsUpToCurrentMonth>>,
): Record<string, ContractDashboard> => {
  return Object.fromEntries(
    Object.entries(reports).map(([contractId, contract]) => [
      contractId,
      {
        contractName: contract.contractName,
        clientName: contract.clientName,
        closingDay: contract.closingDay,
        unitPrice: convertDecimalToNumber(contract.unitPrice),
        settlementMin: convertDecimalToNumber(contract.settlementMin),
        settlementMax: convertDecimalToNumber(contract.settlementMax),
        rateType: contract.rateType,
        upperRate: convertDecimalToNumber(contract.upperRate),
        lowerRate: convertDecimalToNumber(contract.lowerRate),
        middleRate: convertDecimalToNumber(contract.middleRate),
        hourlyRate: convertDecimalToNumber(contract.hourlyRate),
        taxInclusiveType: contract.taxInclusiveType,
        taxRoundingType: contract.taxRoundingType,
        monthlyWorkMinutes: contract.monthlyWorkMinutes,
        workReports: contract.workReports,
      },
    ]),
  );
};

export default async function DashboardPage() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return notFound();
  }

  const currentYear = new Date().getFullYear();

  const [
    draftWorkReportsRaw,
    submittedWorkReportsRaw,
    contracts,
    holidays,
  ] = await Promise.all([
    getDraftWorkReportsUpToCurrentMonth(userId),
    getSubmittedWorkReportsByRecentMonths(userId),
    getContractsByUserId(userId),
    fetchHolidays(currentYear),
  ]);

  const draftWorkReports = convertWorkReportsForClient(draftWorkReportsRaw);
  const submittedWorkReportsLast3Months = convertWorkReportsForClient(
    submittedWorkReportsRaw,
  );

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
