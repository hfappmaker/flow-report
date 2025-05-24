"use client";

import { Badge } from "@/components/ui/badge";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

interface SubscriptionStatusProps {
    subscriptionInfo: SubscriptionInfo;
}

export function SubscriptionStatus({ subscriptionInfo }: SubscriptionStatusProps) {
    const getStatusBadge = () => {
        if (subscriptionInfo.isTrialActive) {
            return (
                <Badge variant="secondary">
                    トライアル期間中 (残り{subscriptionInfo.daysLeftInTrial}日)
                </Badge>
            );
        }

        switch (subscriptionInfo.status) {
            case "ACTIVE":
                return <Badge variant="success">プレミアムプラン</Badge>;
            case "CANCELED":
                return <Badge variant="destructive">キャンセル済み</Badge>;
            case "PAST_DUE":
                return <Badge variant="warning">支払い遅延</Badge>;
            case "UNPAID":
                return <Badge variant="destructive">未払い</Badge>;
            default:
                return <Badge variant="outline">無料プラン</Badge>;
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ステータス:</span>
            {getStatusBadge()}
        </div>
    );
} 