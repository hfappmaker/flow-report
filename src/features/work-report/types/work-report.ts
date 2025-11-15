import type {
  WorkReport as PrismaWorkReport,
  Attendance as PrismaAttendance,
} from "@prisma/client";

import { Holiday } from "@/features/holidays/types/holiday";
import { SerializedType } from "@/utils/serialization/serialization-utils";

import { AttendanceDto } from "./attendance";

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
  attendances: AttendanceDto[];
  contractName: string;
  clientName: string;
  contactName: string;
  closingDay: number | null;
  userName: string;
  clientEmail: string;
  targetDate: Date;
  dailyWorkMinutes: number;
  monthlyWorkMinutes: number;
  basicStartTime: Date | null;
  basicEndTime: Date | null;
  basicBreakDuration: number | null;
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
  rateType: "upperLower" | "middle" | "fixed" | "hourlyRate";
}
