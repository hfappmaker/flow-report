"use client";

import { Badge } from "@/components/ui/badge";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

interface SubscriptionStatusProps {
  subscriptionInfo: SubscriptionInfo;
}

export function SubscriptionStatus({
  subscriptionInfo,
}: SubscriptionStatusProps) {
  const getStatusBadge = () => {
    const formatTimeLeft = (endDate: Date): string => {
      const now = new Date();
      const diffMs = endDate.getTime() - now.getTime();

      if (diffMs <= 0) return "期限切れ";

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const parts = [];
      if (days > 0) parts.push(`${days}日`);
      if (hours > 0) parts.push(`${hours}時間`);
      if (minutes > 0) parts.push(`${minutes}分`);

      return parts.length > 0 ? parts.join("") : "1分未満";
    };

    const timeLeft = subscriptionInfo.currentPeriodEnd
      ? formatTimeLeft(subscriptionInfo.currentPeriodEnd)
      : "期限不明";

    switch (subscriptionInfo.status) {
      case "ACTIVE":
        return (
          <Badge variant="success" className="pointer-events-none">
            プレミアムプラン
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant="destructive" className="pointer-events-none">
            キャンセル済み (残り{timeLeft})
          </Badge>
        );
      case "TRIAL": {
        return (
          <Badge variant="warning" className="pointer-events-none">
            トライアル期間中 (残り{timeLeft})
          </Badge>
        );
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">ステータス:</span>
      {getStatusBadge()}
    </div>
  );
}
