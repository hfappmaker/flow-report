"use client";

import { useEffect } from "react";

import { TrialSubscriptionPrompt } from "@/features/subscription/components/trial-subscription-prompt";

export default function SubscriptionPage() {
  useEffect(() => {
    // URLが正しくない場合は修正
    if (window.location.pathname !== '/subscription') {
      window.history.replaceState(null, '', '/subscription');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <TrialSubscriptionPrompt />
    </div>
  );
} 