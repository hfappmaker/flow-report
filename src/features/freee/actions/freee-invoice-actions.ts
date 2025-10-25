"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { getContractById } from "@/features/contract/repositories/contract-repository";
import {
  createFreeeInvoice,
  getFreeeInvoiceWebUrl,
} from "@/features/freee/lib/freee-invoice-api-client";
import { getFreeeToken } from "@/features/freee/repositories/freee-token-repository";
import { mapWorkReportToFreeeInvoice } from "@/features/freee/utils/invoice-data-mapper";
import { getWorkReportById } from "@/features/work-report/repositories/work-report-repository";

export interface CreateFreeeInvoiceOptions {
  billingDate?: string; // 請求日 YYYY-MM-DD
  issueDate?: string; // 発行日 YYYY-MM-DD
  paymentDate?: string; // 支払期限 YYYY-MM-DD
  subject?: string; // 件名
  invoiceNote?: string; // 備考
  partnerTitle?: string; // 敬称
}

export interface CreateFreeeInvoiceResult {
  success: boolean;
  message: string;
  invoiceId?: number;
  invoiceUrl?: string;
}

/**
 * 作業報告書からfreee請求書を作成
 */
export async function createFreeeInvoiceFromWorkReportAction(
  workReportId: string,
  templateId: number,
  options?: CreateFreeeInvoiceOptions,
): Promise<CreateFreeeInvoiceResult> {
  try {
    // ユーザー認証確認
    const user = await currentUser();
    if (!user?.id) {
      return {
        success: false,
        message: "認証が必要です",
      };
    }

    // freee連携確認
    const tokenData = await getFreeeToken(user.id);
    if (!tokenData) {
      return {
        success: false,
        message: "freeeとの連携が必要です",
      };
    }

    // 作業報告書データを取得
    const workReport = await getWorkReportById(workReportId);
    if (!workReport) {
      return {
        success: false,
        message: "作業報告書が見つかりません",
      };
    }

    // 契約情報を取得
    const contract = await getContractById(workReport.contractId);
    if (!contract) {
      return {
        success: false,
        message: "契約情報が見つかりません",
      };
    }

    // 作業報告書データをfreee請求書データに変換
    const invoiceRequest = mapWorkReportToFreeeInvoice(
      tokenData.companyId,
      templateId,
      {
        targetDate: workReport.targetDate,
        contractName: contract.name,
        clientName: contract.clientName,
        attendances: workReport.attendances,
        unitPrice: contract.unitPrice ? Number(contract.unitPrice) : undefined,
        settlementMin: contract.settlementMin
          ? Number(contract.settlementMin)
          : undefined,
        settlementMax: contract.settlementMax
          ? Number(contract.settlementMax)
          : undefined,
        upperRate: contract.upperRate ? Number(contract.upperRate) : undefined,
        lowerRate: contract.lowerRate ? Number(contract.lowerRate) : undefined,
        middleRate: contract.middleRate
          ? Number(contract.middleRate)
          : undefined,
        taxInclusiveType: contract.taxInclusiveType,
        taxRoundingType: contract.taxRoundingType,
        rateType: contract.rateType,
      },
      options,
    );

    // freee請求書を作成
    const response = await createFreeeInvoice(user.id, invoiceRequest);

    const invoiceUrl = getFreeeInvoiceWebUrl(
      tokenData.companyId,
      response.invoice.id,
    );

    return {
      success: true,
      message: "freee請求書を作成しました",
      invoiceId: response.invoice.id,
      invoiceUrl: invoiceUrl,
    };
  } catch (error) {
    console.error("Failed to create freee invoice:", error);
    const errorMessage =
      error instanceof Error ? error.message : "請求書の作成に失敗しました";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
