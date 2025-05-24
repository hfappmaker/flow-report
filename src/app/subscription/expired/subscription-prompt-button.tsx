"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SubscriptionPrompt } from "@/features/subscription/components/subscription-prompt";
import type { SubscriptionInfo } from "@/features/subscription/types/subscription";

export function SubscriptionPromptButton({ subscriptionInfo }: { subscriptionInfo: SubscriptionInfo }) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      <Button 
        onClick={() => { setShowPrompt(true); }} 
        className="w-full"
        size="lg"
      >
        プレミアムプランに登録
      </Button>
      <SubscriptionPrompt
        open={showPrompt}
        onOpenChange={setShowPrompt}
        subscriptionInfo={subscriptionInfo}
      />
    </>
  );
} 