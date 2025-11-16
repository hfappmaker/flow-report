import { formatWorkReportEmailMonth } from "./date-formatting";

/**
 * メール受信者名を解決（担当者名が存在する場合は優先、なければクライアント名）
 * @param contactName 担当者名
 * @param clientName クライアント名
 * @returns 受信者名（敬称なし）
 */
export function resolveRecipientName(
  contactName: string | null,
  clientName: string,
): string {
  return contactName ?? clientName;
}

/**
 * 作業報告書送付メール本文を生成
 * @param params メール本文生成に必要なパラメータ
 * @returns 生成されたメール本文
 */
export function buildWorkReportEmailBody(params: {
  contactName: string | null;
  clientName: string;
  userName: string;
  targetDate: Date;
}): string {
  const recipientName = resolveRecipientName(
    params.contactName,
    params.clientName,
  );
  const monthText = formatWorkReportEmailMonth(params.targetDate);

  return `
${recipientName}様

お世話になっております。${params.userName}です。

${monthText}の作業報告書を送付いたします。
ご確認のほど、よろしくお願いいたします。
`;
}
