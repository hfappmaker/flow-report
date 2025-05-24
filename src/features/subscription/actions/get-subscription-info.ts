"use server";

import { currentUser } from "@/features/auth/lib/auth";
import { getUserSubscriptionInfo } from "@/features/subscription/repositories/subscription-repository";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";
import { calculateSubscriptionInfo } from "@/features/subscription/utils/subscription-utils";

export async function getSubscriptionInfo(): Promise<SubscriptionInfo | null> {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return null;
    }

    const subscriptionData = await getUserSubscriptionInfo(user.id);

    if (!subscriptionData) {
      return {
        status: null,
        trialEndsAt: null,
        currentPeriodEnd: null,
        hasUsedTrial: false,
        isTrialActive: false,
        daysLeftInTrial: null,
      };
    }

    return calculateSubscriptionInfo(subscriptionData);
  } catch (error) {
    console.error("Failed to get subscription info:", error);
    return null;
  }
}
