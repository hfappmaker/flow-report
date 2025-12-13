import {
  Attendance,
  ContractRateType,
  TaxInclusiveType,
  TaxRoundingType,
  WorkReport,
  WorkReportStatus,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

import { AttendanceDto } from "@/features/work-report/types/attendance";
import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";
import { getBillingPeriod } from "@/utils/date-utils";

export async function getWorkReportById(
  workReportId: string,
): Promise<Result<WorkReport | null>> {
  try {
    const workReport = await db.workReport.findUnique({
      where: {
        id: workReportId,
      },
    });

    return ok(workReport);
  } catch (error) {
    console.error("Error fetching work report by id:", error);
    return err("作業報告書の取得に失敗しました");
  }
}

type WorkReportWithContract = WorkReport & {
  contract: {
    id: string;
    name: string;
    clientName: string;
    closingDay: number | null;
    unitPrice: Decimal | null;
    settlementMin: Decimal | null;
    settlementMax: Decimal | null;
    rateType: ContractRateType;
    upperRate: Decimal | null;
    lowerRate: Decimal | null;
    middleRate: Decimal | null;
    hourlyRate: Decimal | null;
    taxInclusiveType: TaxInclusiveType;
    taxRoundingType: TaxRoundingType;
    excessTaxRoundingType: TaxRoundingType;
    deductionTaxRoundingType: TaxRoundingType;
    monthlyWorkMinutes: number | null;
    userId: string;
    startDate: Date;
    endDate: Date;
    basicStartTime: Date | null;
    basicEndTime: Date | null;
    basicBreakDuration: number | null;
    basicMemo: string | null;
    dailyWorkMinutes: number | null;
    paymentMonthOffset: number;
    paymentDay: number | null;
  };
};

export async function getWorkReportWithContractById(
  workReportId: string,
): Promise<Result<WorkReportWithContract | null>> {
  try {
    const workReport = await db.workReport.findUnique({
      where: {
        id: workReportId,
      },
      include: {
        contract: true,
      },
    });

    return ok(workReport);
  } catch (error) {
    console.error("Error fetching work report with contract by id:", error);
    return err("作業報告書の取得に失敗しました");
  }
}

export async function createWorkReport(
  contractId: string,
  targetDate: Date,
): Promise<Result<WorkReport>> {
  try {
    const workReport = await db.workReport.create({
      data: {
        contractId: contractId,
        targetDate: targetDate,
      },
    });

    return ok(workReport);
  } catch (error) {
    console.error("Error creating work report:", error);
    return err("作業報告書の作成に失敗しました");
  }
}

export async function updateWorkReportAttendances(
  workReportId: string,
  attendances: AttendanceDto[],
): Promise<Result<WorkReport>> {
  try {
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

    return ok(workReport);
  } catch (error) {
    console.error("Error updating work report attendances:", error);
    return err("勤怠情報の更新に失敗しました");
  }
}

export async function getWorkReportsByContractId(
  contractId: string,
): Promise<Result<WorkReport[]>> {
  try {
    const workReports = await db.workReport.findMany({
      where: { contractId },
    });
    return ok(workReports);
  } catch (error) {
    console.error("Error fetching work reports by contract id:", error);
    return err("作業報告書一覧の取得に失敗しました");
  }
}

type WorkReportWithAttendances = WorkReport & {
  attendances: Attendance[];
};

export async function getWorkReportsByContractIdAndYearMonthDateRange(
  contractId: string,
  fromDate?: Date,
  toDate?: Date,
): Promise<Result<WorkReportWithAttendances[]>> {
  try {
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
    return ok(workReports);
  } catch (error) {
    console.error(
      "Error fetching work reports by contract id and date range:",
      error,
    );
    return err("作業報告書一覧の取得に失敗しました");
  }
}

export type GroupedWorkReports = Record<
  string,
  {
    contractName: string;
    clientName: string;
    closingDay: number | null;
    unitPrice: Decimal | null;
    settlementMin: Decimal | null;
    settlementMax: Decimal | null;
    rateType: ContractRateType;
    upperRate: Decimal | null;
    lowerRate: Decimal | null;
    middleRate: Decimal | null;
    hourlyRate: Decimal | null;
    taxInclusiveType: TaxInclusiveType;
    taxRoundingType: TaxRoundingType;
    excessTaxRoundingType: TaxRoundingType;
    deductionTaxRoundingType: TaxRoundingType;
    monthlyWorkMinutes: number;
    workReports: {
      id: string;
      targetDate: Date;
      status: WorkReportStatus;
      attendances: AttendanceDto[];
    }[];
  }
>;

export async function getDraftWorkReportsUpToCurrentMonth(
  userId?: string,
): Promise<Result<GroupedWorkReports>> {
  try {
    // 日本時間 (UTC+9) で今日を計算
    // サーバーがUTCで動作している場合でも、日本時間で正しく判定するため
    const now = new Date();
    const japanTimeMs = now.getTime() + 9 * 60 * 60 * 1000;
    const japanTime = new Date(japanTimeMs);
    const today = new Date(
      Date.UTC(
        japanTime.getUTCFullYear(),
        japanTime.getUTCMonth(),
        japanTime.getUTCDate(),
      ),
    );

    // 来月の1日まで取得（締め日により来月の報告書が今日から始まる可能性があるため）
    const nextMonthFirstDay = new Date(
      Date.UTC(japanTime.getUTCFullYear(), japanTime.getUTCMonth() + 1, 1),
    );

    const workReports = await db.workReport.findMany({
      where: {
        status: WorkReportStatus.DRAFT,
        targetDate: {
          lte: nextMonthFirstDay,
        },
        ...(userId && {
          contract: {
            userId: userId,
          },
        }),
      },
      include: {
        contract: true,
        attendances: true,
      },
    });

    // 締め日を考慮して、今日が対象期間の開始日以降の報告書のみをフィルタリング
    // （対象期間が始まっている、または過去の報告書のみ表示）
    const filteredReports = workReports.filter((report) => {
      const targetDate = report.targetDate;
      const year = targetDate.getUTCFullYear();
      const month = targetDate.getUTCMonth() + 1; // 1-12
      const closingDay = report.contract.closingDay;

      const { startDate } = getBillingPeriod(year, month, closingDay);

      // 対象期間の開始日が今日以前の報告書を表示
      return startDate <= today;
    });

    const groupedReports = filteredReports.reduce<GroupedWorkReports>(
      (acc, report) => {
        const contractId = report.contractId;

        acc[contractId] = acc[contractId] ?? {
          contractName: report.contract.name,
          clientName: report.contract.clientName,
          closingDay: report.contract.closingDay,
          unitPrice: report.contract.unitPrice,
          settlementMin: report.contract.settlementMin,
          settlementMax: report.contract.settlementMax,
          rateType: report.contract.rateType,
          upperRate: report.contract.upperRate,
          lowerRate: report.contract.lowerRate,
          middleRate: report.contract.middleRate,
          hourlyRate: report.contract.hourlyRate,
          taxInclusiveType: report.contract.taxInclusiveType,
          taxRoundingType: report.contract.taxRoundingType,
          excessTaxRoundingType: report.contract.excessTaxRoundingType,
          deductionTaxRoundingType: report.contract.deductionTaxRoundingType,
          monthlyWorkMinutes: report.contract.monthlyWorkMinutes,
          workReports: [],
        };

        acc[contractId].workReports.push({
          id: report.id,
          targetDate: report.targetDate,
          status: report.status,
          attendances: report.attendances.map((att) => ({
            date: att.date,
            startTime: att.startTime,
            endTime: att.endTime,
            breakDuration: att.breakDuration,
            memo: att.memo,
            workReportId: att.workReportId,
          })),
        });

        return acc;
      },
      {},
    );

    return ok(groupedReports);
  } catch (error) {
    console.error("Error fetching draft work reports:", error);
    return err("下書き作業報告書の取得に失敗しました");
  }
}

export async function updateWorkReportStatus(
  workReportId: string,
  status: WorkReportStatus,
): Promise<Result<WorkReport>> {
  try {
    const workReport = await db.workReport.update({
      where: { id: workReportId },
      data: { status },
    });
    return ok(workReport);
  } catch (error) {
    console.error("Error updating work report status:", error);
    return err("作業報告書のステータス更新に失敗しました");
  }
}

export async function updateWorkReportRemarks(
  workReportId: string,
  remarks: string | null,
): Promise<Result<WorkReport>> {
  try {
    const workReport = await db.workReport.update({
      where: { id: workReportId },
      data: { remarks },
    });
    return ok(workReport);
  } catch (error) {
    console.error("Error updating work report remarks:", error);
    return err("作業報告書の備考更新に失敗しました");
  }
}

export async function deleteWorkReport(
  workReportId: string,
): Promise<Result<WorkReport>> {
  try {
    const workReport = await db.workReport.delete({
      where: { id: workReportId },
    });
    return ok(workReport);
  } catch (error) {
    console.error("Error deleting work report:", error);
    return err("作業報告書の削除に失敗しました");
  }
}

export async function checkWorkReportExists(
  contractId: string,
  targetDate: Date,
): Promise<Result<boolean>> {
  try {
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

    return ok(!!existingReport);
  } catch (error) {
    console.error("Error checking work report exists:", error);
    return err("作業報告書の存在確認に失敗しました");
  }
}

export async function getSubmittedWorkReportsByRecentMonths(
  userId?: string,
  months = 3,
): Promise<Result<GroupedWorkReports>> {
  try {
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
        attendances: true,
      },
    });

    const groupedReports = workReports.reduce<GroupedWorkReports>(
      (acc, report) => {
        const contractId = report.contractId;

        acc[contractId] = acc[contractId] ?? {
          contractName: report.contract.name,
          clientName: report.contract.clientName,
          closingDay: report.contract.closingDay,
          unitPrice: report.contract.unitPrice,
          settlementMin: report.contract.settlementMin,
          settlementMax: report.contract.settlementMax,
          rateType: report.contract.rateType,
          upperRate: report.contract.upperRate,
          lowerRate: report.contract.lowerRate,
          middleRate: report.contract.middleRate,
          hourlyRate: report.contract.hourlyRate,
          taxInclusiveType: report.contract.taxInclusiveType,
          taxRoundingType: report.contract.taxRoundingType,
          excessTaxRoundingType: report.contract.excessTaxRoundingType,
          deductionTaxRoundingType: report.contract.deductionTaxRoundingType,
          monthlyWorkMinutes: report.contract.monthlyWorkMinutes,
          workReports: [],
        };

        acc[contractId].workReports.push({
          id: report.id,
          targetDate: report.targetDate,
          status: report.status,
          attendances: report.attendances.map((att) => ({
            date: att.date,
            startTime: att.startTime,
            endTime: att.endTime,
            breakDuration: att.breakDuration,
            memo: att.memo,
            workReportId: att.workReportId,
          })),
        });

        return acc;
      },
      {},
    );

    return ok(groupedReports);
  } catch (error) {
    console.error("Error fetching submitted work reports:", error);
    return err("提出済み作業報告書の取得に失敗しました");
  }
}
