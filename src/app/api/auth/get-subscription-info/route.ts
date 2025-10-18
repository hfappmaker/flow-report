import { NextResponse } from "next/server";

import { currentUser } from "@/features/auth/lib/auth";
import { getSubscriptionInfoByUserId } from "@/features/subscription/repositories/subscription-repository";

export async function GET() {
  try {
    console.log("=== Checking subscription status ===");
    const user = await currentUser();

    if (!user?.id) {
      console.log("No user found in getSubscriptionInfo");
      throw new Error("User not authenticated");
    }

    console.log("Getting subscription info for user:", user.id);
    const subscriptionInfo = await getSubscriptionInfoByUserId(user.id);
    console.log("Subscription info retrieved:", subscriptionInfo);
    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status: " + error },
      { status: 500 },
    );
  }
}
