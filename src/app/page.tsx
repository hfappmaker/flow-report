import { redirect } from "next/navigation";
import { currentUser } from "@/features/auth/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";

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
