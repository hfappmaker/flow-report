"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/features/subscription/actions/create-checkout-session";

export function SubscriptionPromptButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      const result = await createCheckoutSession();

      if (result.error) {
        console.error("Subscription error:", result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? "処理中..." : "プレミアムプランに登録"}
    </Button>
  );
}
