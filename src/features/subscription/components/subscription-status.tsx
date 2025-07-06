"use client";

import { Badge } from "@/components/ui/badge";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

type SubscriptionStatusProps = {
    subscriptionInfo: SubscriptionInfo;
}

export function SubscriptionStatus({ subscriptionInfo }: SubscriptionStatusProps) {
    const getStatusBadge = () => {
        const daysLeft = subscriptionInfo.currentPeriodEnd ? (subscriptionInfo.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24) : 0;
        switch (subscriptionInfo.status) {
            case "ACTIVE":
                return <Badge variant="success">プレミアムプラン</Badge>;
            case "CANCELED":
                return <Badge variant="destructive">キャンセル済み</Badge>;
            case "TRIAL":
                return <Badge variant="warning">トライアル期間中 (残り{daysLeft}日)</Badge>;
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ステータス:</span>
            {getStatusBadge()}
        </div>
    );
} 