import { useState, useEffect } from "react";

import { useTransitionContext } from "@/contexts/transition-context";
import { getFreeePartnersAction } from "@/features/freee/actions/freee-accounting-actions";
import type { FreeePartner } from "@/features/freee/types/freee-accounting-types";
import { useMessageState } from "@/hooks/use-message-state";

interface UseFreeePartnersProps {
  isDialogOpen: boolean;
  isFreeeConnected: boolean;
  clientName: string;
  onConnectionLost: () => void;
}

/**
 * freee取引先一覧を管理するカスタムフック
 */
export const useFreeePartners = ({
  isDialogOpen,
  isFreeeConnected,
  clientName,
  onConnectionLost,
}: UseFreeePartnersProps) => {
  const { showError } = useMessageState();
  const { setManualPending } = useTransitionContext();
  const [partners, setPartners] = useState<FreeePartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<
    number | undefined
  >();

  useEffect(() => {
    if (isDialogOpen && isFreeeConnected && partners.length === 0) {
      const fetchPartners = async () => {
        setManualPending(true);
        try {
          const result = await getFreeePartnersAction();
          if (result.success && result.partners) {
            setPartners(result.partners);
            // clientName に一致する取引先があれば自動選択
            const matchingPartner = result.partners.find(
              (p) => p.name === clientName,
            );
            if (matchingPartner) {
              setSelectedPartnerId(matchingPartner.id);
            }
          } else {
            // 再連携が必要な場合
            if (result.requiresReauth) {
              showError(result.message);
              onConnectionLost();
            } else {
              showError(result.message);
            }
          }
        } catch (error) {
          console.error("Failed to fetch partners:", error);
          showError("取引先一覧の取得に失敗しました");
        } finally {
          setManualPending(false);
        }
      };

      void fetchPartners();
    }
  }, [
    isDialogOpen,
    isFreeeConnected,
    partners.length,
    clientName,
    showError,
    onConnectionLost,
    setManualPending,
  ]);

  return {
    partners,
    selectedPartnerId,
    setSelectedPartnerId,
  };
};
