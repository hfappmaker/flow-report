/**
 * mailto URLを構築（複数宛先・CC対応）
 * RFC 6068準拠: mailto:a@example.com,b@example.com?cc=c@example.com&subject=...
 * @param params mailto URL構築パラメータ
 * @returns 構築されたmailto URL
 */
export function buildMailtoUrl(params: {
  recipients: string[];
  ccRecipients?: string[];
  subject: string;
  body: string;
}): string {
  const encodedSubject = encodeURIComponent(params.subject);
  const encodedBody = encodeURIComponent(params.body);

  // RFC 6068: 複数宛先はカンマ区切り
  const toAddresses = params.recipients.join(",");

  let url = `mailto:${toAddresses}?subject=${encodedSubject}&body=${encodedBody}`;

  // CCがある場合は追加
  if (params.ccRecipients && params.ccRecipients.length > 0) {
    const ccAddresses = params.ccRecipients.join(",");
    url += `&cc=${ccAddresses}`;
  }

  return url;
}

/**
 * テンプレートから生成された件名・本文でmailto URLを構築
 * @param params メール送信パラメータ
 * @returns 構築されたmailto URL
 */
export function buildMailtoUrlFromTemplate(params: {
  toAddresses: string[];
  ccAddresses?: string[];
  subject: string;
  body: string;
}): string {
  return buildMailtoUrl({
    recipients: params.toAddresses,
    ccRecipients: params.ccAddresses,
    subject: params.subject,
    body: params.body,
  });
}
