import { useState, useEffect, useCallback } from "react";
import { getFreeePartnersAction } from "@/features/freee/actions/freee-accounting-actions";
import { checkFreeeConnectionAction } from "@/features/freee/actions/freee-auth-actions";
import { createFreeeInvoiceFromWorkReportAction } from "@/features/freee/actions/freee-invoice-actions";
import type { FreeePartner } from "@/features/freee/types/freee-accounting-types";

interface UseFreeeIntegrationProps {
  workReportId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

interface UseFreeeIntegrationReturn {
  isInvoiceDialogOpen: boolean;
  setIsInvoiceDialogOpen: (open: boolean) => void;
  showReauthDialog: boolean;
  setShowReauthDialog: (show: boolean) => void;
  isFreeeConnected: boolean;
  isCheckingFreeeConnection: boolean;
  isCreatingInvoice: boolean;
  isLoadingPartners: boolean;
  partners: FreeePartner[];
  selectedPartnerId: number | null;
  setSelectedPartnerId: (id: number | null) => void;
  handleCreateFreeeInvoice: () => Promise<void>;
  checkFreeeConnection: () => Promise<void>;
  loadFreeePartners: () => Promise<void>;
}

export function useFreeeIntegration({
  workReportId,
  onSuccess,
  onError,
}: UseFreeeIntegrationProps): UseFreeeIntegrationReturn {
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [isFreeeConnected, setIsFreeeConnected] = useState(false);
  const [isCheckingFreeeConnection, setIsCheckingFreeeConnection] =
    useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [partners, setPartners] = useState<FreeePartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(
    null,
  );
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  // Check freee connection status
  const checkFreeeConnection = useCallback(async () => {
    setIsCheckingFreeeConnection(true);
    try {
      const isConnected = await checkFreeeConnectionAction();
      setIsFreeeConnected(isConnected);

      if (!isConnected) {
        setShowReauthDialog(true);
      }
    } catch (error) {
      setIsFreeeConnected(false);
      onError?.("freee連携の確認中にエラーが発生しました");
    } finally {
      setIsCheckingFreeeConnection(false);
    }
  }, [onError]);

  // Load freee partners
  const loadFreeePartners = useCallback(async () => {
    if (!isFreeeConnected || isLoadingPartners) return;

    setIsLoadingPartners(true);
    try {
      const result = await getFreeePartnersAction();
      if (result.success && result.partners) {
        setPartners(result.partners);
        if (result.partners.length > 0 && !selectedPartnerId) {
          setSelectedPartnerId(result.partners[0]?.id ?? null);
        }
      } else if (result.requiresReauth) {
        setShowReauthDialog(true);
        setIsFreeeConnected(false);
      } else {
        onError?.("取引先の取得に失敗しました");
      }
    } catch (error) {
      onError?.("取引先の取得中にエラーが発生しました");
    } finally {
      setIsLoadingPartners(false);
    }
  }, [isFreeeConnected, isLoadingPartners, selectedPartnerId, onError]);

  // Create freee invoice
  const handleCreateFreeeInvoice = useCallback(async () => {
    if (!selectedPartnerId || isCreatingInvoice) return;

    setIsCreatingInvoice(true);
    try {
      const result = await createFreeeInvoiceFromWorkReportAction(
        workReportId,
        selectedPartnerId,
      );

      if (result.success) {
        onSuccess?.("請求書を作成しました");
        setIsInvoiceDialogOpen(false);
      } else if (result.requiresReauth) {
        setShowReauthDialog(true);
        setIsFreeeConnected(false);
      } else {
        onError?.(result.message ?? "請求書の作成に失敗しました");
      }
    } catch (error) {
      onError?.("請求書作成中にエラーが発生しました");
    } finally {
      setIsCreatingInvoice(false);
    }
  }, [workReportId, selectedPartnerId, isCreatingInvoice, onSuccess, onError]);

  // Check connection when dialog opens
  useEffect(() => {
    if (
      isInvoiceDialogOpen &&
      !isFreeeConnected &&
      !isCheckingFreeeConnection
    ) {
      void checkFreeeConnection();
    }
  }, [
    isInvoiceDialogOpen,
    isFreeeConnected,
    isCheckingFreeeConnection,
    checkFreeeConnection,
  ]);

  // Load partners when connected
  useEffect(() => {
    if (isFreeeConnected && partners.length === 0 && !isLoadingPartners) {
      void loadFreeePartners();
    }
  }, [isFreeeConnected, partners.length, isLoadingPartners, loadFreeePartners]);

  return {
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    showReauthDialog,
    setShowReauthDialog,
    isFreeeConnected,
    isCheckingFreeeConnection,
    isCreatingInvoice,
    isLoadingPartners,
    partners,
    selectedPartnerId,
    setSelectedPartnerId,
    handleCreateFreeeInvoice,
    checkFreeeConnection,
    loadFreeePartners,
  };
}
