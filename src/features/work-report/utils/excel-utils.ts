import { MS_PER_DAY } from "@/features/work-report/constants/work-report-constants";

/**
 * ミリ秒をExcelシリアル値に変換
 * Excelでは日付や時刻を1日を1とするシリアル値で管理する
 *
 * @param ms ミリ秒
 * @returns Excelシリアル値（日数）
 */
export function msToSerial(ms: number): number {
  return ms / MS_PER_DAY;
}
