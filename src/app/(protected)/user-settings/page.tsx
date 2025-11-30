import { Metadata } from "next";

import { UserSettingsForm } from "@/features/user-settings/components/user-settings-form";

export const metadata: Metadata = {
  title: "ユーザー設定",
  description: "ユーザー設定",
};

export default function UserSettingsPage() {
  return <UserSettingsForm />;
}
