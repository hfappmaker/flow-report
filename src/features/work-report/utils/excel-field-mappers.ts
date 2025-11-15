import type ExcelJS from "exceljs";

import { formatMonthDay } from "./attendance-utils";
import { msToSerial } from "./excel-utils";
import type { AttendanceData } from "@/features/work-report/types/attendance";

/**
 * Excel名前付き範囲のフィールド名
 */
export const FIELD_NAMES = [
  "日付",
  "曜日",
  "開始時刻",
  "終了時刻",
  "休憩時間",
  "稼働時間",
  "作業内容",
] as const;

export type FieldName = (typeof FIELD_NAMES)[number];

/**
 * フィールドハンドラーの戻り値
 */
interface FieldValue {
  value: string | number;
  numFmt?: string;
}

/**
 * フィールドハンドラー関数の型定義
 */
type FieldHandler = (entry: AttendanceData) => FieldValue | null;

/**
 * 各フィールド名に対応する値取得・フォーマット処理のマッパー
 */
export const fieldMappers: Record<FieldName, FieldHandler> = {
  日付: (entry) => ({
    value: formatMonthDay(entry.date.toISOString()),
  }),

  曜日: (entry) => ({
    value: entry.date.toLocaleDateString("ja-JP", {
      weekday: "short",
      timeZone: "UTC",
    }),
  }),

  開始時刻: (entry) => {
    if (!entry.startTime) return null;
    const value = msToSerial(
      (entry.startTime.getUTCHours() * 60 + entry.startTime.getUTCMinutes()) *
        60000,
    );
    return { value, numFmt: "[h]:mm" };
  },

  終了時刻: (entry) => {
    if (!entry.endTime) return null;
    const value = msToSerial(
      (entry.endTime.getUTCHours() * 60 + entry.endTime.getUTCMinutes()) *
        60000,
    );
    return { value, numFmt: "[h]:mm" };
  },

  休憩時間: (entry) => {
    if (!entry.breakDuration) return null;
    const value = msToSerial(entry.breakDuration * 60000);
    return { value, numFmt: "[h]:mm" };
  },

  稼働時間: (entry) => {
    if (!entry.startTime || !entry.endTime) return null;
    const startMs = entry.startTime.getTime();
    let endMs = entry.endTime.getTime();
    // 開始時刻が終了時刻よりあとの場合（日付をまたぐ）、終了時刻に24時間を加算
    if (startMs > endMs) {
      endMs += 24 * 60 * 60 * 1000; // 24時間分のミリ秒を加算
    }
    const breakMs = entry.breakDuration ? entry.breakDuration * 60000 : 0;
    const value = msToSerial(endMs - startMs - breakMs);
    return { value, numFmt: "[h]:mm" };
  },

  作業内容: (entry) => {
    if (!entry.memo) return null;
    return { value: entry.memo };
  },
};

/**
 * フィールド名に対応するセル値を取得し、セルに値とフォーマットを設定
 *
 * @param fieldName フィールド名
 * @param entry 勤怠データ
 * @param sheet Excelワークシート
 * @param row 行番号
 * @param col 列番号
 */
export function setCellValueForField(
  fieldName: FieldName,
  entry: AttendanceData | undefined,
  sheet: ExcelJS.Worksheet,
  row: number,
  col: number,
): void {
  const cell = sheet.getCell(row, col);

  if (!entry) {
    cell.value = "";
    return;
  }

  const handler = fieldMappers[fieldName];

  const result = handler(entry);
  if (!result) {
    cell.value = "";
    return;
  }

  // 値とフォーマットを同時に設定
  cell.value = result.value;
  if (result.numFmt) {
    cell.numFmt = result.numFmt;
  }
}
