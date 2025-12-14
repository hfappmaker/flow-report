import type { ContractRateType } from "@prisma/client";

import {
  calculateBasicWorkMinutes,
  calculateTotalWorkMinutes,
  calculateWorkAmountDetailed,
  calculateWorkingDays,
} from "@/features/contract/utils/contract-calculation-utils";
import { calculatePaymentDate } from "@/features/contract/utils/payment-utils";
import type { WorkReportExcelData } from "@/features/work-report/libs/excel-report-generator";

/**
 * プレースホルダーカテゴリ定義
 */
export const PLACEHOLDER_CATEGORIES = {
  workReport: "作業報告書情報",
  dailyAttendance: "日次勤怠",
  contract: "契約情報",
  user: "ユーザー情報",
  invoice: "請求情報",
} as const;

export type PlaceholderCategory = keyof typeof PLACEHOLDER_CATEGORIES;

/**
 * プレースホルダー定義
 */
export interface PlaceholderDefinition {
  key: string;
  label: string;
  description: string;
  example: string;
  category: PlaceholderCategory;
}

/**
 * 利用可能なプレースホルダー一覧
 */
export const AVAILABLE_PLACEHOLDERS: PlaceholderDefinition[] = [
  // 作業報告書情報
  {
    key: "対象年",
    label: "対象年",
    description: "対象月の年（例: 2025）",
    example: "2025",
    category: "workReport",
  },
  {
    key: "対象月",
    label: "対象月",
    description: "対象月の月（例: 1）",
    example: "1",
    category: "workReport",
  },
  {
    key: "備考",
    label: "備考",
    description: "作業報告書の備考欄に入力した内容（例: 〇〇対応完了）",
    example: "〇〇対応完了",
    category: "workReport",
  },
  {
    key: "総稼働時間",
    label: "総稼働時間",
    description: "当月の総稼働時間（例: 168:00）",
    example: "168:00",
    category: "workReport",
  },
  {
    key: "稼働日数",
    label: "稼働日数",
    description: "当月の稼働日数（例: 21）",
    example: "21",
    category: "workReport",
  },
  // 日次勤怠
  {
    key: "日付列",
    label: "日付列",
    description: "日付列（最大31行）（例: 1, 2, 3, ...）",
    example: "1",
    category: "dailyAttendance",
  },
  {
    key: "曜日列",
    label: "曜日列",
    description: "曜日列（最大31行）（例: 月, 火, 水, ...）",
    example: "月",
    category: "dailyAttendance",
  },
  {
    key: "開始時刻列",
    label: "開始時刻列",
    description: "開始時刻列（最大31行）（例: 9:00, 10:00, ...）",
    example: "9:00",
    category: "dailyAttendance",
  },
  {
    key: "終了時刻列",
    label: "終了時刻列",
    description: "終了時刻列（最大31行）（例: 18:00, 19:00, ...）",
    example: "18:00",
    category: "dailyAttendance",
  },
  {
    key: "休憩時間列",
    label: "休憩時間列",
    description: "休憩時間列（最大31行）（例: 1:00, 0:30, ...）",
    example: "1:00",
    category: "dailyAttendance",
  },
  {
    key: "稼働時間列",
    label: "稼働時間列",
    description: "稼働時間列（最大31行）（例: 8:00, 7:30, ...）",
    example: "8:00",
    category: "dailyAttendance",
  },
  {
    key: "作業内容列",
    label: "作業内容列",
    description: "作業内容列（最大31行）（例: 機能開発, バグ修正, ...）",
    example: "機能開発",
    category: "dailyAttendance",
  },
  // 契約情報
  {
    key: "契約名",
    label: "契約名",
    description: "契約の名前（例: 〇〇システム開発プロジェクト）",
    example: "〇〇システム開発プロジェクト",
    category: "contract",
  },
  {
    key: "クライアント名",
    label: "クライアント名",
    description: "クライアントの名前（例: 山田商事）",
    example: "山田商事",
    category: "contract",
  },
  {
    key: "基本開始時刻",
    label: "基本開始時刻",
    description: "契約で設定された基本開始時刻（例: 9:00）",
    example: "9:00",
    category: "contract",
  },
  {
    key: "基本終了時刻",
    label: "基本終了時刻",
    description: "契約で設定された基本終了時刻（例: 18:00）",
    example: "18:00",
    category: "contract",
  },
  {
    key: "基本休憩時間",
    label: "基本休憩時間",
    description: "契約で設定された基本休憩時間（例: 1:00）",
    example: "1:00",
    category: "contract",
  },
  {
    key: "基本稼働時間",
    label: "基本稼働時間",
    description: "1日あたりの基本稼働時間（例: 8:00）",
    example: "8:00",
    category: "contract",
  },
  {
    key: "1日あたりの作業単位",
    label: "1日あたりの作業単位(分)",
    description: "契約の日次作業単位(分)（例: 15）",
    example: "15",
    category: "contract",
  },
  {
    key: "1ヶ月あたりの作業単位",
    label: "1ヶ月あたりの作業単位(分)",
    description: "契約の月次作業単位(分)（例: 30）",
    example: "30",
    category: "contract",
  },
  {
    key: "月単価",
    label: "月単価",
    description: "契約の月単価（例: 500000）",
    example: "500000",
    category: "contract",
  },
  {
    key: "時間単価",
    label: "時間単価",
    description: "契約の時間単価（例: 3000）\n※精算方式が時間単価の場合のみ",
    example: "3000",
    category: "contract",
  },
  {
    key: "精算下限",
    label: "精算下限",
    description: "精算幅の下限時間（例: 140）",
    example: "140",
    category: "contract",
  },
  {
    key: "精算上限",
    label: "精算上限",
    description: "精算幅の上限時間（例: 180）",
    example: "180",
    category: "contract",
  },
  {
    key: "超過時間単価",
    label: "超過時間単価",
    description: "超過時の時間単価（例: 3500）\n※精算方式が上下割の場合のみ",
    example: "3500",
    category: "contract",
  },
  {
    key: "控除時間単価",
    label: "控除時間単価",
    description: "控除時の時間単価（例: 3000）\n※精算方式が上下割の場合のみ",
    example: "3000",
    category: "contract",
  },
  {
    key: "中間割時間単価",
    label: "中間割時間単価",
    description: "中間割の時間単価（例: 3200）\n※精算方式が中間割の場合のみ",
    example: "3200",
    category: "contract",
  },
  {
    key: "精算方式",
    label: "精算方式",
    description: "精算方式名（上下割/中間割/固定/時間単価）",
    example: "上下割",
    category: "contract",
  },
  {
    key: "税込税抜",
    label: "税込税抜",
    description: "契約の税込/税抜設定（例: 税抜）",
    example: "税抜",
    category: "contract",
  },
  {
    key: "締め日",
    label: "締め日",
    description: "契約の締め日（未設定時は対象月の最終日）（例: 20）",
    example: "20",
    category: "contract",
  },
  // ユーザー情報
  {
    key: "名前",
    label: "名前",
    description: "ログインユーザーの名前（例: 山田太郎）",
    example: "山田太郎",
    category: "user",
  },
  {
    key: "メールアドレス",
    label: "メールアドレス",
    description: "ログインユーザーのメールアドレス（例: example@example.com）",
    example: "example@example.com",
    category: "user",
  },
  {
    key: "郵便番号",
    label: "郵便番号",
    description: "ユーザーの郵便番号（例: 123-4567）",
    example: "123-4567",
    category: "user",
  },
  {
    key: "住所",
    label: "住所",
    description: "ユーザーの住所（例: 東京都渋谷区〇〇1-2-3）",
    example: "東京都渋谷区〇〇1-2-3",
    category: "user",
  },
  {
    key: "銀行名",
    label: "銀行名",
    description: "振込先銀行名（例: 〇〇銀行）",
    example: "〇〇銀行",
    category: "user",
  },
  {
    key: "支店名",
    label: "支店名",
    description: "振込先支店名（例: 〇〇支店）",
    example: "〇〇支店",
    category: "user",
  },
  {
    key: "口座種別",
    label: "口座種別",
    description: "口座種別（例: 普通、当座）",
    example: "普通",
    category: "user",
  },
  {
    key: "口座番号",
    label: "口座番号",
    description: "口座番号（例: 1234567）",
    example: "1234567",
    category: "user",
  },
  {
    key: "口座名義",
    label: "口座名義",
    description: "口座名義（例: ヤマダ タロウ）",
    example: "ヤマダ タロウ",
    category: "user",
  },
  {
    key: "登録番号",
    label: "登録番号",
    description: "適格請求書発行事業者登録番号（例: T1234567890123）",
    example: "T1234567890123",
    category: "user",
  },
  // 請求情報
  {
    key: "基本金額",
    label: "基本金額",
    description:
      "契約の基本金額。精算方式によって異なる。\n固定/上下割/中間割：月単価\n時間単価：稼働時間×時間単価（例: 500000）",
    example: "500000",
    category: "invoice",
  },
  {
    key: "超過時間",
    label: "超過時間",
    description:
      "超過した時間数（例: 5.5）\n※精算方式が上下割または中間割の場合のみ",
    example: "5.5",
    category: "workReport",
  },
  {
    key: "超過金額",
    label: "超過金額",
    description:
      "超過時間 × 超過時間単価（例: 19250）\n※精算方式が上下割または中間割の場合のみ",
    example: "19250",
    category: "invoice",
  },
  {
    key: "控除時間",
    label: "控除時間",
    description:
      "控除された時間数（例: 3.0）\n※精算方式が上下割または中間割の場合のみ",
    example: "3.0",
    category: "workReport",
  },
  {
    key: "控除金額",
    label: "控除金額",
    description:
      "控除時間 × 控除時間単価（例: 9000）\n※精算方式が上下割または中間割の場合のみ",
    example: "9000",
    category: "invoice",
  },
  {
    key: "請求金額（税抜）",
    label: "請求金額（税抜）",
    description: "請求金額（税抜）（例: 510250）",
    example: "510250",
    category: "invoice",
  },
  {
    key: "消費税額",
    label: "消費税額",
    description: "消費税額（例: 51025）",
    example: "51025",
    category: "invoice",
  },
  {
    key: "請求金額（税込）",
    label: "請求金額（税込）",
    description: "請求金額（税込）（例: 561275）",
    example: "561275",
    category: "invoice",
  },
  {
    key: "請求日",
    label: "請求日",
    description: "対象月の締め日の日付（YYYY/MM/DD形式）",
    example: "2025/01/20",
    category: "invoice",
  },
  {
    key: "支払期限",
    label: "支払期限",
    description: "契約の支払いサイトに基づく支払予定日（YYYY/MM/DD形式）",
    example: "2025/02/28",
    category: "invoice",
  },
];

