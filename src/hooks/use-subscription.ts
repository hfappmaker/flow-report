"use client";

import { useEffect, useState } from "react";

import { useTransitionContext } from "@/contexts/transition-context";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

export const useSubscription = () => {
  const { setManualPending } = useTransitionContext();
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setManualPending(true);
        const response = await fetch("/api/auth/get-subscription-info");

        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo(data);
        } else {
          setError("サブスクリプション情報の取得に失敗しました");
        }
      } catch (err) {
        setError("サブスクリプション情報の取得に失敗しました");
      } finally {
        setManualPending(false);
      }
    };

    fetchSubscription();
  }, [setManualPending]);

  const refreshSubscription = async () => {
    try {
      setManualPending(true);
      const response = await fetch("/api/auth/get-subscription-info");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (err) {
      console.error("Failed to refresh subscription:", err);
    } finally {
      setManualPending(false);
    }
  };

  return {
    subscriptionInfo,
    error,
    refreshSubscription,
  };
};
