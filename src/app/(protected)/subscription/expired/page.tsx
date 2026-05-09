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
import LogoutButton from "@/features/auth/components/logout-button";
import { SubscriptionPromptButton } from "@/features/subscription/components/subscription-prompt-button";

export default function SubscriptionExpiredPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[425px]" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center">
            有料プランが期限切れになりました
          </DialogTitle>
          <DialogDescription>
            有料プランの利用期限が切れています。サービスを継続してご利用いただくには、プランを再開してください。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2">
          <SubscriptionPromptButton />
          <LogoutButton>
            <Button variant="outline" className="w-full">
              ログアウト
            </Button>
          </LogoutButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
