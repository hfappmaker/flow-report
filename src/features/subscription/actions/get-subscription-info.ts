"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { getUserSubscriptionInfo } from "@/features/subscription/repositories/subscription-repository";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";
import { calculateSubscriptionInfo } from "@/features/subscription/utils/subscription-utils";

export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      console.log("No user found in getSubscriptionInfo");
      return null;
    }

    console.log("Getting subscription info for user:", user.id);
    const subscriptionData = await getUserSubscriptionInfo(user.id);
    console.log("Raw subscription data:", subscriptionData);

    if (!subscriptionData) {
      console.log("No subscription data found, returning default");
      return {
        status: null,
        trialEndsAt: null,
        currentPeriodEnd: null,
        hasUsedTrial: false,
        isTrialActive: false,
        daysLeftInTrial: null,
      };
    }

    const calculatedInfo = calculateSubscriptionInfo(subscriptionData);
    console.log("Calculated subscription info:", calculatedInfo);
    
    return calculatedInfo;
  } catch (error) {
    console.error("Failed to get subscription info:", error);
    return null;
  }
}
