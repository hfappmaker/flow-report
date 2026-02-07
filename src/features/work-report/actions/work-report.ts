"use server";

import type {
  Attendance,
  WorkReport as PrismaWorkReport,
} from "@prisma/client";
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
  updateWorkReportRemarks,
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
): Promise<
  { success: true; data: WorkReport } | { success: false; error: string }
> => {
  // 契約情報を取得
  const contractResult = await getContractById(contractId);
  if (!contractResult.success) {
    return { success: false, error: contractResult.error };
  }
  if (!contractResult.data) {
    return { success: false, error: "契約が見つかりません" };
  }

  // サーバーサイドでの重複チェック
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  const existsResult = await checkWorkReportExists(contractId, targetDate);
  if (!existsResult.success) {
    return { success: false, error: existsResult.error };
  }
  if (existsResult.data) {
    return {
      success: false,
      error: `${targetYear}年${targetMonth}月の作業報告書は既に存在します`,
    };
  }

  const result = await createWorkReport(contractId, targetDate);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath(`/work-report/${contractId}`);
  return {
    success: true,
    data: convertPrismaWorkReportToWorkReportDto(result.data),
  };
};

export const createMonthlyWorkReportsAction = async (
  contractId: string,
  startDate: Date,
  endDate: Date,
): Promise<void> => {
  const monthList = getMonthListBetween(startDate, endDate);

  for (const month of monthList) {
    // 既存のチェックロジックを再利用するため、`createWorkReportAction`を呼び出す
    const result = await createWorkReportAction(contractId, month);
    if (!result.success) {
      // エラーが発生しても処理を中断せず、コンソールに出力する
      console.error(
        `作業報告書作成エラー (契約ID: ${contractId}, 対象月: ${month.getFullYear()}/${month.getMonth() + 1}):`,
        result.error,
      );
    }
  }
};

export const updateWorkReportAttendancesAction = async (
  workReportId: string,
  attendances: AttendanceDto[],
): Promise<
  { success: true; data: WorkReport } | { success: false; error: string }
> => {
  const result = await updateWorkReportAttendances(workReportId, attendances);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath(`/work-report/${workReportId}`);
  return {
    success: true,
    data: convertPrismaWorkReportToWorkReportDto(result.data),
  };
};

export const getWorkReportsByContractIdAction = async (
  contractId: string,
): Promise<
  { success: true; data: WorkReport[] } | { success: false; error: string }
> => {
  const result = await getWorkReportsByContractId(contractId);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return {
    success: true,
    data: result.data.map(convertPrismaWorkReportToWorkReportDto),
  };
};

export const getWorkReportsByContractIdAndYearMonthDateRangeAction = async (
  contractId: string,
  fromDate?: Date,
  toDate?: Date,
): Promise<
  | { success: true; data: WorkReportWithAttendances[] }
  | { success: false; error: string }
> => {
  const result = await getWorkReportsByContractIdAndYearMonthDateRange(
    contractId,
    fromDate,
    toDate,
  );
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return {
    success: true,
    data: result.data.map(
      convertPrismaWorkReportWithAttendancesToWorkReportDto,
    ),
  };
};

export const updateWorkReportStatusAction = async (
  workReportId: string,
  status: WorkReportStatus,
): Promise<
  { success: true; data: WorkReport } | { success: false; error: string }
> => {
  const result = await updateWorkReportStatus(workReportId, status);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath(`/workReport/${result.data.contractId}/${result.data.id}`);
  return {
    success: true,
    data: convertPrismaWorkReportToWorkReportDto(result.data),
  };
};

export const updateWorkReportRemarksAction = async (
  workReportId: string,
  remarks: string | null,
): Promise<
  { success: true; data: WorkReport } | { success: false; error: string }
> => {
  const result = await updateWorkReportRemarks(workReportId, remarks);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath(`/work-report/${result.data.contractId}/${result.data.id}`);
  return {
    success: true,
    data: convertPrismaWorkReportToWorkReportDto(result.data),
  };
};

export const deleteWorkReportAction = async (
  workReportId: string,
): Promise<
  { success: true; data: WorkReport } | { success: false; error: string }
> => {
  const result = await deleteWorkReport(workReportId);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath(`/contract/${result.data.contractId}`);
  return {
    success: true,
    data: convertPrismaWorkReportToWorkReportDto(result.data),
  };
};

export const checkWorkReportExistsAction = async (
  contractId: string,
  targetDate: Date,
): Promise<
  { success: true; data: boolean } | { success: false; error: string }
> => {
  const result = await checkWorkReportExists(contractId, targetDate);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};

function convertPrismaWorkReportToWorkReportDto(
  workReport: PrismaWorkReport,
): WorkReport {
  return {
    ...workReport,
  };
}

function convertPrismaWorkReportWithAttendancesToWorkReportDto(
  workReport: PrismaWorkReport & { attendances: Attendance[] },
): WorkReportWithAttendances {
  return {
    ...workReport,
    attendances: workReport.attendances,
  };
}
