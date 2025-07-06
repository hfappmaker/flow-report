import { NextResponse } from 'next/server';

import { ErrorResponse, PaginatedResponse } from '@/types/api';

/**
 * エラーレスポンスを作成
 * @param message エラーメッセージ
 * @param status HTTPステータスコード
 * @param errors 詳細エラー情報（オプション）
 * @returns NextResponse
 */
export function createErrorResponse(
  message: string,
  status: number,
  errors?: { field: string; message: string }[]
): NextResponse {
  const error: ErrorResponse = { message, errors };
  return NextResponse.json(error, { status });
}

/**
 * ページネーション付きレスポンスを作成
 * @param data データ配列
 * @param page 現在のページ番号
 * @param limit ページサイズ
 * @param total 総データ数
 * @returns NextResponse
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
  return NextResponse.json(response);
}