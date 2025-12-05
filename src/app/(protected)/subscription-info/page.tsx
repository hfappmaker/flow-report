import { Metadata } from "next";
import { notFound } from "next/navigation";

import SubscriptionInfoClientPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";
import { getSubscriptionInfoByUserId } from "@/features/subscription/repositories/subscription-repository";

export const metadata: Metadata = {
  title: "サブスクリプション情報",
  description: "サブスクリプション情報",
};

export default async function SubscriptionInfoPage() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return notFound();
  }

  const subscriptionInfo = await getSubscriptionInfoByUserId(userId);

  return <SubscriptionInfoClientPage subscriptionInfo={subscriptionInfo} />;
}
