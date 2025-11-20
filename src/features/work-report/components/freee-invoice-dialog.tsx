import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransitionContext } from "@/contexts/transition-context";
import { createFreeeInvoiceFromWorkReportAction } from "@/features/freee/actions/freee-invoice-actions";
import type { FreeePartner } from "@/features/freee/types/freee-accounting-types";
import { formatAmount } from "@/features/contract/utils/contract-calculation-utils";
import { useMessageState } from "@/hooks/use-message-state";

interface FreeeInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFreeeConnected: boolean;
  isCheckingFreeeConnection: boolean;
  partners: FreeePartner[];
  selectedPartnerId: number | undefined;
  onPartnerIdChange: (partnerId: number) => void;
  isLoadingPartners: boolean;
  workReportId: string;
  targetDate: Date;
  clientName: string;
  workTimeText: string;
  baseAmount: number;
  taxAmount: number;
  onConnectionLost: () => void;
}

/**
 * freee請求書作成ダイアログ
 */
export const FreeeInvoiceDialog = ({
  open,
  onOpenChange,
  isFreeeConnected,
  isCheckingFreeeConnection,
  partners,
  selectedPartnerId,
  onPartnerIdChange,
  isLoadingPartners,
  workReportId,
  targetDate,
  clientName,
  workTimeText,
  baseAmount,
  taxAmount,
  onConnectionLost,
}: FreeeInvoiceDialogProps) => {
  const { showError, showSuccess } = useMessageState();
  const { startTransition } = useTransitionContext();
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const handleCreateFreeeInvoice = async () => {
    // 取引先選択チェック
    if (!selectedPartnerId) {
      showError("取引先を選択してください");
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const result = await createFreeeInvoiceFromWorkReportAction(
        workReportId,
        selectedPartnerId,
      );

      if (result.success) {
        showSuccess(result.message);
        if (result.invoiceUrl) {
          // 請求書URLをクリップボードにコピー（エラーが発生しても継続）
          try {
            await navigator.clipboard.writeText(result.invoiceUrl);
            showSuccess("請求書URLをクリップボードにコピーしました");
          } catch (clipboardError) {
            console.warn("Failed to copy to clipboard:", clipboardError);
            // クリップボードエラーは致命的ではないので処理を継続
          }

          // freee請求書ページを新しいタブで開く
          window.open(result.invoiceUrl, "_blank");
        }
        onOpenChange(false);
      } else {
        // 再連携が必要な場合
        if (result.requiresReauth) {
          showError(result.message);
          onOpenChange(false);
          onConnectionLost();
        } else {
          showError(result.message);
        }
      }
    } catch (error) {
      console.error("Failed to create freee invoice:", error);
      showError("請求書の作成中にエラーが発生しました");
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>freee請求書作成</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isCheckingFreeeConnection ? (
            <p className="text-center text-muted-foreground">
              freee連携状態を確認中...
            </p>
          ) : !isFreeeConnected ? (
            <>
              <p className="text-muted-foreground">
                freeeとの連携が必要です。
              </p>
              <p className="text-sm text-muted-foreground">
                freeeアカウントと連携すると、作業報告書から請求書を作成できます。
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partner-select">取引先（必須）</Label>
                  {isLoadingPartners ? (
                    <p className="text-sm text-muted-foreground">
                      取引先を読み込み中...
                    </p>
                  ) : (
                    <Select
                      value={selectedPartnerId?.toString()}
                      onValueChange={(value) => {
                        onPartnerIdChange(parseInt(value, 10));
                      }}
                    >
                      <SelectTrigger id="partner-select">
                        <SelectValue placeholder="取引先を選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((partner) => (
                          <SelectItem
                            key={partner.id}
                            value={partner.id.toString()}
                          >
                            {partner.name}
                            {partner.code ? ` (${partner.code})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    以下の内容でfreee請求書を作成します：
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>
                      対象月: {targetDate.getFullYear()}年
                      {targetDate.getMonth() + 1}月度
                    </li>
                    <li>
                      取引先:{" "}
                      {selectedPartnerId
                        ? (partners.find((p) => p.id === selectedPartnerId)
                            ?.name ?? clientName)
                        : "未選択"}
                    </li>
                    <li>総稼働時間: {workTimeText}</li>
                    <li>金額: {formatAmount(baseAmount + taxAmount)}</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    ※ freee上でドラフト（下書き）として作成されます
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                  disabled={isCreatingInvoice}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      void handleCreateFreeeInvoice();
                    });
                  }}
                  disabled={isCreatingInvoice || !selectedPartnerId}
                >
                  {isCreatingInvoice ? "作成中..." : "作成"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
