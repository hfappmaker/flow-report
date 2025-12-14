"use client";

import { Button } from "@/components/ui/button";
import { useTransitionContext } from "@/contexts/transition-context";
import { createCheckoutSession } from "@/features/subscription/actions/create-checkout-session";

export function SubscriptionPromptButton() {
  const { isPending, startTransition } = useTransitionContext();

  const handleSubscribe = () => {
    startTransition(() => {
      void (async () => {
        try {
          const result = await createCheckoutSession();

          if (result.error) {
            console.error("Subscription error:", result.error);
            return;
          }

          if (result.url) {
            // eslint-disable-next-line functional/immutable-data -- Browser API requires direct assignment
            window.location.href = result.url;
          }
        } catch (err) {
          console.error("Subscription error:", err);
        }
      })();
    });
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isPending}
      className="w-full"
      size="lg"
    >
      有料プランに登録
    </Button>
  );
}
