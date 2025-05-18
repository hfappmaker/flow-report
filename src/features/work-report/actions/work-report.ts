"use server";

import { WorkReport as PrismaWorkReport } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  createWorkReport,
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

function convertPrismaWorkReportToWorkReportDto(
  workReport: PrismaWorkReport,
): WorkReport {
  return {
    ...workReport,
    memo: workReport.memo ?? undefined,
  };
}
