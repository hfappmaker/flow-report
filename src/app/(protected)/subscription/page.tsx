"use client";

import { TrialSubscriptionPrompt } from "@/features/subscription/components/trial-subscription-prompt";

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TrialSubscriptionPrompt />
    </div>
  );
}
