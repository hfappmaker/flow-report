/**
 * リダイレクト先として安全なアプリ内パスだけを通す
 *
 * "//evil.example" や "https://..." のような外部URLへのオープンリダイレクトを防ぐ。
 * 不正な値の場合は fallback を返す。
 */
export const sanitizeInternalPath = (
  value: string | null | undefined,
  fallback = "/",
): string => {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  return value;
};
