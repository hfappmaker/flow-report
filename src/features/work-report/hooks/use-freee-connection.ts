import { useState, useEffect } from "react";

import {
  checkFreeeConnectionAction,
  consumeFreeeOAuthResultAction,
} from "@/features/freee/actions/freee-auth-actions";
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

    // OAuth コールバックから戻ってきた場合の結果表示（サーバー側の Cookie で受け取る）
    const showOAuthResult = async () => {
      const result = await consumeFreeeOAuthResultAction();
      if (result === "connected") {
        setIsFreeeConnected(true);
        showSuccess("freeeとの連携が完了しました");
      } else if (result === "failed") {
        showError("freee連携に失敗しました");
      } else if (result === "denied") {
        showError("freee連携がキャンセルされました");
      }
    };

    void checkConnection();
    void showOAuthResult();
  }, [showSuccess, showError]);

  return {
    isFreeeConnected,
    setIsFreeeConnected,
    isCheckingFreeeConnection,
    showReauthDialog,
    setShowReauthDialog,
  };
};
