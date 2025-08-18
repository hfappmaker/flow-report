import {
  WorkReport as PrismaWorkReport,
  Attendance as PrismaAttendance,
} from "@prisma/client";

import { SerializedType } from "@/utils/serialization/serialization-utils";

import { AttendanceDto } from "./attendance";
import { Holiday } from "@/features/holidays/types/holiday";

export type WorkReport = SerializedType<PrismaWorkReport>;

export type WorkReportWithAttendances = SerializedType<
  PrismaWorkReport & {
    attendances: PrismaAttendance[];
  }
>;

export type WorkReportStatus = WorkReport["status"];

export type WorkReportClientProps = {
  contractId: string;
  workReportId: string;
  attendances: AttendanceDto[];
  contractName: string;
  clientName: string;
  contactName: string;
  closingDay: number | undefined;
  userName: string;
  clientEmail: string;
  targetDate: Date;
  dailyWorkMinutes: number;
  monthlyWorkMinutes: number;
  basicStartTime: Date | undefined;
  basicEndTime: Date | undefined;
  basicBreakDuration: number | undefined;
  status: WorkReportStatus;
  holidays: Holiday[];
  // Contract settlement and tax information
  unitPrice: number | undefined;
  settlementMin: number | undefined;
  settlementMax: number | undefined;
  upperRate: number | undefined;
  lowerRate: number | undefined;
  middleRate: number | undefined;
  taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
  taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  rateType: "upperLower" | "middle";
};
