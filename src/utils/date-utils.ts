/**
 * 日付フォーマット用のユーティリティ関数
 */

/**
 * 日付文字列またはDateオブジェクトをUTC時刻として扱い、日付のみをフォーマットする
 * タイムゾーンによる日付の変化を防ぐ
 * @param date 日付文字列またはDateオブジェクト
 * @param locale ロケール（デフォルト: 'ja-JP'）
 * @returns フォーマットされた日付文字列
 */
export function formatDateAsUTC(date: string | Date, locale = "ja-JP"): string {
  const d =
    typeof date === "string"
      ? new Date(date + "T00:00:00.000Z")
      : new Date(date);

  return d.toLocaleDateString(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 日付文字列またはDateオブジェクトをUTC時刻として扱い、詳細な日付をフォーマットする
 * @param date 日付文字列またはDateオブジェクト
 * @param locale ロケール（デフォルト: 'ja-JP'）
 * @returns フォーマットされた日付文字列（年月日）
 */
export function formatDateLongAsUTC(
  date: string | Date,
  locale = "ja-JP",
): string {
  const d =
    typeof date === "string"
      ? new Date(date + "T00:00:00.000Z")
      : new Date(date);

  return d.toLocaleDateString(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 指定された期間内の各月のリストを生成する
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns Dateオブジェクトの配列
 */
export function getMonthListBetween(startDate: Date, endDate: Date): Date[] {
  const monthList: Date[] = [];
  const currentDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
  );

  while (currentDate <= endDate) {
    monthList.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return monthList;
}
