"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCheckoutSession } from "@/features/subscription/actions/create-checkout-session";

export function TrialSubscriptionPrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession();

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogContent = () => {
    return {
      title: "無料トライアルを開始",
      description:
        "30日間の無料トライアルで全ての機能をお試しください。クレジットカードの登録が必要ですが、トライアル期間中は課金されません。いつでもキャンセル可能です。",
      buttonText: "無料トライアルを開始",
    };
  };

  const { title, description, buttonText } = getDialogContent();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm">
              <p className="text-red-900">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "処理中..." : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
