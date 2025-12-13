import type {
  WorkReport as PrismaWorkReport,
  Attendance as PrismaAttendance,
} from "@prisma/client";

import { AttendanceDto } from "./attendance";
import { Holiday } from "@/features/holidays/types/holiday";
import { SerializedType } from "@/utils/serialization/serialization-utils";

export type WorkReport = SerializedType<PrismaWorkReport>;

export type WorkReportWithAttendances = SerializedType<
  PrismaWorkReport & {
    attendances: PrismaAttendance[];
  }
>;

export type WorkReportStatus = WorkReport["status"];

export interface WorkReportClientProps {
  contractId: string;
  workReportId: string;
  userId: string;
  attendances: AttendanceDto[];
  contractName: string;
  clientName: string;
  closingDay: number | null;
  userName: string;
  userEmail: string;
  targetDate: Date;
  // ユーザー情報（請求書用）
  invoiceRegistrationNumber: string | null;
  postalCode: string | null;
  address: string | null;
  bankName: string | null;
  bankBranchName: string | null;
  bankAccountType: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  dailyWorkMinutes: number;
  monthlyWorkMinutes: number;
  basicStartTime: Date | null;
  basicEndTime: Date | null;
  basicBreakDuration: number | null;
  basicMemo: string | null;
  remarks: string | null;
  status: WorkReportStatus;
  holidays: Holiday[];
  // Contract settlement and tax information
  unitPrice: number | null;
  settlementMin: number | null;
  settlementMax: number | null;
  upperRate: number | null;
  lowerRate: number | null;
  middleRate: number | null;
  hourlyRate: number | null;
  taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
  taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  excessTaxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  deductionTaxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  rateType: "upperLower" | "middle" | "fixed" | "hourlyRate";
  paymentMonthOffset: number;
  paymentDay: number | null;
}
