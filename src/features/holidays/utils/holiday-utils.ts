import { Holiday } from "@/features/holidays/types/holiday";

/**
 * 指定された日付が祝日かどうかを判定
 * @param date 判定する日付
 * @param holidays 祝日リスト
 * @returns 祝日の場合true、それ以外false
 */
export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format
  return holidays.some((holiday) => holiday.date === dateStr);
}
