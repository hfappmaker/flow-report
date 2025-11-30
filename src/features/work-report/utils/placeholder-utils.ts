import type { ContractRateType } from "@prisma/client";

import {
  calculateBasicWorkMinutes,
  calculateTotalWorkMinutes,
  calculateWorkAmountDetailed,
  calculateWorkingDays,
} from "@/features/contract/utils/contract-calculation-utils";
import type { WorkReportExcelData } from "@/features/work-report/libs/excel-report-generator";

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
    key: "対象年",
    label: "対象年",
    description: "対象月の年度（例: 2025）",
    example: "2025",
  },
  {
    key: "対象月",
    label: "対象月",
    description: "対象月の月（例: 1）",
    example: "1",
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
    key: "1日あたりの作業単位(分)",
    label: "1日あたりの作業単位(分)",
    description: "契約の日次作業単位（例: 0:15）",
    example: "0:15",
  },
  {
    key: "1ヶ月あたりの作業単位(分)",
    label: "1ヶ月あたりの作業単位(分)",
    description: "契約の月次作業単位（例: 0:30）",
    example: "0:30",
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
  // 請求書用プレースホルダー（契約情報）
  {
    key: "月単価",
    label: "月単価",
    description: "契約の月単価（例: 500000）",
    example: "500000",
  },
  {
    key: "時間単価",
    label: "時間単価",
    description: "契約の時間単価（例: 3000）",
    example: "3000",
  },
  {
    key: "精算下限",
    label: "精算下限",
    description: "精算幅の下限時間（例: 140）",
    example: "140",
  },
  {
    key: "精算上限",
    label: "精算上限",
    description: "精算幅の上限時間（例: 180）",
    example: "180",
  },
  {
    key: "超過時間単価",
    label: "超過時間単価",
    description: "超過時の時間単価（例: 3500）",
    example: "3500",
  },
  {
    key: "控除時間単価",
    label: "控除時間単価",
    description: "控除時の時間単価（例: 3000）",
    example: "3000",
  },
  {
    key: "中間割時間単価",
    label: "中間割時間単価",
    description: "中間割の時間単価（例: 3200）",
    example: "3200",
  },
  {
    key: "精算方式",
    label: "精算方式",
    description: "精算方式名（上下割/中間割/固定/時間単価）",
    example: "上下割",
  },
  // 計算結果
  {
    key: "基本金額",
    label: "基本金額",
    description: "精算前の基本金額（例: 500000）",
    example: "500000",
  },
  {
    key: "超過時間",
    label: "超過時間",
    description: "超過した時間数（例: 5.5）",
    example: "5.5",
  },
  {
    key: "超過金額",
    label: "超過金額",
    description: "超過時間 × 超過時間単価（例: 19250）",
    example: "19250",
  },
  {
    key: "控除時間",
    label: "控除時間",
    description: "控除された時間数（例: 3.0）",
    example: "3.0",
  },
  {
    key: "控除金額",
    label: "控除金額",
    description: "控除時間 × 控除時間単価（例: 9000）",
    example: "9000",
  },
  {
    key: "小計金額",
    label: "小計金額",
    description: "基本金額 + 超過金額 - 控除金額（例: 510250）",
    example: "510250",
  },
  {
    key: "消費税額",
    label: "消費税額",
    description: "消費税額（例: 51025）",
    example: "51025",
  },
  {
    key: "合計金額",
    label: "合計金額",
    description: "小計 + 消費税（例: 561275）",
    example: "561275",
  },
  {
    key: "税込税抜",
    label: "税込税抜",
    description: "契約の税込/税抜設定（例: 税抜）",
    example: "税抜",
  },
  // 日付関連
  {
    key: "締め日",
    label: "締め日",
    description: "契約の締め日（未設定時は対象月の最終日）",
    example: "20",
  },
  {
    key: "請求日",
    label: "請求日",
    description: "対象月の締め日の日付（YYYY/MM/DD形式）",
    example: "2025/01/20",
  },
  {
    key: "支払期限",
    label: "支払期限",
    description: "請求日の翌月末（YYYY/MM/DD形式）",
    example: "2025/02/28",
  },
  // ユーザー情報
  {
    key: "郵便番号",
    label: "郵便番号",
    description: "ユーザーの郵便番号",
    example: "123-4567",
  },
  {
    key: "住所",
    label: "住所",
    description: "ユーザーの住所",
    example: "東京都渋谷区...",
  },
  {
    key: "銀行名",
    label: "銀行名",
    description: "振込先銀行名",
    example: "○○銀行",
  },
  {
    key: "支店名",
    label: "支店名",
    description: "振込先支店名",
    example: "○○支店",
  },
  {
    key: "口座種別",
    label: "口座種別",
    description: "口座種別（普通/当座）",
    example: "普通",
  },
  {
    key: "口座番号",
    label: "口座番号",
    description: "口座番号",
    example: "1234567",
  },
  {
    key: "口座名義",
    label: "口座名義",
    description: "口座名義",
    example: "ヤマダ タロウ",
  },
];

