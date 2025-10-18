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
            プレミアムプランが期限切れになりました
          </DialogTitle>
          <DialogDescription>
            プレミアムプランの利用期限が切れています。サービスを継続してご利用いただくには、プランを再開してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-semibold">プレミアムプランの特徴</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ 全機能への無制限アクセス</li>
              <li>✓ 月額500円（税込）</li>
              <li>✓ いつでもキャンセル可能</li>
              <li>✓ 安心の決済システム</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <SubscriptionPromptButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
