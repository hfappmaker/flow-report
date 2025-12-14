"use server";

import { searchContracts } from "@/features/contract/repositories/contract-repository";
import { createWorkReportAction } from "@/features/work-report/actions/work-report";

export const ensureMonthlyWorkReportsExistForUser = async (
  userId: string,
): Promise<void> => {
  const today = new Date();
  const todayISO = today.toISOString();
  const activeContractsResult = await searchContracts(
    userId,
    undefined,
    todayISO,
    todayISO,
  );

  if (!activeContractsResult.success) {
    console.error("Failed to search contracts:", activeContractsResult.error);
    return;
  }

  for (const contract of activeContractsResult.data) {
    const result = await createWorkReportAction(contract.id, today);
    if (!result.success && !result.error.includes("既に存在します")) {
      console.error(
        `Failed to create work report for contract ${contract.id}:`,
        result.error,
      );
    }
  }
};
