import { ExcelRange } from "@/features/work-report/schemas/work-report-form-schemas";
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

  const current = new Date(
    Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    ),
  );
  const end = new Date(
    Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1),
  );

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

/**
 * 範囲参照のシート名を置き換える
 * @param ref - 元の範囲参照 (例: "'請求書（上下割　税込）'!A1:A26")
 * @param newSheetName - 新しいシート名
 * @returns シート名を置き換えた範囲参照 (例: "'請求書（上下割　税抜）'!A1:A26")
 */
export function replaceSheetNameInReference(
  ref: string,
  newSheetName: string,
): string {
  // 既存のparseRangeReference()の正規表現を再利用
  const match = /(?:'([^']+)'|([^!]+))!(.+)/.exec(ref);

  if (match) {
    // シート参照が存在する場合、新しいシート名に置き換え
    const cellAddress = match[3];
    // シート名に特殊文字が含まれる可能性があるため、常にシングルクォートで囲む
    return `'${newSheetName}'!${cellAddress}`;
  }

  // シート参照がない場合、新規追加
  return `'${newSheetName}'!${ref}`;
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
  selectedDays: number[] | null,
  startDate: Date,
  endDate: Date,
  excludeHolidays: boolean | null,
  holidays: { date: string }[] | null,
): boolean {
  const dayOfWeek = date.getDay();

  // 期間チェック
  let shouldUpdate = date >= startDate && date <= endDate;

  // 曜日チェック
  if (shouldUpdate && selectedDays && selectedDays.length > 0) {
    shouldUpdate = selectedDays.includes(dayOfWeek);
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
  basicMemo: string | null,
  startDate: Date,
  endDate: Date,
) {
  return {
    startDate: startDate,
    endDate: endDate,
    selectedDays: [1, 2, 3, 4, 5],
    excludeHolidays: true,
    startTime: basicStartTime ? new Date(basicStartTime.toISOString()) : null,
    endTime: basicEndTime ? new Date(basicEndTime.toISOString()) : null,
    breakDuration: basicBreakDuration ?? null,
    memo: basicMemo,
    prompt: null,
  };
}
