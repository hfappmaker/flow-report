"use server";

import {
  WorkReport as PrismaWorkReport,
  Attendance as PrismaAttendance,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getContractById } from "@/features/contract/repositories/contract-repository";
import { ERROR_MESSAGES } from "@/features/work-report/constants/error-messages";
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

export const createWorkReportAction = async (
  contractId: string,
  targetDate: Date,
): Promise<WorkReport> => {
  // 契約情報を取得
  const contract = await getContractById(contractId);
  if (!contract) {
    throw new Error(ERROR_MESSAGES.CONTRACT_NOT_FOUND);
  }

  // 契約期間のバリデーション
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  const contractStart = new Date(contract.startDate);
  const contractEnd = contract.endDate ? new Date(contract.endDate) : null;

  // 対象年月の最初の日で比較
  const targetFirstDay = new Date(targetYear, targetDate.getMonth(), 1);
  const contractStartFirstDay = new Date(
    contractStart.getFullYear(),
    contractStart.getMonth(),
    1,
  );

  if (targetFirstDay < contractStartFirstDay) {
    const contractStartYear = contractStart.getFullYear();
    const contractStartMonth = contractStart.getMonth() + 1;
    throw new Error(
      ERROR_MESSAGES.WORK_REPORT_CREATION_BEFORE_CONTRACT_START(
        contractStartYear,
        contractStartMonth,
      ),
    );
  }

  if (contractEnd) {
    const contractEndFirstDay = new Date(
      contractEnd.getFullYear(),
      contractEnd.getMonth(),
      1,
    );
    if (targetFirstDay > contractEndFirstDay) {
      const contractEndYear = contractEnd.getFullYear();
      const contractEndMonth = contractEnd.getMonth() + 1;
      throw new Error(
        ERROR_MESSAGES.WORK_REPORT_CREATION_AFTER_CONTRACT_END(
          contractEndYear,
          contractEndMonth,
        ),
      );
    }
  }

  // サーバーサイドでの重複チェック
  const exists = await checkWorkReportExists(contractId, targetDate);
  if (exists) {
    throw new Error(
      ERROR_MESSAGES.WORK_REPORT_ALREADY_EXISTS(targetYear, targetMonth),
    );
  }

  const workReport = await createWorkReport(contractId, targetDate);
  revalidatePath(`/workReport/${contractId}`);
  return convertPrismaWorkReportToDto(workReport);
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
  return convertPrismaWorkReportToDto(workReport);
};

export const getWorkReportsByContractIdAction = async (
  contractId: string,
): Promise<WorkReport[]> => {
  try {
    const workReports = await getWorkReportsByContractId(contractId);
    return workReports.map(convertPrismaWorkReportToDto);
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error(ERROR_MESSAGES.FETCH_WORK_REPORTS_FAILED);
  }
};

export const getWorkReportsByContractIdAndYearMonthDateRangeAction = async (
  contractId: string,
  fromDate?: Date,
  toDate?: Date,
): Promise<WorkReportWithAttendances[]> => {
  try {
    const workReports = await getWorkReportsByContractIdAndYearMonthDateRange(
      contractId,
      fromDate,
      toDate,
    );
    return workReports.map(convertPrismaWorkReportToDto) as WorkReportWithAttendances[];
  } catch (error) {
    console.error("Error fetching work reports:", error);
    throw new Error(ERROR_MESSAGES.FETCH_WORK_REPORTS_FAILED);
  }
};

export const updateWorkReportStatusAction = async (
  workReportId: string,
  status: WorkReportStatus,
): Promise<WorkReport> => {
  const updated = await updateWorkReportStatus(workReportId, status);
  revalidatePath(`/workReport/${updated.contractId}/${updated.id}`);
  return convertPrismaWorkReportToDto(updated);
};

export const deleteWorkReportAction = async (
  workReportId: string,
): Promise<WorkReport> => {
  const deleted = await deleteWorkReport(workReportId);
  revalidatePath(`/contract/${deleted.contractId}`);
  return convertPrismaWorkReportToDto(deleted);
};

export const checkWorkReportExistsAction = async (
  contractId: string,
  targetDate: Date,
): Promise<boolean> => {
  return await checkWorkReportExists(contractId, targetDate);
};

// Type guard to check if the work report has attendances
function hasAttendances(
  obj: any,
): obj is PrismaWorkReport & { attendances: PrismaAttendance[] } {
  return "attendances" in obj && Array.isArray(obj.attendances);
}

function convertPrismaWorkReportToDto(
  workReport:
    | PrismaWorkReport
    | (PrismaWorkReport & { attendances: PrismaAttendance[] }),
): WorkReport | WorkReportWithAttendances {
  const dto: WorkReport | WorkReportWithAttendances = {
    ...workReport,
    memo: workReport.memo ?? undefined,
  };

  if (hasAttendances(workReport)) {
    (dto as WorkReportWithAttendances).attendances = workReport.attendances;
  }

  return dto;
}
