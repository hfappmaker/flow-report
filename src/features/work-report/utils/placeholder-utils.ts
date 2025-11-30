import {
  calculateBasicWorkMinutes,
  calculateTotalWorkMinutes,
  calculateWorkingDays,
} from "@/features/contract/utils/contract-calculation-utils";
import type { WorkReportExcelData } from "@/features/work-report/libs/excel-report-generator";
import { formatWorkReportMonth } from "@/features/work-report/utils/date-formatting";

/**
 * プレースホルダー定義
 */
export interface PlaceholderDefinition {
  key: string;
  label: string;
  description: string;
  example: string;
}

/**
 * 利用可能なプレースホルダー一覧
 */
export const AVAILABLE_PLACEHOLDERS: PlaceholderDefinition[] = [
  {
    key: "タイトル",
    label: "タイトル",
    description: "対象月の作業報告書タイトル（例: 2025年1月度作業報告書）",
    example: "2025年1月度作業報告書",
  },
  {
    key: "作業者名",
    label: "作業者名",
    description: "ログインユーザーの名前（例: 山田太郎）",
    example: "山田太郎",
  },
  {
    key: "基本開始時刻",
    label: "基本開始時刻",
    description: "契約で設定された基本開始時刻（例: 9:00）",
    example: "9:00",
  },
  {
    key: "基本終了時刻",
    label: "基本終了時刻",
    description: "契約で設定された基本終了時刻（例: 18:00）",
    example: "18:00",
  },
  {
    key: "基本休憩時間",
    label: "基本休憩時間",
    description: "契約で設定された基本休憩時間（例: 1:00）",
    example: "1:00",
  },
  {
    key: "1日あたりの作業単位",
    label: "1日あたりの作業単位",
    description: "契約の日次作業単位（例: 480分）",
    example: "480分",
  },
  {
    key: "1ヶ月あたりの作業単位",
    label: "1ヶ月あたりの作業単位",
    description: "契約の月次作業単位（例: 10080分）",
    example: "10080分",
  },
  {
    key: "備考",
    label: "備考",
    description: "作業報告書の備考欄に入力した内容（例: 〇〇対応完了）",
    example: "〇〇対応完了",
  },
  {
    key: "総稼働時間",
    label: "総稼働時間",
    description: "当月の総稼働時間（例: 168:00）",
    example: "168:00",
  },
  {
    key: "基本稼働時間",
    label: "基本稼働時間",
    description: "1日あたりの基本稼働時間（例: 8:00）",
    example: "8:00",
  },
  {
    key: "稼働日数",
    label: "稼働日数",
    description: "当月の稼働日数（例: 21）",
    example: "21",
  },
];

/**
 * プレースホルダーのキー一覧
 */
export const PLACEHOLDER_KEYS = AVAILABLE_PLACEHOLDERS.map((p) => p.key);

/**
 * 時刻を[h]:mm形式の文字列に変換
 */
function formatTimeString(date: Date | null): string {
  if (!date) return "";
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

/**
 * 分を[h]:mm形式の文字列に変換
 */
function formatMinutesToTimeString(minutes: number | null): string {
  if (minutes === null) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, "0")}`;
}

/**
 * WorkReportExcelDataからプレースホルダー値を生成
 */
export function generatePlaceholderValues(
  data: WorkReportExcelData,
): Record<string, string> {
  const totalWorkMinutes = calculateTotalWorkMinutes(
    data.attendances,
    data.monthlyWorkMinutes,
  );

  const basicWorkMinutes = calculateBasicWorkMinutes(
    data.basicStartTime,
    data.basicEndTime,
    data.basicBreakDuration,
  );

  const workingDays = calculateWorkingDays(data.attendances);

  return {
    タイトル: formatWorkReportMonth(data.targetDate),
    作業者名: data.userName,
    基本開始時刻: formatTimeString(data.basicStartTime),
    基本終了時刻: formatTimeString(data.basicEndTime),
    基本休憩時間: data.basicBreakDuration
      ? formatMinutesToTimeString(data.basicBreakDuration)
      : "",
    "1日あたりの作業単位": data.dailyWorkMinutes
      ? `${String(data.dailyWorkMinutes)}分`
      : "",
    "1ヶ月あたりの作業単位": data.monthlyWorkMinutes
      ? `${String(data.monthlyWorkMinutes)}分`
      : "",
    備考: data.remarks ?? "",
    総稼働時間: formatMinutesToTimeString(totalWorkMinutes),
    基本稼働時間:
      basicWorkMinutes !== null
        ? formatMinutesToTimeString(basicWorkMinutes)
        : "",
    稼働日数: String(workingDays),
  };
}

/**
 * テンプレート文字列内のプレースホルダーを置換する
 * 日本語のキーにも対応（例: ${作業者名}）
 */
export function replacePlaceholders(
  template: string,
  values: Record<string, string>,
): string {
  // 日本語キーも含むプレースホルダーパターン
  return template.replace(/\${([^}]+)}/g, (match, key: string) => {
    const value = values[key];
    return value ?? match;
  });
}

/**
 * テンプレート文字列からプレースホルダーキーを抽出する
 */
export function extractPlaceholderKeys(template: string): string[] {
  const matches = template.match(/\${([^}]+)}/g) ?? [];
  return matches.map((match) => match.slice(2, -1));
}

/**
 * テンプレート文字列が有効な形式かチェックする
 * 空文字列やプレースホルダーを含まない文字列も有効とみなす
 */
export function isValidPlaceholderTemplate(template: string): boolean {
  if (!template) return true;

  // ${で始まり}で終わるパターンが正しく閉じているかチェック
  const openCount = (template.match(/\${/g) ?? []).length;
  const closeCount = (template.match(/}/g) ?? []).length;

  return openCount === closeCount;
}

/**
 * テンプレート文字列内のプレースホルダーが有効なキーかチェックする
 */
export function validatePlaceholderKeys(template: string): {
  valid: boolean;
  invalidKeys: string[];
} {
  const keys = extractPlaceholderKeys(template);
  const invalidKeys = keys.filter((key) => !PLACEHOLDER_KEYS.includes(key));
  return {
    valid: invalidKeys.length === 0,
    invalidKeys,
  };
}
