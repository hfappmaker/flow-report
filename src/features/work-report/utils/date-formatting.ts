/**
 * 作業報告書の年月を「YYYY年M月度作業報告書」形式でフォーマット
 * @param date 対象の日付
 * @returns フォーマットされた文字列（例: "2025年1月度作業報告書"）
 */
export function formatWorkReportMonth(date: Date): string {
  return `${String(date.getFullYear())}年${String(date.getMonth() + 1)}月度作業報告書`;
}

/**
 * 作業報告書の年月を「YYYY年M月度作業報告書」形式でフォーマット（UTC版）
 * @param date 対象の日付
 * @returns フォーマットされた文字列（例: "2025年1月度作業報告書"）
 */
export function formatWorkReportMonthUTC(date: Date): string {
  return `${String(date.getUTCFullYear())}年${String(date.getUTCMonth() + 1)}月度作業報告書`;
}

/**
 * 作業報告書のファイル名を生成
 * @param date 対象の日付
 * @param userName ユーザー名
 * @returns ファイル名（例: "2025年1月度作業報告書_山田太郎.xlsx"）
 */
export function formatWorkReportFileName(date: Date, userName: string): string {
  return `${formatWorkReportMonth(date)}_${userName}.xlsx`;
}

/**
 * 作業報告書のメール件名を生成
 * @param date 対象の日付（UTC）
 * @param userName ユーザー名
 * @returns メール件名（例: "【作業報告書】2025年1月分_山田太郎"）
 */
export function formatWorkReportEmailSubject(
  date: Date,
  userName: string,
): string {
  return `【作業報告書】${String(date.getUTCFullYear())}年${String(date.getUTCMonth() + 1)}月分_${userName}`;
}

/**
 * 作業報告書のメール本文用の年月を生成
 * @param date 対象の日付（UTC）
 * @returns 年月文字列（例: "2025年1月分"）
 */
export function formatWorkReportEmailMonth(date: Date): string {
  return `${String(date.getUTCFullYear())}年${String(date.getUTCMonth() + 1)}月分`;
}

/**
 * 時刻を「HH:MM」形式でフォーマット
 * @param date 時刻を含むDateオブジェクト（nullの場合は空文字列を返す）
 * @returns フォーマットされた時刻文字列（例: "09:30"）
 */
export function formatTimeInput(date: Date | null): string {
  if (!date) return "";
  // UTC時刻を使用（タイムゾーンの影響を受けないように）
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * 休憩時間を「HH:MM」形式でフォーマット（type="time"用）
 * @param minutes 休憩時間（分）
 * @returns フォーマットされた休憩時間文字列（例: "01:30"）
 */
export function formatBreakDuration(minutes: number | null): string {
  if (minutes === null) return "";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = String(minutes % 60).padStart(2, "0");
  return `${String(hours).padStart(2, "0")}:${remainingMinutes}`;
}

/**
 * 請求書のファイル名を生成
 * @param date 対象の日付
 * @param userName ユーザー名
 * @returns ファイル名（例: "2025年1月度請求書_山田太郎.xlsx"）
 */
export function formatInvoiceFileName(date: Date, userName: string): string {
  return `${String(date.getFullYear())}年${String(date.getMonth() + 1)}月度請求書_${userName}.xlsx`;
}
