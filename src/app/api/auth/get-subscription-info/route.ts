import { NextResponse } from "next/server";

import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";

export async function GET() {
  try {
    console.log("=== Checking subscription status ===");
    const subscriptionInfo = await getSubscriptionInfo();
    console.log("Subscription info retrieved:", subscriptionInfo);
    return NextResponse.json(subscriptionInfo);

  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ error: "Failed to check subscription status: " + error }, { status: 500 });
  }
} 