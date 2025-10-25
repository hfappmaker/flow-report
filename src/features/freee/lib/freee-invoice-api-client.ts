import axios from "axios";

import { getValidAccessToken } from "@/features/freee/lib/freee-oauth";
import type {
  FreeeInvoiceCreateRequest,
  FreeeInvoiceCreateResponse,
} from "@/features/freee/types/freee-invoice-types";
import { extractFreeeErrorMessage } from "@/features/freee/utils/freee-api-util";

/**
 * freee 請求書を作成
 */
export async function createFreeeInvoice(
  userId: string,
  invoiceData: FreeeInvoiceCreateRequest,
): Promise<FreeeInvoiceCreateResponse> {
  try {
    const accessToken = await getValidAccessToken(userId);

    const response = await axios.post<FreeeInvoiceCreateResponse>(
      `${process.env.FREEE_INVOICE_API_BASE_URL}/invoices`,
      invoiceData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    const message = extractFreeeErrorMessage(error);
    console.error("freee invoice creation error:", error);
    throw new Error(`freee請求書の作成に失敗しました: ${message}`);
  }
}

/**
 * freee 請求書を取得
 */
export async function getFreeeInvoice(
  userId: string,
  companyId: number,
  invoiceId: number,
): Promise<FreeeInvoiceCreateResponse> {
  try {
    const accessToken = await getValidAccessToken(userId);

    const response = await axios.get<FreeeInvoiceCreateResponse>(
      `${process.env.FREEE_INVOICE_API_BASE_URL}/invoices/${invoiceId}`,
      {
        params: { company_id: companyId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    const message = extractFreeeErrorMessage(error);
    console.error("freee invoice get error:", error);
    throw new Error(`freee請求書の取得に失敗しました: ${message}`);
  }
}

/**
 * freee 請求書のWeb公開URLを取得
 */
export function getFreeeInvoiceWebUrl(
  companyId: number,
  invoiceId: number,
): string {
  return `https://secure.freee.co.jp/invoices/${companyId}/invoices/${invoiceId}`;
}
