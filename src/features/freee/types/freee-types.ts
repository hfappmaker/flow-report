/**
 * freee API関連の汎用型定義
 */

/**
 * OAuth トークンレスポンス
 */
export interface FreeeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // 秒数
  refresh_token: string;
  scope: string;
  created_at: number; // UNIXタイムスタンプ
  company_id: number; // 事業所ID
}

/**
 * 保存されたfreeeトークン情報
 */
export interface FreeeTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // UNIXタイムスタンプ
  companyId: number;
  scope: string;
}

/**
 * freee 事業所情報
 */
export interface FreeeCompany {
  id: number;
  name: string;
  name_kana: string;
  display_name: string;
  role: "admin" | "simple_accounting" | "self_only" | "read_only";
}

/**
 * freee エラーレスポンス
 */
export interface FreeeErrorResponse {
  status_code: number;
  errors: {
    type: string;
    messages: string[];
  }[];
}
