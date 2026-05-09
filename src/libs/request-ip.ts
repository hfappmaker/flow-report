import { headers } from "next/headers";

/**
 * リクエストヘッダから接続元IPアドレスを取得する。
 * Vercel上では x-forwarded-for が複数値（カンマ区切り）の場合があるため先頭を採用。
 * 取得できない場合は "unknown" を返す。
 */
export const getRequestIp = async (): Promise<string> => {
  const headersList = await headers();

  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
};
