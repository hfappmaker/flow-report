"use server";

import axios from "axios";

import { currentUser } from "@/features/auth/lib/auth";
import { getFreeePartners } from "@/features/freee/lib/freee-accounting-api-client";
import { getFreeeToken } from "@/features/freee/repositories/freee-token-repository";
import type { FreeePartner } from "@/features/freee/types/freee-accounting-types";

export interface GetFreeePartnersResult {
  success: boolean;
  message: string;
  partners?: FreeePartner[];
  requiresReauth?: boolean;
}

/**
 * freee取引先一覧を取得
 */
export async function getFreeePartnersAction(options?: {
  limit?: number;
  offset?: number;
}): Promise<GetFreeePartnersResult> {
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

    // freee取引先一覧を取得
    const response = await getFreeePartners(
      user.id,
      tokenData.companyId,
      options,
    );

    return {
      success: true,
      message: "取引先一覧を取得しました",
      partners: response.partners,
    };
  } catch (error) {
    console.error("Failed to get freee partners:", error);

    // 403エラーの場合は再認可が必要
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return {
        success: false,
        message: "freee連携の有効期限が切れています。再度連携してください。",
        requiresReauth: true,
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "取引先一覧の取得に失敗しました";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
