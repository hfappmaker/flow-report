import { redirect } from "next/navigation";

import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";
import { currentUser } from "@/features/auth/libs/auth";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    // 認証済みユーザーはダッシュボードにリダイレクト
    redirect(DEFAULT_LOGIN_REDIRECT);
  } else {
    // 未認証ユーザーはログインページにリダイレクト
    redirect("/auth/login");
  }
}
