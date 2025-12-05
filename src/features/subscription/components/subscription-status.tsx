"use client";

import { Badge } from "@/components/ui/badge";
import {
  SubscriptionInfo,
  STATUS_DISPLAY_MAP,
} from "@/features/subscription/types/subscription";
import { formatCancelAtMessage } from "@/features/subscription/utils/subscription-utils";

interface SubscriptionStatusProps {
  subscriptionInfo: SubscriptionInfo;
}

export function SubscriptionStatus({
  subscriptionInfo,
}: SubscriptionStatusProps) {
  if (!subscriptionInfo?.status) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">ステータス:</span>
        <Badge variant="secondary" className="pointer-events-none">
          未登録
        </Badge>
      </div>
    );
  }

  const { status, cancelAt } = subscriptionInfo;

  // ステータスに応じた表示
  let displayText = STATUS_DISPLAY_MAP[status] || status;

  // cancelAtがある場合はキャンセル予定メッセージを追加
  if (cancelAt) {
    const cancelMessage = formatCancelAtMessage(cancelAt);
    if (cancelMessage) {
      displayText = `${displayText} | ${cancelMessage}`;
    }
  }

  const getVariant = (): "default" | "secondary" | "destructive" => {
    if (status === "active") return "default";
    if (status === "trialing") return "secondary";
    return "destructive";
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">ステータス:</span>
      <Badge variant={getVariant()} className="pointer-events-none">
        {displayText}
      </Badge>
    </div>
  );
}
