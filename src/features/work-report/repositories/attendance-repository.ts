import type { AttendanceDto } from "@/features/work-report/types/attendance";
import { db } from "@/repositories/db";
import { Serialize } from "@/utils/serialization/serialization-utils";

export async function getAttendancesByWorkReportId(
  workReportId: string,
): Promise<AttendanceDto[]> {
  const attendances = await db.attendance.findMany({
    where: {
      workReportId: workReportId,
    },
  });

  return Serialize(attendances);
}

export async function getAttendanceByWorkReportIdAndDate(
  workReportId: string,
  date: Date,
): Promise<AttendanceDto | null> {
  const attendance = await db.attendance.findUnique({
    where: {
      date_workReportId: {
        date,
        workReportId,
      },
    },
  });

  return attendance ? Serialize(attendance) : null;
}

export async function updateWorkReportAttendance(
  workReportId: string,
  date: Date,
  attendance: AttendanceDto,
): Promise<AttendanceDto> {
  const updatedAttendance = await db.attendance.upsert({
    where: { date_workReportId: { date, workReportId } },
    update: {
      startTime: attendance.startTime ?? null,
      endTime: attendance.endTime ?? null,
      breakDuration: attendance.breakDuration ?? null,
      memo: attendance.memo ?? null,
    },
    create: {
      date,
      workReportId,
      startTime: attendance.startTime ?? null,
      endTime: attendance.endTime ?? null,
      breakDuration: attendance.breakDuration ?? null,
      memo: attendance.memo ?? null,
    },
  });

  return Serialize(updatedAttendance);
}
