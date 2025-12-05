"use client";

import { CreditCard } from "lucide-react";
import { MdSettings } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ManageSubscriptionButton from "@/features/subscription/components/manage-subscription-button";
import { SubscriptionStatus } from "@/features/subscription/components/subscription-status";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

interface SubscriptionInfoClientPageProps {
  subscriptionInfo: SubscriptionInfo | null;
}

export default function SubscriptionInfoClientPage({
  subscriptionInfo,
}: SubscriptionInfoClientPageProps) {
  // 管理ボタンを表示するステータス
  const showManageButton =
    subscriptionInfo?.status === "TRIAL" ||
    subscriptionInfo?.status === "ACTIVE" ||
    subscriptionInfo?.status === "CANCELED";

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-3 font-semibold">
          <CreditCard className="text-3xl text-sky-400" />
          <h1 className="text-2xl">サブスクリプション情報</h1>
        </div>
        {showManageButton && (
          <ManageSubscriptionButton>
            <Button variant="outline" size="sm">
              <MdSettings className="mr-2 size-4" />
              サブスクリプションを管理
            </Button>
          </ManageSubscriptionButton>
        )}
      </CardHeader>
      <CardContent>
        {subscriptionInfo ? (
          <SubscriptionStatus subscriptionInfo={subscriptionInfo} />
        ) : (
          <p className="text-muted-foreground">
            サブスクリプション情報がありません
          </p>
        )}
      </CardContent>
    </Card>
  );
}
