import LoginPage from "./page.client";
import TestLoginPage from "./test-page.client";

export const metadata = {
  title: "ログイン",
};

export default function LoginPageServer() {
  if (process.env.VERCEL_TARGET_ENV === 'production') {
    // 本番環境用の処理
    return <LoginPage/>;
  } else {
    // 通常環境用の処理

    return (<>
      <TestLoginPage/>
      <LoginPage/>
    </>);
  }
}
