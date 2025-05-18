import { WorkReport as PrismaWorkReport } from "@prisma/client";

import { SerializedType } from "@/utils/serialization/serialization-utils";

import { AttendanceDto } from "./attendance";

export type WorkReport = SerializedType<PrismaWorkReport>;

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
};
