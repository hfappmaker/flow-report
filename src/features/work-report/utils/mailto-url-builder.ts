import { formatWorkReportEmailSubject } from "./date-formatting";
import { buildWorkReportEmailBody } from "./email-body-builder";

/**
 * mailto URLを構築
 * @param params mailto URL構築パラメータ
 * @returns 構築されたmailto URL
 */
export function buildMailtoUrl(params: {
  recipient: string;
  subject: string;
  body: string;
}): string {
  const encodedSubject = encodeURIComponent(params.subject);
  const encodedBody = encodeURIComponent(params.body);
  return `mailto:${params.recipient}?subject=${encodedSubject}&body=${encodedBody}`;
}

/**
 * 作業報告書送付用のmailto URLを構築
 * @param params 作業報告書メールパラメータ
 * @returns 構築されたmailto URL
 */
export function buildWorkReportMailtoUrl(params: {
  clientEmail: string;
  contactName: string | null;
  clientName: string;
  userName: string;
  targetDate: Date;
}): string {
  const subject = formatWorkReportEmailSubject(
    params.targetDate,
    params.userName,
  );
  const body = buildWorkReportEmailBody({
    contactName: params.contactName,
    clientName: params.clientName,
    userName: params.userName,
    targetDate: params.targetDate,
  });

  return buildMailtoUrl({
    recipient: params.clientEmail,
    subject,
    body,
  });
}
