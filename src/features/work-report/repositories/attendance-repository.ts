import type { AttendanceDto } from "@/features/work-report/types/attendance";
import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";
import { Serialize } from "@/utils/serialization/serialization-utils";

export async function getAttendancesByWorkReportId(
  workReportId: string,
): Promise<Result<AttendanceDto[]>> {
  try {
    const attendances = await db.attendance.findMany({
      where: {
        workReportId: workReportId,
      },
    });

    return ok(Serialize(attendances));
  } catch (error) {
    console.error("Error fetching attendances by work report id:", error);
    return err("勤怠情報の取得に失敗しました");
  }
}

export async function getAttendanceByWorkReportIdAndDate(
  workReportId: string,
  date: Date,
): Promise<Result<AttendanceDto | null>> {
  try {
    const attendance = await db.attendance.findUnique({
      where: {
        date_workReportId: {
          date,
          workReportId,
        },
      },
    });

    return ok(attendance ? Serialize(attendance) : null);
  } catch (error) {
    console.error(
      "Error fetching attendance by work report id and date:",
      error,
    );
    return err("勤怠情報の取得に失敗しました");
  }
}

export async function updateWorkReportAttendance(
  workReportId: string,
  date: Date,
  attendance: AttendanceDto,
): Promise<Result<AttendanceDto>> {
  try {
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

    return ok(Serialize(updatedAttendance));
  } catch (error) {
    console.error("Error updating work report attendance:", error);
    return err("勤怠情報の更新に失敗しました");
  }
}
