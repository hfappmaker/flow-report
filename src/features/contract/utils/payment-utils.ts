import dayjs from "dayjs";

/**
 * 支払いサイトのラベルを取得する
 * @param paymentMonthOffset 支払月オフセット（0=当月, 1=翌月, 2=翌々月）
 * @param paymentDay 支払日（1-31, null=末日）
 * @returns 支払いサイトのラベル（例：「翌月末」「翌々月25日」）
 */
export function formatPaymentSite(
  paymentMonthOffset: number,
  paymentDay: number | null,
): string {
  const monthLabels: Record<number, string> = {
    0: "当月",
    1: "翌月",
    2: "翌々月",
  };

  const monthLabel =
    monthLabels[paymentMonthOffset] ?? `${String(paymentMonthOffset)}ヶ月後`;
  const dayLabel = paymentDay ? `${String(paymentDay)}日` : "末日";

  return `${monthLabel}${dayLabel}`;
}

/**
 * 締め日と支払いサイトから支払予定日を計算する
 * @param targetDate 対象年月（YYYY-MM形式またはDate）
 * @param closingDay 締め日（1-31, null=末日）
 * @param paymentMonthOffset 支払月オフセット（0=当月, 1=翌月, 2=翌々月）
 * @param paymentDay 支払日（1-31, null=末日）
 * @returns 支払予定日（Date）
 */
export function calculatePaymentDate(
  targetDate: Date | string,
  closingDay: number | null,
  paymentMonthOffset: number,
  paymentDay: number | null,
): Date {
  // 対象月の締め日を取得
  const target = dayjs(targetDate);
  const closingMonth = target;

  // 締め日の計算（nullまたは月末日より大きい場合は月末日）
  const lastDayOfClosingMonth = closingMonth.endOf("month").date();
  const actualClosingDay =
    closingDay === null || closingDay > lastDayOfClosingMonth
      ? lastDayOfClosingMonth
      : closingDay;

  // 締め日から支払月を計算
  const closingDate = closingMonth.date(actualClosingDay);
  const paymentMonth = closingDate.add(paymentMonthOffset, "month");

  // 支払日の計算（nullまたは月末日より大きい場合は月末日）
  const lastDayOfPaymentMonth = paymentMonth.endOf("month").date();
  const actualPaymentDay =
    paymentDay === null || paymentDay > lastDayOfPaymentMonth
      ? lastDayOfPaymentMonth
      : paymentDay;

  return paymentMonth.date(actualPaymentDay).toDate();
}

/**
 * 支払予定日をフォーマットする
 * @param paymentDate 支払予定日
 * @returns フォーマットされた日付文字列（例：「2024年1月31日」）
 */
export function formatPaymentDate(paymentDate: Date): string {
  return dayjs(paymentDate).format("YYYY年M月D日");
}
