import { Holiday } from "@/features/holidays/types/holiday";
import { isHoliday } from "@/features/holidays/utils/holiday-utils";

/**
 * 日付の表示色クラスを取得
 * - 祝日・日曜日: 赤色
 * - 土曜日: 青色
 * - 平日: デフォルト
 *
 * @param date 対象日付
 * @param holidays 祝日リスト
 * @returns TailwindCSSの色クラス
 */
export function getDateColorClass(date: Date, holidays: Holiday[]): string {
  const dayOfWeek = date.getDay();

  // 祝日チェック
  if (isHoliday(date, holidays)) {
    return "text-red-600"; // 祝日は赤
  }

  // 日曜日
  if (dayOfWeek === 0) {
    return "text-red-600"; // 日曜日は赤
  }

  // 土曜日
  if (dayOfWeek === 6) {
    return "text-blue-600"; // 土曜日は青
  }

  // 平日
  return "text-white-900";
}
