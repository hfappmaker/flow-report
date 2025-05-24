import { NextResponse } from "next/server";

import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";
import { canAccessPaidFeatures } from "@/features/subscription/utils/subscription-utils";

export async function GET() {
  try {
    const subscriptionInfo = await getSubscriptionInfo();
    
    if (subscriptionInfo && !canAccessPaidFeatures(subscriptionInfo)) {
      return NextResponse.json({ 
        needsSubscription: true,
        subscriptionInfo 
      });
    }

    return NextResponse.json({ 
      needsSubscription: false,
      subscriptionInfo 
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ 
      needsSubscription: false,
      subscriptionInfo: null 
    });
  }
} 