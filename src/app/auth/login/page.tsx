import { TestLoginPage } from "./test-page.client";
import { LoginPage } from "./page.client";

export const metadata = {
  title: "ログイン",
};

export default function LoginPage() {
  if (process.env.NODE_ENV === "test") {
    // テスト環境用の処理
    return <TestLoginPage/>;
  } else {
    // 通常環境用の処理
    return <LoginPage/>;
  }
}
