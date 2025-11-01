"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { generateWithAI } from "@/features/ai/lib/ai";
import { fetchHolidays } from "@/features/holidays/libs/google-calendar";
import {
  getAttendancesByWorkReportId,
  updateWorkReportAttendance,
} from "@/features/work-report/repositories/attendance-repository";
import {
  AttendanceData,
  AttendanceDto,
} from "@/features/work-report/types/attendance";

export const getAttendancesByWorkReportIdAction = async (
  workReportId: string,
): Promise<AttendanceDto[]> => {
  try {
    const attendances = await getAttendancesByWorkReportId(workReportId);
    return attendances;
  } catch (error) {
    console.error("Error fetching attendances:", error);
    throw new Error("Failed to fetch attendances");
  }
};

export const updateWorkReportAttendanceAction = async (
  workReportId: string,
  date: Date,
  attendance: AttendanceDto,
): Promise<AttendanceDto> => {
  const updatedAttendance = await updateWorkReportAttendance(
    workReportId,
    date,
    attendance,
  );
  revalidatePath(`/workReport/${workReportId}`);
  return updatedAttendance;
};

export const createAttendancesByPromptAction = async (
  workReportId: string,
  targetDate: Date,
  basicStartTime: Date | undefined,
  basicEndTime: Date | undefined,
  basicBreakDuration: number | undefined,
  currentAttendances: AttendanceData[],
  prompt: string,
): Promise<AttendanceDto[]> => {
  const schema = z.object({
    attendances: z.array(
      z.object({
        date: z.string().datetime(),
        startTime: z.string().datetime().nullable(),
        endTime: z.string().datetime().nullable(),
        breakDuration: z.number().min(0).max(1440).nullable(),
        memo: z.string().nullable(),
      }),
    ),
  });

  type SchemaType = z.infer<typeof schema>;

  const holidays = await fetchHolidays(2025);
  targetDate = new Date(targetDate);

  // 月の全日付と曜日情報を生成
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const calendarInfo = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dayOfWeek = date.getDay();
    const dayName = dayNames[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateStr = date.toISOString().split("T")[0];
    const isHoliday = holidays.some((holiday) => holiday.date === dateStr);

    return {
      date: i + 1,
      dayName,
      isWeekend,
      isHoliday,
      isWorkday: !isWeekend && !isHoliday,
    };
  });

  const systemPrompt = `あなたは勤怠管理アシスタントです。プロンプトに基づいて${year}年${String(month + 1)}月の勤怠情報を生成してください。

  📋 **出力要件**
  - 月の1日から最終日まで全ての日付を含める
  - 勤務日は平日（月〜金）を基本とし、土日祝は休日とする

  📅 **${year}年${String(month + 1)}月カレンダー情報**
  ${calendarInfo
    .map(
      (day) =>
        `${String(day.date)}日(${day.dayName})${day.isHoliday ? "🏮祝日" : day.isWeekend ? "🏠休日" : "💼平日"}`,
    )
    .join(", ")}

  🎌 **祝日データ**: ${JSON.stringify(holidays.map((h) => `${h.date}(${h.name})`))}

  📊 **データ形式**
  - date: 日付（YYYY-MM-DDTHH:mm:ss.sssZ形式）
  - startTime: 出勤時間（YYYY-MM-DDTHH:mm:ss.sssZ形式、休日はnull）${basicStartTime ? `\n- 基本出勤時間: ${new Date(basicStartTime).toISOString().split("T")[1]}` : ""}
  - endTime: 退勤時間（YYYY-MM-DDTHH:mm:ss.sssZ形式、休日はnull）${basicEndTime ? `\n- 基本退勤時間: ${new Date(basicEndTime).toISOString().split("T")[1]}` : ""}
  - breakDuration: 休憩時間（分単位、休日はnull）${basicBreakDuration !== undefined ? `\n- 基本休憩時間: ${String(basicBreakDuration)}分` : ""}
  - memo: 作業内容（休日は"休日"、平日は"通常業務"など）

  💡 **プロンプト例**
  - "9:00-18:00の勤務で、昼休憩は60分"
  - "短時間勤務で9:30-15:30、休憩30分"`;

  console.log(systemPrompt);

  const response = await generateWithAI({
    system: systemPrompt,
    prompt: prompt,
    schema: schema,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Failed to generate attendances");
  }

  // データは既にOpenAIのparseでバリデーション済みだが、型安全性のためにもう一度パース
  const parseResult = schema.safeParse(response.data);
  if (!parseResult.success) {
    throw new Error(`Invalid response format: ${parseResult.error.message}`);
  }

  const data: SchemaType = parseResult.data;
  const attendances = data.attendances.map((attendance) => ({
    workReportId: workReportId,
    date: new Date(
      Date.UTC(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        new Date(attendance.date).getDate(),
      ),
    ),
    startTime: attendance.startTime
      ? new Date(
          Date.UTC(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            new Date(attendance.date).getDate(),
            new Date(attendance.startTime).getHours(),
            new Date(attendance.startTime).getMinutes(),
          ),
        )
      : null,
    endTime: attendance.endTime
      ? new Date(
          Date.UTC(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            new Date(attendance.date).getDate(),
            new Date(attendance.endTime).getHours(),
            new Date(attendance.endTime).getMinutes(),
          ),
        )
      : null,
    breakDuration: attendance.breakDuration ?? null,
    memo: attendance.memo ?? null,
  }));
  return currentAttendances.map((day) => {
    const attendance = attendances.find(
      (a) => a.date.getDate() === new Date(day.date).getDate(),
    );
    if (!attendance) {
      // 該当日が生成されていない場合は、基本値を使用
      return {
        workReportId: workReportId,
        date: day.date,
        startTime: day.startTime,
        endTime: day.endTime,
        breakDuration: day.breakDuration,
        memo: day.memo,
      };
    }
    return attendance;
  });
};
