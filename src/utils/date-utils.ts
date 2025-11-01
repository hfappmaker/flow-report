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

/**
 * 指定された年月と締め日から実際の締め日を返す
 * 締め日がその月に存在しない場合は月末日を返す
 * @param year 年
 * @param month 月（1-12）
 * @param closingDay 締め日（1-31）。nullの場合は月末日を返す
 * @returns 実際の締め日
 */
export function getClosingDate(
  year: number,
  month: number,
  closingDay: number | null,
): Date {
  // 月末日を取得（次の月の0日目 = 今月の最終日）
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  // closingDayがnull/undefinedの場合、または指定された日がその月に存在しない場合は月末日を返す
  const actualClosingDay =
    !closingDay || closingDay > lastDayOfMonth ? lastDayOfMonth : closingDay;

  return new Date(year, month - 1, actualClosingDay);
}

/**
 * 指定された年月と締め日から請求期間を返す
 * @param year 年
 * @param month 月（1-12）
 * @param closingDay 締め日（1-31）。nullの場合は月末締めとして扱う
 * @returns 請求期間（開始日と終了日）
 */
export function getBillingPeriod(
  year: number,
  month: number,
  closingDay: number | null,
): { startDate: Date; endDate: Date } {
  // 当月の実際の締め日を取得
  const endDate = getClosingDate(year, month, closingDay);

  // 前月の実際の締め日を取得
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  const previousClosingDate = getClosingDate(
    previousYear,
    previousMonth,
    closingDay,
  );

  // 前月の締め日の翌日を開始日とする
  const startDate = new Date(previousClosingDate);
  startDate.setDate(startDate.getDate() + 1);

  return { startDate, endDate };
}
