"use server";

import { WorkReport as PrismaWorkReport } from "@prisma/client";
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
import { WorkReport } from "@/features/work-report/types/work-report";
import type { WorkReportStatus } from "@/features/work-report/types/work-report";

export const createWorkReportAction = async (
  contractId: string,
  targetDate: Date,
): Promise<WorkReport> => {
  // 契約情報を取得
  const contract = await getContractById(contractId);
  if (!contract) {
    throw new Error('契約が見つかりません');
  }

  // 契約期間のバリデーション
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  const contractStart = new Date(contract.startDate);
  const contractEnd = contract.endDate ? new Date(contract.endDate) : null;

  // 対象年月の最初の日で比較
  const targetFirstDay = new Date(targetYear, targetDate.getMonth(), 1);
  const contractStartFirstDay = new Date(contractStart.getFullYear(), contractStart.getMonth(), 1);

  if (targetFirstDay < contractStartFirstDay) {
    const contractStartYear = contractStart.getFullYear();
    const contractStartMonth = contractStart.getMonth() + 1;
    throw new Error(`契約開始日より前の作業報告書は作成できません。契約開始: ${contractStartYear}年${contractStartMonth}月`);
  }

  if (contractEnd) {
    const contractEndFirstDay = new Date(contractEnd.getFullYear(), contractEnd.getMonth(), 1);
    if (targetFirstDay > contractEndFirstDay) {
      const contractEndYear = contractEnd.getFullYear();
      const contractEndMonth = contractEnd.getMonth() + 1;
      throw new Error(`契約終了日より後の作業報告書は作成できません。契約終了: ${contractEndYear}年${contractEndMonth}月`);
    }
  }

  // サーバーサイドでの重複チェック
  const exists = await checkWorkReportExists(contractId, targetDate);
  if (exists) {
    throw new Error(`${targetYear}年${targetMonth}月の作業報告書は既に存在します`);
  }

  const workReport = await createWorkReport(contractId, targetDate);
  revalidatePath(`/workReport/${contractId}`);
  return convertPrismaWorkReportToWorkReportDto(workReport);
};

export const updateWorkReportAttendancesAction = async (
  contractId: string,
  workReportId: string,
  attendances: AttendanceDto[],
): Promise<WorkReport> => {
  const workReport = await updateWorkReportAttendances(
    workReportId,
    attendances,
  );
  revalidatePath(`/workReport/${contractId}/${workReportId}`);
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
): Promise<WorkReport[]> => {
  try {
    return (
      await getWorkReportsByContractIdAndYearMonthDateRange(
        contractId,
        fromDate,
        toDate,
      )
    ).map(convertPrismaWorkReportToWorkReportDto);
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
