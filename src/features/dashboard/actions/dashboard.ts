"use server";

import { searchContracts } from "@/features/contract/repositories/contract-repository";
import { createWorkReportAction } from "@/features/work-report/actions/work-report";

export const ensureMonthlyWorkReportsExistForUser = async (
  userId: string,
): Promise<void> => {
  const today = new Date();
  const todayISO = today.toISOString();
  const activeContracts = await searchContracts(
    userId,
    undefined,
    todayISO,
    todayISO,
  );

  for (const contract of activeContracts) {
    try {
      await createWorkReportAction(contract.id, today);
    } catch (error: any) {
      if (!error.message.includes("既に存在します")) {
        console.error(
          `Failed to create work report for contract ${contract.id}:`,
          error,
        );
      }
    }
  }
};
