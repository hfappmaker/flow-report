import {
  calculateTotalWorkMinutes,
  calculateWorkAmount,
} from "@/features/contract/utils/contract-calculation-utils";
import type {
  FreeeInvoiceCreateRequest,
  FreeeInvoiceLine,
} from "@/features/freee/types/freee-invoice-types";
import type { AttendanceData } from "@/features/work-report/types/attendance";

export interface WorkReportInvoiceData {
  targetDate: Date;
  contractName: string;
  attendances: AttendanceData[];
  unitPrice: number | undefined;
  settlementMin: number | undefined;
  settlementMax: number | undefined;
  upperRate: number | undefined;
  lowerRate: number | undefined;
  middleRate: number | undefined;
  taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
  taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  rateType: "upperLower" | "middle";
}

/**
 * 作業報告書データをfreee請求書作成リクエストに変換（freee請求書API仕様）
 */
export function mapWorkReportToFreeeInvoice(
  companyId: number,
  partnerId: number,
  workReportData: WorkReportInvoiceData,
  options?: {
    billingDate?: string; // 請求日 YYYY-MM-DD
    issueDate?: string; // 発行日 YYYY-MM-DD
    paymentDate?: string; // 支払期限 YYYY-MM-DD
    subject?: string; // 件名
    invoiceNote?: string; // 備考
    partnerTitle?: string; // 敬称（デフォルト: "御中"）
  },
): FreeeInvoiceCreateRequest {
  const { targetDate, contractName, attendances } = workReportData;

  // 稼働時間と金額を計算
  const totalWorkMinutes = calculateTotalWorkMinutes(attendances);
  const totalWorkHours = totalWorkMinutes / 60;

  const amountCalculation = calculateWorkAmount(totalWorkMinutes, {
    unitPrice: workReportData.unitPrice,
    settlementMin: workReportData.settlementMin,
    settlementMax: workReportData.settlementMax,
    upperRate: workReportData.upperRate,
    lowerRate: workReportData.lowerRate,
    middleRate: workReportData.middleRate,
    taxInclusiveType: workReportData.taxInclusiveType,
    taxRoundingType: workReportData.taxRoundingType,
    rateType: workReportData.rateType,
  });

  if (!amountCalculation) {
    throw new Error("契約情報が不足しているため、請求書を作成できません");
  }

  // 日付設定
  const monthEnd = getLastDayOfMonth(
    targetDate.getFullYear(),
    targetDate.getMonth(),
  );
  const billingDate =
    options?.billingDate ?? monthEnd.toISOString().split("T")[0];
  const issueDate = options?.issueDate ?? monthEnd.toISOString().split("T")[0];

  const nextMonthEnd = getLastDayOfMonth(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
  );
  const paymentDate =
    options?.paymentDate ?? nextMonthEnd.toISOString().split("T")[0];

  // 税処理設定
  const taxEntryMethod =
    workReportData.taxInclusiveType === "INCLUSIVE" ? "in" : "out";

  // 消費税端数処理のマッピング
  const taxFraction = mapTaxRounding(workReportData.taxRoundingType);

  // 明細作成
  const lines: FreeeInvoiceLine[] = [
    {
      type: "item",
      description: `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月度 ${contractName}`,
      sales_date: issueDate,
      unit: "点",
      quantity: 1, // 数値型
      unit_price: amountCalculation.baseAmount.toFixed(3), // 文字列型
      tax_rate: 10, // 標準税率10%
      reduced_tax_rate: false,
    },
  ];

  const invoiceRequest: FreeeInvoiceCreateRequest = {
    company_id: companyId,
    partner_id: partnerId,
    billing_date: billingDate,
    issue_date: issueDate,
    payment_date: paymentDate,
    subject:
      options?.subject ??
      `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月度 ${contractName}`,
    tax_entry_method: taxEntryMethod,
    tax_fraction: taxFraction,
    line_amount_fraction: "round_up", // 明細金額は切り上げ
    withholding_tax_entry_method: "in", // 源泉徴収なし
    partner_title: options?.partnerTitle ?? "御中",
    invoice_note: options?.invoiceNote,
    lines: lines,
  };

  return invoiceRequest;
}

/**
 * 税端数処理のマッピング
 */
function mapTaxRounding(
  taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND",
): "omit" | "roundoff" | "cut_up" {
  switch (taxRoundingType) {
    case "ROUND_DOWN":
      return "omit"; // 切り捨て
    case "ROUND_UP":
      return "cut_up"; // 切り上げ
    case "ROUND":
      return "roundoff"; // 四捨五入
    default:
      return "omit";
  }
}

/**
 * 月の最終日を取得
 */
function getLastDayOfMonth(year: number, month: number): Date {
  // monthは0始まり（0=1月, 11=12月）
  // 翌月の0日目 = 今月の最終日
  return new Date(year, month + 1, 0);
}

/**
 * 請求書タイトルを生成
 */
export function generateInvoiceTitle(
  targetDate: Date,
  contractName: string,
): string {
  return `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月度 ${contractName}`;
}
