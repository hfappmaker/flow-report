import { Resend } from "resend";
import { getAppUrl } from "@/utils/get-app-url";

const resend = new Resend(process.env.RESEND_API_KEY);

const SERVICE_NAME = "Flow Report";
const SERVICE_URL = "https://about.flowreport.flowtech.co.jp";

// 送信元アドレス（環境変数で指定。例: "Flow Report <noreply@flowreport.flowtech.co.jp>"）
const getFromAddress = () => {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL が設定されていません。送信元メールアドレスを環境変数で指定してください。",
    );
  }
  return from;
};

// 環境に応じてアプリケーションURLを取得する
const getDomain = () => {
  try {
    return getAppUrl();
  } catch (error) {
    console.error("Failed to get application URL, using fallback:", error);
    return "http://localhost:3000";
  }
};

const renderEmailBody = (innerHtml: string) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6;">
  <p>${SERVICE_NAME} をご利用いただきありがとうございます。</p>
  ${innerHtml}
  <hr style="border:none; border-top:1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #6b7280;">
    本メールは ${SERVICE_NAME} (<a href="${SERVICE_URL}">${SERVICE_URL}</a>) から自動送信されています。<br />
    心当たりがない場合は、このメールを破棄してください。
  </p>
</div>
`;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: `【${SERVICE_NAME}】2要素認証コードのお知らせ`,
    html: renderEmailBody(`
      <p>${SERVICE_NAME} へのログイン用2要素認証コードです。</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${token}</p>
      <p>このコードはまもなく無効になります。ログイン画面に入力して認証を完了してください。</p>
    `),
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const domain = getDomain();
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: `【${SERVICE_NAME}】パスワード再設定のご案内`,
    html: renderEmailBody(`
      <p>${SERVICE_NAME} のパスワード再設定リクエストを受け付けました。</p>
      <p>下記のリンクから新しいパスワードを設定してください。</p>
      <p><a href="${resetLink}">パスワードを再設定する</a></p>
      <p>このリクエストに心当たりがない場合は、このメールを破棄してください。アカウントは安全な状態のままです。</p>
    `),
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const domain = getDomain();
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: `【${SERVICE_NAME}】メールアドレスの確認のお願い`,
    html: renderEmailBody(`
      <p>${SERVICE_NAME} へのご登録ありがとうございます。</p>
      <p>下記のリンクをクリックしてメールアドレスの確認を完了してください。確認が完了すると、${SERVICE_NAME} にログインできるようになります。</p>
      <p><a href="${confirmLink}">メールアドレスを確認する</a></p>
    `),
  });
};
