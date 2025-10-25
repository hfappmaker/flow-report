"use server";

import { currentUser } from "@/features/auth/lib/auth";
import {
  deleteFreeeToken,
  getFreeeToken,
  isFreeeConnected,
} from "@/features/freee/repositories/freee-token-repository";

/**
 * freee連携情報
 */
export interface FreeeConnectionInfo {
  companyId: number;
  expiresAt: number;
  scope: string;
}

/**
 * freee連携状態確認結果
 */
export interface FreeeConnectionStatusResult {
  connected: boolean;
}

/**
 * freee連携情報取得結果
 */
export interface FreeeConnectionInfoResult {
  success: boolean;
  data?: FreeeConnectionInfo;
  message: string;
}

/**
 * freee連携解除結果
 */
export interface DisconnectFreeeResult {
  success: boolean;
  message: string;
}

/**
 * freee連携状態を確認
 */
export async function checkFreeeConnectionAction(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return false;
    }

    const connected = await isFreeeConnected(user.id);
    return connected;
  } catch (error) {
    console.error("Failed to check freee connection:", error);
    return false;
  }
}

/**
 * freee連携情報を取得
 */
export async function getFreeeConnectionInfoAction(): Promise<FreeeConnectionInfoResult> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return {
        success: false,
        message: "認証が必要です",
      };
    }

    const tokenData = await getFreeeToken(user.id);
    if (!tokenData) {
      return {
        success: false,
        message: "freeeとの連携が必要です",
      };
    }

    return {
      success: true,
      data: {
        companyId: tokenData.companyId,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope,
      },
      message: "freee連携情報を取得しました",
    };
  } catch (error) {
    console.error("Failed to get freee connection info:", error);
    const errorMessage =
      error instanceof Error ? error.message : "連携情報の取得に失敗しました";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * freee連携を解除
 */
export async function disconnectFreeeAction(): Promise<DisconnectFreeeResult> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return {
        success: false,
        message: "認証が必要です",
      };
    }

    await deleteFreeeToken(user.id);

    return {
      success: true,
      message: "freee連携を解除しました",
    };
  } catch (error) {
    console.error("Failed to disconnect freee:", error);
    const errorMessage =
      error instanceof Error ? error.message : "連携解除に失敗しました";
    return {
      success: false,
      message: errorMessage,
    };
  }
}
