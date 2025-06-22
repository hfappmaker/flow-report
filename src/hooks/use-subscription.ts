"use client";

import { useEffect, useState } from "react";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

export const useSubscription = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/check-subscription");
        
        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo(data.subscriptionInfo);
        } else {
          setError("サブスクリプション情報の取得に失敗しました");
        }
      } catch (err) {
        setError("サブスクリプション情報の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const refreshSubscription = async () => {
    try {
      const response = await fetch("/api/auth/check-subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data.subscriptionInfo);
      }
    } catch (err) {
      console.error("Failed to refresh subscription:", err);
    }
  };

  return {
    subscriptionInfo,
    isLoading,
    error,
    refreshSubscription,
  };
}; 