import axios from "axios";

import { getValidAccessToken } from "@/features/freee/libs/freee-oauth";
import type { FreeePartnersResponse } from "@/features/freee/types/freee-accounting-types";

/**
 * freee 取引先一覧を取得
 */
export async function getFreeePartners(
  userId: string,
  companyId: number,
  options?: {
    limit?: number; // 最大3000
    offset?: number;
  },
): Promise<FreeePartnersResponse> {
  const accessToken = await getValidAccessToken(userId);

  const response = await axios.get<FreeePartnersResponse>(
    `${process.env.FREEE_ACCOUNTING_API_BASE_URL}/partners`,
    {
      params: {
        company_id: companyId,
        limit: options?.limit,
        offset: options?.offset,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}
