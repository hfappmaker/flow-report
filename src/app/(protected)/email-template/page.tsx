import { Metadata } from "next";
import { notFound } from "next/navigation";

import { currentUser } from "@/features/auth/libs/auth";

export const metadata: Metadata = {
  title: "メールテンプレート",
  description: "メールテンプレート",
};

export default async function EmailTemplatePage() {
  const user = await currentUser();
  if (!user?.id) {
    return notFound();
  }

  return notFound();
  // return <EmailTemplateClientPage userId={user.id} />;
}
