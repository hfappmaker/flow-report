"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionPromptButton } from "@/features/subscription/components/subscription-prompt-button";

export default function SubscriptionExpiredPage() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // URLが正しくない場合は修正
    if (window.location.pathname !== "/subscription/expired") {
      window.history.replaceState(null, "", "/subscription/expired");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center">
            有料プランが期限切れになりました
          </DialogTitle>
          <DialogDescription>
            有料プランの利用期限が切れています。サービスを継続してご利用いただくには、プランを再開してください。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <SubscriptionPromptButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
