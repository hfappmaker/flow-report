import { Metadata } from "next";

import { getUserSettings } from "@/features/user-settings/actions/update-user-settings";
import { UserSettingsForm } from "@/features/user-settings/components/user-settings-form";

export const metadata: Metadata = {
  title: "ユーザー情報",
  description: "ユーザー情報",
};

export default async function UserSettingsPage() {
  const settings = await getUserSettings();

  return <UserSettingsForm initialSettings={settings} />;
}
