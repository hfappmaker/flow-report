import { useState, useEffect } from "react";

import { checkFreeeConnectionAction } from "@/features/freee/actions/freee-auth-actions";
import { useMessageState } from "@/hooks/use-message-state";

/**
 * freee連携状態を管理するカスタムフック
 */
export const useFreeeConnection = () => {
  const { showError, showSuccess } = useMessageState();
  const [isFreeeConnected, setIsFreeeConnected] = useState(false);
  const [isCheckingFreeeConnection, setIsCheckingFreeeConnection] =
    useState(true);
  const [showReauthDialog, setShowReauthDialog] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingFreeeConnection(true);
      try {
        const connected = await checkFreeeConnectionAction();
        setIsFreeeConnected(connected);
      } catch (error) {
        console.error("Failed to check freee connection:", error);
      } finally {
        setIsCheckingFreeeConnection(false);
      }
    };

    void checkConnection();

    // OAuth コールバックから戻ってきた場合の処理
    const params = new URLSearchParams(window.location.search);
    if (params.get("freee_connected") === "true") {
      setIsFreeeConnected(true);
      showSuccess("freeeとの連携が完了しました");
      // URLパラメータをクリア
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error") === "freee_auth_failed") {
      showError("freee連携に失敗しました");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error") === "freee_auth_denied") {
      showError("freee連携がキャンセルされました");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showSuccess, showError]);

  return {
    isFreeeConnected,
    setIsFreeeConnected,
    isCheckingFreeeConnection,
    showReauthDialog,
    setShowReauthDialog,
  };
};
