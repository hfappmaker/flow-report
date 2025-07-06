"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { getUserSubscriptionInfo } from "@/features/subscription/repositories/subscription-repository";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  const user = await currentUser();
  
  if (!user?.id) {
    console.log("No user found in getSubscriptionInfo");
    throw new Error("User not authenticated");
  }

  console.log("Getting subscription info for user:", user.id);
  const subscriptionData = await getUserSubscriptionInfo(user.id);
  
  return subscriptionData;
}