/**
 * プレースホルダーのキー一覧
 */
export const PLACEHOLDER_KEYS = AVAILABLE_PLACEHOLDERS.map((p) => p.key);

/**
 * 請求書用の契約データ
 */
export interface InvoiceContractData {
  unitPrice: number | null;
  hourlyRate: number | null;
  settlementMin: number | null;
  settlementMax: number | null;
  upperRate: number | null;
  lowerRate: number | null;
  middleRate: number | null;
  rateType: ContractRateType;
  taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
  taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  closingDay: number | null;
}

/**
 * 精算方式を日本語に変換
 */
function formatRateType(rateType: ContractRateType): string {
  const rateTypeLabels: Record<ContractRateType, string> = {
    upperLower: "上下割",
    middle: "中間割",
    fixed: "固定",
    hourlyRate: "時間単価",
  };
  return rateTypeLabels[rateType];
}

/**
 * 日付をYYYY/MM/DD形式でフォーマット
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${String(year)}/${month}/${day}`;
}

/**
 * 対象月の請求日を計算（締め日がない場合は月末）
 */
function calculateInvoiceDate(
  targetDate: Date,
  closingDay: number | null,
): Date {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  if (closingDay === null) {
    // 締め日が未設定の場合は対象月の最終日
    return new Date(year, month + 1, 0);
  }

  // 締め日が対象月の日数を超える場合は月末
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const actualClosingDay = Math.min(closingDay, lastDayOfMonth);

  return new Date(year, month, actualClosingDay);
}

/**
 * 支払期限を計算（請求日の翌月末）
 */
function calculatePaymentDeadline(invoiceDate: Date): Date {
  const year = invoiceDate.getFullYear();
  const month = invoiceDate.getMonth();
  // 翌月の最終日
  return new Date(year, month + 2, 0);
}

/**
 * 時刻を[h]:mm形式の文字列に変換
 */
function formatTimeString(date: Date | null): string {
  if (!date) return "";
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${String(hours)}:${String(minutes).padStart(2, "0")}`;
}

/**
 * 分を[h]:mm形式の文字列に変換
 */
function formatMinutesToTimeString(minutes: number | null): string {
  if (minutes === null) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours)}:${String(mins).padStart(2, "0")}`;
}

/**
 * WorkReportExcelDataからプレースホルダー値を生成
 * @param data 作業報告書データ
 * @param contractData 請求書用の契約データ（オプション）
 */
