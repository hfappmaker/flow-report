/**
 * システムデフォルトメールテンプレートのID
 */
export const DEFAULT_EMAIL_TEMPLATE_ID = "system-default-email";

/**
 * システムデフォルトメールテンプレートの名前
 */
export const DEFAULT_EMAIL_TEMPLATE_NAME = "デフォルトテンプレート";

/**
 * システムデフォルトメールテンプレートの件名
 */
export const DEFAULT_EMAIL_TEMPLATE_SUBJECT =
  "${対象年}年${対象月}月分作業報告書【${名前}】";

/**
 * システムデフォルトメールテンプレートの本文
 */
export const DEFAULT_EMAIL_TEMPLATE_BODY = `\${クライアント名}様

お世話になっております。\${名前}です。

\${対象年}年\${対象月}月の作業報告書を送付いたします。
ご確認のほど、よろしくお願いいたします。`;

/**
 * デフォルトテンプレートかどうかを判定
 */
export function isDefaultEmailTemplate(id: string): boolean {
  return id === DEFAULT_EMAIL_TEMPLATE_ID;
}
