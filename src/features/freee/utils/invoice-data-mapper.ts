import {
  calculateTotalWorkMinutes,
  calculateWorkAmountDetailed,
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
  unitPrice: number | null;
  settlementMin: number | null;
  settlementMax: number | null;
  upperRate: number | null;
  lowerRate: number | null;
  middleRate: number | null;
  hourlyRate: number | null;
  taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
  taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  rateType: "upperLower" | "middle" | "fixed" | "hourlyRate";
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

  const amountDetail = calculateWorkAmountDetailed(totalWorkMinutes, {
    unitPrice: workReportData.unitPrice,
    settlementMin: workReportData.settlementMin,
    settlementMax: workReportData.settlementMax,
    upperRate: workReportData.upperRate,
    lowerRate: workReportData.lowerRate,
    middleRate: workReportData.middleRate,
    hourlyRate: workReportData.hourlyRate,
    taxInclusiveType: workReportData.taxInclusiveType,
    taxRoundingType: workReportData.taxRoundingType,
    rateType: workReportData.rateType,
  });

  if (!amountDetail) {
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
    amountDetail.taxInclusiveType === "INCLUSIVE" ? "in" : "out";

  // 消費税端数処理のマッピング
  const taxFraction = mapTaxRounding(amountDetail.taxRoundingType);

  // 明細作成
  const lines: FreeeInvoiceLine[] = [];

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const baseAmountStr = amountDetail.baseAmount.toLocaleString();
  const excessRateStr = amountDetail.excessInfo.rate.toLocaleString();
  const deductionRateStr = amountDetail.deductionInfo.rate.toLocaleString();

  // 基本単価明細
  // amountDetail.baseAmountは契約の基本単価（税込または税抜）
  lines.push({
    type: "item",
    description: `${String(year)}年${String(month)}月度 ${contractName} 基本単価（@${baseAmountStr}円）`,
    sales_date: issueDate,
    unit: "点",
    quantity: 1,
    unit_price: amountDetail.baseAmount.toFixed(3),
    tax_rate: 10,
    reduced_tax_rate: false,
  });

  // 超過単価明細（常に追加、0時間の場合もあり）
  lines.push({
    type: "item",
    description: `${String(year)}年${String(month)}月度 ${contractName} 超過単価（@${excessRateStr}円/h）`,
    sales_date: issueDate,
    unit: "時間",
    quantity: Math.round(amountDetail.excessInfo.hours * 100) / 100, // 小数点2桁
    unit_price: amountDetail.excessInfo.rate.toFixed(3),
    tax_rate: 10,
    reduced_tax_rate: false,
  });

  // 控除単価明細（常に追加、0時間の場合もあり、マイナス金額）
  lines.push({
    type: "item",
    description: `${String(year)}年${String(month)}月度 ${contractName} 控除単価（@${deductionRateStr}円/h）`,
    sales_date: issueDate,
    unit: "時間",
    quantity: Math.round(amountDetail.deductionInfo.hours * 100) / 100, // 小数点2桁
    unit_price: (-amountDetail.deductionInfo.rate).toFixed(3), // マイナス値
    tax_rate: 10,
    reduced_tax_rate: false,
  });

  const invoiceRequest: FreeeInvoiceCreateRequest = {
    company_id: companyId,
    partner_id: partnerId,
    billing_date: billingDate,
    issue_date: issueDate,
    payment_date: paymentDate,
    subject:
      options?.subject ?? `${String(year)}年${String(month)}月度 ${contractName}`,
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
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  return `${String(year)}年${String(month)}月度 ${contractName}`;
}
