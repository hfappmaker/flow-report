import {
  DateRangeMode,
  ExcelRange,
} from "@/features/work-report/schemas/work-report-form-schemas";
import { AttendanceData } from "@/features/work-report/types/attendance";
import { getBillingPeriod } from "@/utils/date-utils";

export function generateDefaultAttendances(
  year: number,
  monthIndex: number,
  closingDay: number | null,
): AttendanceData[] {
  const defaults: AttendanceData[] = [];

  let startDate: Date;
  let endDate: Date;

  if (closingDay) {
    // 締め日が指定されている場合、getBillingPeriodを使用して正確な期間を取得
    const period = getBillingPeriod(year, monthIndex + 1, closingDay);
    // getBillingPeriodが返すDateをUTC時刻に変換
    startDate = new Date(
      Date.UTC(
        period.startDate.getFullYear(),
        period.startDate.getMonth(),
        period.startDate.getDate(),
      ),
    );
    endDate = new Date(
      Date.UTC(
        period.endDate.getFullYear(),
        period.endDate.getMonth(),
        period.endDate.getDate(),
      ),
    );
  } else {
    // 締め日が指定されていない場合、月初から月末まで
    startDate = new Date(Date.UTC(year, monthIndex, 1));
    const adjustedYear = monthIndex === 11 ? year + 1 : year;
    const adjustedMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
    endDate = new Date(Date.UTC(adjustedYear, adjustedMonthIndex, 0)); // 月末
  }

  const current = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1); // 終了日を含めるため、終了日の次の日まで

  while (current < end) {
    defaults.push({
      date: new Date(current),
      startTime: null,
      endTime: null,
      breakDuration: null,
      memo: null,
    });
    current.setDate(current.getDate() + 1);
  }

  return defaults;
}

export function mergeAttendances(
  defaults: AttendanceData[],
  attendances: AttendanceData[],
): AttendanceData[] {
  const attendanceMap = new Map<string, AttendanceData>();
  attendances.forEach((attendance) => {
    attendanceMap.set(attendance.date.toISOString(), attendance);
  });

  return defaults.map((defaultAttendance) => {
    const existingAttendance = attendanceMap.get(
      defaultAttendance.date.toISOString(),
    );
    if (existingAttendance) {
      return {
        ...defaultAttendance,
        startTime: existingAttendance.startTime,
        endTime: existingAttendance.endTime,
        breakDuration: existingAttendance.breakDuration,
        memo: existingAttendance.memo,
      };
    }
    return defaultAttendance;
  });
}

export function parseRangeReference(
  ref: string | undefined,
): [string | null, string | null] {
  if (!ref) {
    return [null, null];
  }
  const match = /(?:'([^']+)'|([^!]+))!(.+)/.exec(ref);
  if (match) {
    const sheetName = match[1] || match[2];
    const address = match[3];
    return [sheetName, address];
  }
  return [null, ref];
}

export function parseExcelRange(range: string): ExcelRange {
  const match = /(\$?)([A-Z]+)(\$?)(\d+):(\$?)([A-Z]+)(\$?)(\d+)/.exec(range);
  if (match) {
    const startCol = columnNameToNumber(match[2]);
    const startRow = parseInt(match[4], 10);
    const endCol = columnNameToNumber(match[6]);
    const endRow = parseInt(match[8], 10);
    return { startRow, startCol, endRow, endCol };
  }
  const singleCellMatch = /(\$?)([A-Z]+)(\$?)(\d+)/.exec(range);
  if (singleCellMatch) {
    const col = columnNameToNumber(singleCellMatch[2]);
    const row = parseInt(singleCellMatch[4], 10);
    return { startRow: row, startCol: col, endRow: row, endCol: col };
  }
  return { startRow: 1, startCol: 1, endRow: 100, endCol: 10 };
}

export function columnNameToNumber(name: string): number {
  const cleanName = name.replace(/\$/g, "");
  let sum = 0;
  for (let i = 0; i < cleanName.length; i++) {
    sum = sum * 26 + (cleanName.charCodeAt(i) - "A".charCodeAt(0) + 1);
  }
  return sum;
}

export function formatMonthDay(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1)}月${String(d.getDate())}日`;
}

export function shouldUpdateDate(
  date: Date,
  dateRangeMode: DateRangeMode,
  selectedDays: number[] | null,
  startDate: Date | null,
  endDate: Date | null,
  excludeHolidays: boolean | null,
  holidays: { date: string }[] | null,
): boolean {
  const dayOfWeek = date.getDay();

  // 基本的な条件チェック
  let shouldUpdate = false;
  switch (dateRangeMode) {
    case "all":
      shouldUpdate = true;
      break;
    case "weekday":
      shouldUpdate = selectedDays?.includes(dayOfWeek) ?? false;
      break;
    case "custom":
      if (startDate && endDate) {
        shouldUpdate = date >= startDate && date <= endDate;
      }
      break;
    default:
      shouldUpdate = false;
  }

  // 祝日除外オプションが有効で、かつ祝日の場合は除外
  if (shouldUpdate && excludeHolidays && holidays) {
    const dateStr = date.toISOString().split("T")[0];
    const isHoliday = holidays.some((holiday) => holiday.date === dateStr);
    if (isHoliday) {
      shouldUpdate = false;
    }
  }

  return shouldUpdate;
}

export function getBulkEditFormDefaults(
  basicStartTime: Date | null,
  basicEndTime: Date | null,
  basicBreakDuration: number | null,
) {
  return {
    dateRangeMode: "weekday" as DateRangeMode,
    selectedDays: [1, 2, 3, 4, 5],
    excludeHolidays: true,
    startTime: basicStartTime ? new Date(basicStartTime.toISOString()) : null,
    endTime: basicEndTime ? new Date(basicEndTime.toISOString()) : null,
    breakDuration: basicBreakDuration ?? null,
    memo: null,
    startDate: null,
    endDate: null,
    prompt: null,
  };
}
