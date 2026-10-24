import { sanitizeInternalPath } from "@/utils/url/sanitize-internal-path";

/**
 * freee OAuth の結果を一度だけ画面に伝えるためのフラッシュ Cookie
 *
 * コールバック後のリダイレクト先URLにクエリを付けると、クライアント側で
 * history.replaceState による書き換えが必要になるため、Cookie で受け渡す。
 */
export const FREEE_OAUTH_RESULT_COOKIE = "freee_oauth_result";

export const FREEE_OAUTH_RESULTS = ["connected", "denied", "failed"] as const;

export type FreeeOAuthResult = (typeof FREEE_OAUTH_RESULTS)[number];

export const isFreeeOAuthResult = (
  value: string | undefined,
): value is FreeeOAuthResult =>
  FREEE_OAUTH_RESULTS.some((result) => result === value);

export const freeeOAuthResultCookieOptions = {
  httpOnly: true,
  secure: process.env.VERCEL_ENV === "production",
  sameSite: "lax",
  maxAge: 60, // 戻り先の表示までに読まれる想定なので短く
  path: "/",
} as const;

/**
 * OAuth 完了後の戻り先として安全なアプリ内パスに正規化する
 */
export const sanitizeReturnTo = (value: string | null | undefined): string =>
  sanitizeInternalPath(value);
