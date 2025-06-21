"use client";

import { useState, useEffect } from "react";
import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";
import { SubscriptionPrompt } from "@/features/subscription/components/subscription-prompt";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";
import { useTransitionContext } from "@/contexts/transition-context";

export default function SubscriptionPage() {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const { startTransition } = useTransitionContext();
  useEffect(() => {
    startTransition(async () => {
      try {
        const info = await getSubscriptionInfo();
        setSubscriptionInfo(info);
      } catch (error) {
        console.error("Failed to fetch subscription info:", error);
      }
    });
  }, [startTransition]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
          <SubscriptionPrompt
            open={true}
            onOpenChange={() => {}}
            subscriptionInfo={subscriptionInfo || {
              status: null,
              trialEndsAt: null,
              currentPeriodEnd: null,
              hasUsedTrial: false,
              isTrialActive: false,
              daysLeftInTrial: null,
            }}
          />
        </div>
      </div>
  );
} 