/**
 * プレースホルダーのキー一覧
 */
export const PLACEHOLDER_KEYS = AVAILABLE_PLACEHOLDERS.map((p) => p.key);

/**
 * 日次勤怠カテゴリのプレースホルダーキー一覧
 */
export const DAILY_ATTENDANCE_PLACEHOLDER_KEYS = AVAILABLE_PLACEHOLDERS.filter(
  (p) => p.category === "dailyAttendance",
).map((p) => p.key);

/**
 * カテゴリ別にグループ化されたプレースホルダーを取得
 * @param excludeCategories 除外するカテゴリ
 */
export function getPlaceholdersByCategory(
  excludeCategories?: PlaceholderCategory[],
): Record<PlaceholderCategory, PlaceholderDefinition[]> {
  const categoryOrder: PlaceholderCategory[] = [
    "workReport",
    "dailyAttendance",
    "contract",
    "user",
    "invoice",
  ];

  const filteredCategories = excludeCategories
    ? categoryOrder.filter((c) => !excludeCategories.includes(c))
    : categoryOrder;

  const grouped = filteredCategories.reduce(
    (acc, category) => {
      acc[category] = AVAILABLE_PLACEHOLDERS.filter(
        (p) => p.category === category,
      );
      return acc;
    },
    {} as Record<PlaceholderCategory, PlaceholderDefinition[]>,
  );

  return grouped;
}

