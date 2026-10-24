const INTERNAL_ORIGIN = "http://internal.invalid";

/**
 * リダイレクト先として安全なアプリ内パスだけを通す
 *
 * "//evil.example" や "https://..." のような外部URLへのオープンリダイレクトを防ぐ。
 * 文字列判定だけだと "/\t/evil.example" のように URL パーサーが制御文字を
 * 取り除いた結果 "//evil.example" になるケースを見逃すため、実際にパースして
 * 同一オリジンに留まるかで判定する。不正な値の場合は fallback を返す。
 */
export const sanitizeInternalPath = (
  value: string | null | undefined,
  fallback = "/",
): string => {
  // eslint-disable-next-line no-control-regex
  if (!value?.startsWith("/") || /[\u0000- \u007f\\]/.test(value)) {
    return fallback;
  }
  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) {
      return fallback;
    }
    const result = `${url.pathname}${url.search}${url.hash}`;
    // "/.//evil.example" のようにドットセグメントの正規化で "//" 始まりになる値も拒否する
    if (result.startsWith("//")) {
      return fallback;
    }
    return result;
  } catch {
    return fallback;
  }
};
