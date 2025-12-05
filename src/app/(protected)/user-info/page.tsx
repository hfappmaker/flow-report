import { Metadata } from "next";

import { getUserInfo } from "@/features/user-info/actions/update-user-info";
import { UserInfoForm } from "@/features/user-info/components/user-info-form";

export const metadata: Metadata = {
  title: "ユーザー情報",
  description: "ユーザー情報",
};

export default async function UserInfoPage() {
  const info = await getUserInfo();

  return <UserInfoForm initialInfo={info} />;
}
