"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { getContractById } from "@/features/contract/repositories/contract-repository";
import {
  createFreeeInvoice,
  getFreeeInvoiceWebUrl,
} from "@/features/freee/lib/freee-invoice-api-client";
import { getFreeeToken } from "@/features/freee/repositories/freee-token-repository";
import { mapWorkReportToFreeeInvoice } from "@/features/freee/utils/invoice-data-mapper";
import { getAttendancesByWorkReportId } from "@/features/work-report/repositories/attendance-repository";
import { getWorkReportById } from "@/features/work-report/repositories/work-report-repository";
import axios from "axios";

export interface CreateFreeeInvoiceOptions {
  billingDate?: string; // 請求日 YYYY-MM-DD
  issueDate?: string; // 発行日 YYYY-MM-DD
  paymentDate?: string; // 支払期限 YYYY-MM-DD
  subject?: string; // 件名
  invoiceNote?: string; // 備考
  partnerTitle?: string; // 敬称
  partnerId?: number; // 取引先ID（非推奨: 直接パラメータとして渡すことを推奨）
}

export interface CreateFreeeInvoiceResult {
  success: boolean;
  message: string;
  invoiceId?: number;
  invoiceUrl?: string;
  requiresReauth?: boolean;
}

/**
 * 作業報告書からfreee請求書を作成
 */
export async function createFreeeInvoiceFromWorkReportAction(
  workReportId: string,
  partnerId: number,
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

    const attendances = await getAttendancesByWorkReportId(workReportId);

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
      partnerId,
      {
        targetDate: workReport.targetDate,
        contractName: contract.name,
        attendances: attendances,
        unitPrice: contract.unitPrice ? Number(contract.unitPrice) : null,
        settlementMin: contract.settlementMin
          ? Number(contract.settlementMin)
          : null,
        settlementMax: contract.settlementMax
          ? Number(contract.settlementMax)
          : null,
        upperRate: contract.upperRate ? Number(contract.upperRate) : null,
        lowerRate: contract.lowerRate ? Number(contract.lowerRate) : null,
        middleRate: contract.middleRate
          ? Number(contract.middleRate)
          : null,
        taxInclusiveType: contract.taxInclusiveType,
        taxRoundingType: contract.taxRoundingType,
        rateType: contract.rateType,
      },
      options,
    );

    // freee請求書を作成
    const response = await createFreeeInvoice(user.id, invoiceRequest);

    const invoiceUrl = getFreeeInvoiceWebUrl(response.invoice.id);

    return {
      success: true,
      message: "freee請求書を作成しました",
      invoiceId: response.invoice.id,
      invoiceUrl: invoiceUrl,
    };
  } catch (error) {
    console.error("Failed to create freee invoice:", error);

    // 403 or 401エラーの場合は再認可が必要
    if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401)) {
      return {
        success: false,
        message: "freee連携の有効期限が切れています。再度連携してください。",
        requiresReauth: true,
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "請求書の作成に失敗しました";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