export function generatePlaceholderValues(
  data: WorkReportExcelData,
  contractData?: InvoiceContractData,
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

  // 基本プレースホルダー
  const basePlaceholders: Record<string, string> = {
    対象年: String(data.targetDate.getFullYear()),
    対象月: String(data.targetDate.getMonth() + 1),
    作業者名: data.userName,
    基本開始時刻: formatTimeString(data.basicStartTime),
    基本終了時刻: formatTimeString(data.basicEndTime),
    基本休憩時間: data.basicBreakDuration
      ? formatMinutesToTimeString(data.basicBreakDuration)
      : "",
    "1日あたりの作業単位": data.dailyWorkMinutes
      ? formatMinutesToTimeString(data.dailyWorkMinutes)
      : "",
    "1ヶ月あたりの作業単位": data.monthlyWorkMinutes
      ? formatMinutesToTimeString(data.monthlyWorkMinutes)
      : "",
    備考: data.remarks ?? "",
    総稼働時間: formatMinutesToTimeString(totalWorkMinutes),
    基本稼働時間:
      basicWorkMinutes !== null
        ? formatMinutesToTimeString(basicWorkMinutes)
        : "",
    稼働日数: String(workingDays),
    // ユーザー情報
    郵便番号: data.postalCode ?? "",
    住所: data.address ?? "",
    銀行名: data.bankName ?? "",
    支店名: data.bankBranchName ?? "",
    口座種別: data.bankAccountType ?? "",
    口座番号: data.bankAccountNumber ?? "",
    口座名義: data.bankAccountHolder ?? "",
  };

  // 契約データがない場合は基本プレースホルダーのみ返す
  if (!contractData) {
    return basePlaceholders;
  }

  // 請求書用プレースホルダーを追加
  const invoicePlaceholders: Record<string, string> = {
    月単価:
      contractData.unitPrice !== null ? String(contractData.unitPrice) : "",
    時間単価:
      contractData.hourlyRate !== null ? String(contractData.hourlyRate) : "",
    精算下限:
      contractData.settlementMin !== null
        ? String(contractData.settlementMin)
        : "",
    精算上限:
      contractData.settlementMax !== null
        ? String(contractData.settlementMax)
        : "",
    超過時間単価:
      contractData.upperRate !== null ? String(contractData.upperRate) : "",
    控除時間単価:
      contractData.lowerRate !== null ? String(contractData.lowerRate) : "",
    中間割時間単価:
      contractData.middleRate !== null ? String(contractData.middleRate) : "",
    精算方式: formatRateType(contractData.rateType),
    税込税抜: contractData.taxInclusiveType === "INCLUSIVE" ? "税込" : "税抜",
  };

  // 金額計算
  const amountDetails = calculateWorkAmountDetailed(totalWorkMinutes, {
    unitPrice: contractData.unitPrice,
    settlementMin: contractData.settlementMin,
    settlementMax: contractData.settlementMax,
    upperRate: contractData.upperRate,
    lowerRate: contractData.lowerRate,
    middleRate: contractData.middleRate,
    hourlyRate: contractData.hourlyRate,
    taxInclusiveType: contractData.taxInclusiveType,
    taxRoundingType: contractData.taxRoundingType,
    rateType: contractData.rateType,
    monthlyWorkMinutes: data.monthlyWorkMinutes,
  });

  if (amountDetails) {
    const subtotal =
      amountDetails.baseAmount +
      amountDetails.excessInfo.amount -
      amountDetails.deductionInfo.amount;

    // 消費税計算
    const taxRate = 0.1;
    const taxAmount =
      contractData.taxInclusiveType === "INCLUSIVE"
        ? Math.round((subtotal / 1.1) * taxRate)
        : (() => {
            const rawTaxAmount = subtotal * taxRate;
            switch (contractData.taxRoundingType) {
              case "ROUND_UP":
                return Math.ceil(rawTaxAmount);
              case "ROUND_DOWN":
                return Math.floor(rawTaxAmount);
              case "ROUND":
              default:
                return Math.round(rawTaxAmount);
            }
          })();

    const totalAmount =
      contractData.taxInclusiveType === "INCLUSIVE"
        ? subtotal
        : subtotal + taxAmount;

    Object.assign(invoicePlaceholders, {
      基本金額: String(Math.round(amountDetails.baseAmount)),
      超過時間: String(amountDetails.excessInfo.hours),
      超過金額: String(Math.round(amountDetails.excessInfo.amount)),
      控除時間: String(amountDetails.deductionInfo.hours),
      控除金額: String(Math.round(amountDetails.deductionInfo.amount)),
      小計金額: String(Math.round(subtotal)),
      消費税額: String(taxAmount),
      合計金額: String(Math.round(totalAmount)),
    });
  } else {
    // 計算できない場合は空文字
    Object.assign(invoicePlaceholders, {
      基本金額: "",
      超過時間: "",
      超過金額: "",
      控除時間: "",
      控除金額: "",
      小計金額: "",
      消費税額: "",
      合計金額: "",
    });
  }

  // 日付関連
  const invoiceDate = calculateInvoiceDate(
    data.targetDate,
    contractData.closingDay,
  );
  const paymentDeadline = calculatePaymentDeadline(invoiceDate);
  const closingDayValue =
    contractData.closingDay !== null
      ? String(contractData.closingDay)
      : String(invoiceDate.getDate());

  Object.assign(invoicePlaceholders, {
    締め日: closingDayValue,
    請求日: formatDateString(invoiceDate),
    支払期限: formatDateString(paymentDeadline),
  });

  return { ...basePlaceholders, ...invoicePlaceholders };
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
    if (key in values) {
      return values[key];
    }
    return match;
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
