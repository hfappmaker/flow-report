// API レスポンス型定義

// 基本エラーレスポンス
export type ErrorResponse = {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

// ページネーション付きレスポンス
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}