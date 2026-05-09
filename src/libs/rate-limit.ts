import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis に接続するための環境変数 (Vercel Marketplace 統合で自動セット)
//   KV_REST_API_URL
//   KV_REST_API_TOKEN
const isConfigured = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const redis = isConfigured
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

const createRatelimit = (tokens: number, window: `${number} ${"s" | "m"}`) =>
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(tokens, window),
        analytics: true,
        prefix: "ratelimit",
      })
    : null;

// アクション別の制限値。本番運用で調整
const limits = {
  register: createRatelimit(5, "10 m"), // 10分5回まで
  login: createRatelimit(10, "1 m"), // 1分10回まで
  passwordReset: createRatelimit(3, "10 m"), // 10分3回まで
} as const;

export type RateLimitKind = keyof typeof limits;

/**
 * Upstash Redis を使ったレート制限。
 * 環境変数が未設定（ローカルなど）の場合は常に成功扱いにしてスルーする。
 *
 * @param kind 用途
 * @param identifier 識別子。通常はIPアドレスやメールアドレス
 */
export const checkRateLimit = async (
  kind: RateLimitKind,
  identifier: string,
): Promise<{ success: boolean; reset: number }> => {
  const limiter = limits[kind];
  if (!limiter) {
    return { success: true, reset: 0 };
  }

  const result = await limiter.limit(`${kind}:${identifier}`);
  return { success: result.success, reset: result.reset };
};