/**
 * 請求書用の契約データ
 */
export interface InvoiceContractData {
  contractName: string;
  clientName: string;
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
  excessTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  deductionTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  closingDay: number | null;
  paymentMonthOffset: number;
  paymentDay: number | null;
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
 * 支払期限を計算（契約の支払いサイトに基づく）
 */
function calculatePaymentDeadline(
  invoiceDate: Date,
  paymentMonthOffset: number,
  paymentDay: number | null,
): Date {
  return calculatePaymentDate(
    invoiceDate,
    null,
    paymentMonthOffset,
    paymentDay,
  );
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
): Record<string, string | number> {
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
  const basePlaceholders: Record<string, string | number> = {
    対象年: data.targetDate.getFullYear(),
    対象月: data.targetDate.getMonth() + 1,
    名前: data.userName,
    メールアドレス: data.email ?? "",
    基本開始時刻: formatTimeString(data.basicStartTime),
    基本終了時刻: formatTimeString(data.basicEndTime),
    基本休憩時間: data.basicBreakDuration
      ? formatMinutesToTimeString(data.basicBreakDuration)
      : "",
    "1日あたりの作業単位": data.dailyWorkMinutes ?? "",
    "1ヶ月あたりの作業単位": data.monthlyWorkMinutes ?? "",
    備考: data.remarks ?? "",
    総稼働時間: formatMinutesToTimeString(totalWorkMinutes),
    基本稼働時間:
      basicWorkMinutes !== null
        ? formatMinutesToTimeString(basicWorkMinutes)
        : "",
    稼働日数: workingDays,
    // ユーザー情報
    郵便番号: data.postalCode ?? "",
    住所: data.address ?? "",
    銀行名: data.bankName ?? "",
    支店名: data.bankBranchName ?? "",
    口座種別: data.bankAccountType ?? "",
    口座番号: data.bankAccountNumber ?? "",
    口座名義: data.bankAccountHolder ?? "",
    登録番号: data.invoiceRegistrationNumber ?? "",
  };

  // 契約データがない場合は基本プレースホルダーのみ返す
  if (!contractData) {
    return basePlaceholders;
  }

  // 請求書用プレースホルダーを追加
  const invoicePlaceholders: Record<string, string | number> = {
    契約名: contractData.contractName,
    クライアント名: contractData.clientName,
    月単価: contractData.unitPrice ?? "",
    時間単価: contractData.hourlyRate ?? "",
    精算下限: contractData.settlementMin ?? "",
    精算上限: contractData.settlementMax ?? "",
    超過時間単価: contractData.upperRate ?? "",
    控除時間単価: contractData.lowerRate ?? "",
    中間割時間単価: contractData.middleRate ?? "",
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
    excessTaxRoundingType: contractData.excessTaxRoundingType,
    deductionTaxRoundingType: contractData.deductionTaxRoundingType,
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
      基本金額: Math.round(amountDetails.baseAmount),
      超過時間: amountDetails.excessInfo.hours,
      超過金額: Math.round(amountDetails.excessInfo.amount),
      控除時間: amountDetails.deductionInfo.hours,
      控除金額: Math.round(amountDetails.deductionInfo.amount),
      "請求金額（税抜）": Math.round(subtotal),
      消費税額: taxAmount,
      "請求金額（税込）": Math.round(totalAmount),
    });
  } else {
    // 計算できない場合は空文字
    Object.assign(invoicePlaceholders, {
      基本金額: "",
      超過時間: "",
      超過金額: "",
      控除時間: "",
      控除金額: "",
      "請求金額（税抜）": "",
      消費税額: "",
      "請求金額（税込）": "",
    });
  }

  // 日付関連
  const invoiceDate = calculateInvoiceDate(
    data.targetDate,
    contractData.closingDay,
  );
  const paymentDeadline = calculatePaymentDeadline(
    invoiceDate,
    contractData.paymentMonthOffset,
    contractData.paymentDay,
  );
  const closingDayValue = contractData.closingDay ?? invoiceDate.getDate();

  Object.assign(invoicePlaceholders, {
    締め日: closingDayValue,
    請求日: formatDateString(invoiceDate),
    支払期限: formatDateString(paymentDeadline),
  });

  return { ...basePlaceholders, ...invoicePlaceholders };
}

