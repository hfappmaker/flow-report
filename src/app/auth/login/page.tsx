import LoginPage from "./page.client";
import TestLoginPage from "./test-page.client";

export const metadata = {
  title: "ログイン",
};

export default function LoginPageServer() {
  console.log("Current LOCAL_NODE_ENV:", process.env.LOCAL_NODE_ENV);

  if (process.env.LOCAL_NODE_ENV === 'test') {
    // テスト環境用の処理
    return <TestLoginPage/>;
  } else {
    // 通常環境用の処理
    return <LoginPage/>;
  }
}
