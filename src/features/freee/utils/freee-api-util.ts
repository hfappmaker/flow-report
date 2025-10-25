import axios, { AxiosError } from "axios";

import type { FreeeErrorResponse } from "@/features/freee/types/freee-types";

/**
 * freee APIエラーメッセージを抽出
 */
export function extractFreeeErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<FreeeErrorResponse>;
    if (axiosError.response?.data?.errors) {
      const messages = axiosError.response.data.errors.flatMap(
        (err) => err.messages,
      );
      return messages.join(", ");
    }
    return axiosError.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "不明なエラーが発生しました";
}
