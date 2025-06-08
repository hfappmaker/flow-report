import { redirect } from "next/navigation";

import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";
import { SubscriptionPrompt } from "@/features/subscription/components/subscription-prompt";
import { canAccessPaidFeatures } from "@/features/subscription/utils/subscription-utils";

export default async function SubscriptionPage() {
  const subscriptionInfo = await getSubscriptionInfo();

  // 既にサブスクリプションがある場合はダッシュボードにリダイレクト
  if (subscriptionInfo && canAccessPaidFeatures(subscriptionInfo)) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">プレミアムプラン</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <SubscriptionPrompt
            open={true}
            onOpenChange={() => {}}
            subscriptionInfo={subscriptionInfo || {
              status: null,
              trialEndsAt: null,
              currentPeriodEnd: null,
              hasUsedTrial: false,
              isTrialActive: false,
              daysLeftInTrial: null,
            }}
          />
        </div>
      </div>
    </div>
  );
} 