/**
 * テンプレート文字列内のプレースホルダーを置換する
 * 日本語のキーにも対応（例: ${名前}）
 * @param template テンプレート文字列
 * @param values プレースホルダー値のマップ
 * @param excludeKeys 置換を除外するキー一覧（指定されたキーはそのまま残す）
 */
export function replacePlaceholders(
  template: string,
  values: Record<string, string | number>,
  excludeKeys?: string[],
): string {
  // 日本語キーも含むプレースホルダーパターン
  return template.replace(/\${([^}]+)}/g, (match, key: string) => {
    // 除外キーに含まれる場合はそのまま返す
    if (excludeKeys?.includes(key)) {
      return match;
    }
    if (key in values) {
      return String(values[key]);
    }
    return match;
  });
}

/**
 * テンプレートが単一プレースホルダーかどうかを判定
 * @param template テンプレート文字列
 * @returns 単一プレースホルダーの場合はそのキー、複合の場合はnull
 */
export function extractSinglePlaceholder(template: string): string | null {
  const trimmed = template.trim();
  const match = /^\$\{([^}]+)\}$/.exec(trimmed);
  return match ? match[1] : null;
}

/**
 * プレースホルダーを解決し、適切な型の値を返す
 * 値が数値に変換可能な場合は自動的に数値として返す
 * @param template 値テンプレート
 * @param placeholderValues プレースホルダー値のマップ
 * @returns 解決された値(数値または文字列)
 */
export function resolvePlaceholderValue(
  template: string,
  placeholderValues: Record<string, string | number>,
): string | number {
  const replaced = replacePlaceholders(template, placeholderValues);

  // 既に数値なら数値として返す
  if (typeof replaced === "number") {
    return replaced;
  }

  // 空文字列はそのまま返す
  if (replaced === "") {
    return "";
  }

  // 文字列の場合、数値に変換可能なら数値として返す
  const trimmed = replaced.trim();
  // trim後が空文字列の場合は空文字列を返す（Number("")が0になる問題を回避）
  if (trimmed === "") {
    return "";
  }
  const num = Number(trimmed);
  if (!isNaN(num) && isFinite(num)) {
    return num;
  }

  return replaced;
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
