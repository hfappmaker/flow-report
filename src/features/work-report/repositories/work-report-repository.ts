import { WorkReportStatus } from "@prisma/client";

import { AttendanceDto } from "@/features/work-report/types/attendance";
import { db } from "@/repositories/db";

export async function getWorkReportById(workReportId: string) {
  const workReport = await db.workReport.findUnique({
    where: {
      id: workReportId,
    },
  });

  return workReport;
}

export async function getWorkReportWithContractById(workReportId: string) {
  const workReport = await db.workReport.findUnique({
    where: {
      id: workReportId,
    },
    include: {
      contract: true,
    },
  });

  return workReport;
}

export async function createWorkReport(contractId: string, targetDate: Date) {
  const workReport = await db.workReport.create({
    data: {
      contractId: contractId,
      targetDate: targetDate,
    },
  });

  return workReport;
}

export async function updateWorkReportAttendances(
  workReportId: string,
  attendances: AttendanceDto[],
) {
  const attendanceUpserts = attendances.map(
    ({ date, startTime, endTime, breakDuration, memo }) => {
      return {
        where: { date_workReportId: { date, workReportId } },
        update: {
          startTime: startTime ?? null,
          endTime: endTime ?? null,
          breakDuration: breakDuration ?? null,
          memo: memo ?? null,
        },
        create: {
          date,
          startTime: startTime ?? null,
          endTime: endTime ?? null,
          breakDuration: breakDuration ?? null,
          memo: memo ?? null,
        },
      };
    },
  );

  const workReport = await db.workReport.update({
    where: { id: workReportId },
    data: {
      attendances: {
        upsert: attendanceUpserts,
      },
    },
  });

  return workReport;
}

export async function getWorkReportsByContractId(contractId: string) {
  const workReports = await db.workReport.findMany({
    where: { contractId },
  });
  return workReports;
}

export async function getWorkReportsByContractIdAndYearMonthDateRange(
  contractId: string,
  fromDate?: Date,
  toDate?: Date,
) {
  const workReports = await db.workReport.findMany({
    where: {
      contractId,
      targetDate: { gte: fromDate, lte: toDate },
    },
    include: {
      attendances: true,
    },
    orderBy: {
      targetDate: "asc",
    },
  });
  return workReports;
}

export async function getDraftWorkReportsUpToCurrentMonth(userId?: string) {
  // 日本時間 (UTC+9) で現在の年月の1日を計算
  // サーバーがUTCで動作している場合でも、日本時間で今月の報告書を正しく表示するため
  const now = new Date();
  const japanTimeMs = now.getTime() + 9 * 60 * 60 * 1000;
  const japanTime = new Date(japanTimeMs);
  const currentMonthFirstDay = new Date(
    Date.UTC(japanTime.getUTCFullYear(), japanTime.getUTCMonth(), 1)
  );

  const workReports = await db.workReport.findMany({
    where: {
      status: WorkReportStatus.DRAFT,
      targetDate: {
        lte: currentMonthFirstDay,
      },
      ...(userId && {
        contract: {
          userId: userId,
        },
      }),
    },
    include: {
      contract: true,
    },
  });

  const groupedReports = workReports.reduce<
    Record<
      string,
      {
        contractName: string;
        clientName: string;
        workReports: {
          id: string;
          targetDate: Date;
          status: WorkReportStatus;
        }[];
      }
    >
  >((acc, report) => {
    const contractId = report.contractId;

    acc[contractId] = acc[contractId] ?? {
      contractName: report.contract.name,
      clientName: report.contract.clientName,
      workReports: [],
    };

    acc[contractId].workReports.push({
      id: report.id,
      targetDate: report.targetDate,
      status: report.status,
    });

    return acc;
  }, {});

  return groupedReports;
}

export async function updateWorkReportStatus(
  workReportId: string,
  status: WorkReportStatus,
) {
  const workReport = await db.workReport.update({
    where: { id: workReportId },
    data: { status },
  });
  return workReport;
}

export async function updateWorkReportRemarks(
  workReportId: string,
  remarks: string | null,
) {
  const workReport = await db.workReport.update({
    where: { id: workReportId },
    data: { remarks },
  });
  return workReport;
}

export async function deleteWorkReport(workReportId: string) {
  const workReport = await db.workReport.delete({
    where: { id: workReportId },
  });
  return workReport;
}

export async function checkWorkReportExists(
  contractId: string,
  targetDate: Date,
): Promise<boolean> {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  // 同じ年月の作業報告書が存在するかチェック
  const existingReport = await db.workReport.findFirst({
    where: {
      contractId,
      targetDate: {
        gte: new Date(targetYear, targetMonth, 1),
        lt: new Date(targetYear, targetMonth + 1, 1),
      },
    },
  });

  return !!existingReport;
}

export async function getSubmittedWorkReportsByRecentMonths(
  userId?: string,
  months = 3,
) {
  // Filter submissions within the past `months` months
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const workReports = await db.workReport.findMany({
    where: {
      status: WorkReportStatus.SUBMITTED,
      targetDate: { gte: cutoffDate },
      ...(userId && {
        contract: {
          userId: userId,
        },
      }),
    },
    include: {
      contract: true,
    },
  });

  const groupedReports = workReports.reduce<
    Record<
      string,
      {
        contractName: string;
        clientName: string;
        workReports: {
          id: string;
          targetDate: Date;
          status: WorkReportStatus;
        }[];
      }
    >
  >((acc, report) => {
    const contractId = report.contractId;

    acc[contractId] = acc[contractId] ?? {
      contractName: report.contract.name,
      clientName: report.contract.clientName,
      workReports: [],
    };

    acc[contractId].workReports.push({
      id: report.id,
      targetDate: report.targetDate,
      status: report.status,
    });

    return acc;
  }, {});

  return groupedReports;
}
