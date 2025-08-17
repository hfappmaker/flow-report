/**
 * 祝日関連のユーティリティ関数
 */

export type Holiday = {
  date: string; // YYYY-MM-DD format
  name: string;
};

/**
 * 祝日データを取得する
 * @param year 年（省略時は現在の年）
 * @returns 祝日の配列
 */
export async function fetchHolidays(year?: number): Promise<Holiday[]> {
  try {
    const targetYear = year ?? new Date().getFullYear();
    const response = await fetch(`/api/holidays?year=${targetYear}`);

    if (!response.ok) {
      console.error("Failed to fetch holidays:", response.status);
      return [];
    }

    const data = await response.json();
    return data.holidays ?? [];
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
}

/**
 * 指定した日付が祝日かどうかを判定する
 * @param date 判定する日付
 * @param holidays 祝日データ
 * @returns 祝日の場合true
 */
export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format
  return holidays.some((holiday) => holiday.date === dateStr);
}

/**
 * 日付の色クラスを取得する（土日祝日対応）
 * @param date 日付
 * @param holidays 祝日データ
 * @returns Tailwind CSSクラス
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
