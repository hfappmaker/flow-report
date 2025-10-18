import { Metadata } from "next";

import SettingsForm from "./page.client";

export const metadata: Metadata = {
  title: "設定",
  description: "設定",
};

export default function SettingsPage() {
  return <SettingsForm />;
}
