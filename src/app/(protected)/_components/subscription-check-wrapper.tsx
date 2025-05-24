"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SubscriptionPrompt } from "@/features/subscription/components/subscription-prompt";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";
import { shouldShowSubscriptionPrompt } from "@/features/subscription/utils/subscription-utils";

interface SubscriptionCheckWrapperProps {
    children: React.ReactNode;
    subscriptionInfo: SubscriptionInfo;
}

export function SubscriptionCheckWrapper({
    children,
    subscriptionInfo
}: SubscriptionCheckWrapperProps) {
    const [showPrompt, setShowPrompt] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        // URLパラメーターをチェック（Stripeから戻ってきた場合）
        const subscriptionParam = searchParams.get("subscription");

        if (subscriptionParam === "success") {
            // 成功メッセージを表示（実装は省略）
            return;
        }

        // 初回アクセス時、サブスクリプションが必要な場合はプロンプトを表示
        const shouldShow = shouldShowSubscriptionPrompt(subscriptionInfo);

        // セッションストレージを使用して、同一セッション中に何度も表示されないようにする
        const hasShownInSession = sessionStorage.getItem("subscription_prompt_shown");

        if (shouldShow && !hasShownInSession) {
            setShowPrompt(true);
            sessionStorage.setItem("subscription_prompt_shown", "true");
        }
    }, [subscriptionInfo, searchParams]);

    return (
        <>
            {children}
            <SubscriptionPrompt
                open={showPrompt}
                onOpenChange={setShowPrompt}
                subscriptionInfo={subscriptionInfo}
            />
        </>
    );
} 