"use server";

import type { WorkReport as PrismaWorkReport } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getContractById } from "@/features/contract/repositories/contract-repository";
import {
  checkWorkReportExists,
  createWorkReport,
  deleteWorkReport,
  getWorkReportsByContractId,
  getWorkReportsByContractIdAndYearMonthDateRange,
  updateWorkReportAttendances,
  updateWorkReportStatus,
} from "@/features/work-report/repositories/work-report-repository";
import { AttendanceDto } from "@/features/work-report/types/attendance";
import {
  WorkReport,
  WorkReportWithAttendances,
} from "@/features/work-report/types/work-report";
import type { WorkReportStatus } from "@/features/work-report/types/work-report";
import { getMonthListBetween } from "@/utils/date-utils";

export const createWorkReportAction = async (
  contractId: string,
  targetDate: Date,
): Promise<WorkReport> => {
  // 契約情報を取得
  const contract = await getContractById(contractId);
  if (!contract) {
    throw new Error("契約が見つかりません");
  }

  // サーバーサイドでの重複チェック
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  const exists = await checkWorkReportExists(contractId, targetDate);
  if (exists) {
    throw new Error(
      `${targetYear}年${targetMonth}月の作業報告書は既に存在します`,
    );
  }

  const workReport = await createWorkReport(contractId, targetDate);
  revalidatePath(`/workReport/${contractId}`);
  return convertPrismaWorkReportToWorkReportDto(workReport);
};

export const createMonthlyWorkReportsAction = async (
  contractId: string,
  startDate: Date,
  endDate: Date,
): Promise<void> => {
  const monthList = getMonthListBetween(startDate, endDate);

  for (const month of monthList) {
    try {
      // 既存のチェックロジックを再利用するため、`createWorkReportAction`を呼び出す
      await createWorkReportAction(contractId, month);
    } catch (error) {
      // エラーが発生しても処理を中断せず、コンソールに出力する
      console.error(
        `作業報告書作成エラー (契約ID: ${contractId}, 対象月: ${month.getFullYear()}/${month.getMonth() + 1}):`,
        error,
      );
    }
  }
};

export const updateWorkReportAttendancesAction = async (
  workReportId: string,
  attendances: AttendanceDto[],
): Promise<WorkReport> => {
  const workReport = await updateWorkReportAttendances(
    workReportId,
    attendances,
  );
  revalidatePath(`/workReport/${workReportId}`);
  return convertPrismaWorkReportToWorkReportDto(workReport);
};

export const getWorkReportsByContractIdAction = async (
  contractId: string,
): Promise<WorkReport[]> => {
  try {
    return (await getWorkReportsByContractId(contractId)).map(
      convertPrismaWorkReportToWorkReportDto,
    );
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
};

export const getWorkReportsByContractIdAndYearMonthDateRangeAction = async (
  contractId: string,
  fromDate?: Date,
  toDate?: Date,
): Promise<WorkReportWithAttendances[]> => {
  try {
    return (
      await getWorkReportsByContractIdAndYearMonthDateRange(
        contractId,
        fromDate,
        toDate,
      )
    ).map(convertPrismaWorkReportWithAttendancesToWorkReportDto);
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error("Failed to fetch work reports");
  }
};

export const updateWorkReportStatusAction = async (
  workReportId: string,
  status: WorkReportStatus,
): Promise<WorkReport> => {
  const updated = await updateWorkReportStatus(workReportId, status);
  revalidatePath(`/workReport/${updated.contractId}/${updated.id}`);
  return convertPrismaWorkReportToWorkReportDto(updated);
};

export const deleteWorkReportAction = async (
  workReportId: string,
): Promise<WorkReport> => {
  const deleted = await deleteWorkReport(workReportId);
  revalidatePath(`/contract/${deleted.contractId}`);
  return convertPrismaWorkReportToWorkReportDto(deleted);
};

export const checkWorkReportExistsAction = async (
  contractId: string,
  targetDate: Date,
): Promise<boolean> => {
  return await checkWorkReportExists(contractId, targetDate);
};

function convertPrismaWorkReportToWorkReportDto(
  workReport: PrismaWorkReport,
): WorkReport {
  return {
    ...workReport,
    memo: workReport.memo ?? undefined,
  };
}

function convertPrismaWorkReportWithAttendancesToWorkReportDto(
  workReport: PrismaWorkReport & { attendances: any[] },
): WorkReportWithAttendances {
  return {
    ...workReport,
    memo: workReport.memo ?? undefined,
    attendances: workReport.attendances,
  };
}
