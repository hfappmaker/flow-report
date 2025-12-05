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
    subscriptionInfo?.status === "trialing" ||
    subscriptionInfo?.status === "active";

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="font-semibold">
        <div className="flex items-center gap-x-3">
          <CreditCard className="text-3xl text-sky-400" />
          <h1 className="text-2xl">サブスクリプション情報</h1>
        </div>
      </CardHeader>
      <CardContent>
        {subscriptionInfo ? (
          <SubscriptionStatus subscriptionInfo={subscriptionInfo} />
        ) : (
          <p className="text-muted-foreground">
            サブスクリプション情報がありません
          </p>
        )}
        {showManageButton && (
          <div className="mt-6">
            <ManageSubscriptionButton>
              <Button variant="outline" size="sm">
                <MdSettings className="mr-2 size-4" />
                サブスクリプションを管理
              </Button>
            </ManageSubscriptionButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
