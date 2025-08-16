import {
  DateRangeMode,
  ExcelRange,
} from "@/features/work-report/schemas/work-report-form-schemas";
import { AttendanceData } from "@/features/work-report/types/attendance";

export function generateDefaultAttendances(
  year: number,
  monthIndex: number,
  closingDay: number | undefined,
): AttendanceData[] {
  const defaults: AttendanceData[] = [];

  const adjustedYearClosingDay = monthIndex === 0 ? year - 1 : year;
  const adjustedMonthIndexClosingDay = monthIndex === 0 ? 11 : monthIndex - 1;

  const adjustedYear = monthIndex === 11 ? year + 1 : year;
  const adjustedMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;

  let current = closingDay
    ? new Date(
        Date.UTC(
          adjustedYearClosingDay,
          adjustedMonthIndexClosingDay,
          closingDay + 1,
        ),
      )
    : new Date(Date.UTC(year, monthIndex, 1));
  const end = closingDay
    ? new Date(Date.UTC(year, monthIndex, closingDay + 1))
    : new Date(Date.UTC(adjustedYear, adjustedMonthIndex, 1));

  while (current < end) {
    defaults.push({
      date: current,
      startTime: undefined,
      endTime: undefined,
      breakDuration: undefined,
      memo: undefined,
    });
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
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
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function shouldUpdateDate(
  date: Date,
  dateRangeMode: DateRangeMode,
  selectedDays?: number[],
  startDate?: Date,
  endDate?: Date,
  excludeHolidays?: boolean,
  holidays?: Array<{ date: string }>,
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
    const isHoliday = holidays.some(holiday => holiday.date === dateStr);
    if (isHoliday) {
      shouldUpdate = false;
    }
  }

  return shouldUpdate;
}

export function getBulkEditFormDefaults(
  basicStartTime: Date | undefined,
  basicEndTime: Date | undefined,
  basicBreakDuration: number | undefined,
) {
  return {
    dateRangeMode: "weekday" as DateRangeMode,
    selectedDays: [1, 2, 3, 4, 5],
    excludeHolidays: true,
    startTime: basicStartTime
      ? new Date(basicStartTime.toISOString())
      : undefined,
    endTime: basicEndTime ? new Date(basicEndTime.toISOString()) : undefined,
    breakDuration: basicBreakDuration,
    memo: "",
    startDate: undefined,
    endDate: undefined,
  };
}
