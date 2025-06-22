import { NextResponse } from "next/server";

import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";
import { canAccessPaidFeatures } from "@/features/subscription/utils/subscription-utils";

export async function GET() {
  try {
    console.log("=== Checking subscription status ===");
    const subscriptionInfo = await getSubscriptionInfo();
    console.log("Subscription info retrieved:", subscriptionInfo);
    
    const canAccess = subscriptionInfo ? canAccessPaidFeatures(subscriptionInfo) : false;
    console.log("Can access paid features:", canAccess);
    
    if (subscriptionInfo && !canAccess) {
      console.log("Subscription required - returning needsSubscription: true");
      return NextResponse.json({ 
        needsSubscription: true,
        subscriptionInfo 
      });
    }

    console.log("Access granted - returning needsSubscription: false");
    return NextResponse.json({ 
      needsSubscription: false,
      subscriptionInfo 
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    // セキュリティ上の理由で、エラー時はサブスクリプションが必要として扱う
    return NextResponse.json({ 
      needsSubscription: true,
      subscriptionInfo: null,
      error: "Failed to verify subscription status"
    }, { status: 500 });
  }
} 