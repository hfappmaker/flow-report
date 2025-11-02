"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FreeePartner } from "@/features/freee/types/freee-accounting-types";
import { formatAmount } from "@/features/contract/utils/contract-calculation-utils";

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isCheckingConnection: boolean;
  isFreeeConnected: boolean;
  isLoadingPartners: boolean;
  isCreatingInvoice: boolean;
  partners: FreeePartner[];
  selectedPartnerId: number | null;
  onPartnerChange: (id: number) => void;
  onCreateInvoice: () => void;
  contractName: string;
  targetDate: Date;
  clientName: string;
  workTimeText: string;
  amountCalculation: {
    baseAmount: number;
    taxAmount: number;
  } | null;
}

export function InvoiceDialog({
  isOpen,
  onClose,
  isCheckingConnection,
  isFreeeConnected,
  isLoadingPartners,
  isCreatingInvoice,
  partners,
  selectedPartnerId,
  onPartnerChange,
  onCreateInvoice,
  contractName,
  targetDate,
  clientName,
  workTimeText,
  amountCalculation,
}: InvoiceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>freee請求書作成</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isCheckingConnection ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">freee連携を確認中...</p>
            </div>
          ) : !isFreeeConnected ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                freeeとの連携が必要です
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const returnTo = encodeURIComponent(window.location.pathname);
                  window.location.href = `/api/auth/freee/authorize?returnTo=${returnTo}`;
                }}
              >
                freeeと連携する
              </Button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  取引先を選択
                </label>
                {isLoadingPartners ? (
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground">
                      取引先を読み込み中...
                    </p>
                  </div>
                ) : partners.length === 0 ? (
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground">
                      取引先が見つかりません
                    </p>
                  </div>
                ) : (
                  <Select
                    value={selectedPartnerId?.toString() ?? ""}
                    onValueChange={(value) => onPartnerChange(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="取引先を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((partner) => (
                        <SelectItem
                          key={partner.id}
                          value={partner.id.toString()}
                        >
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="text-sm font-medium mb-3">請求書内容</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    契約: {contractName} {targetDate.getFullYear()}年
                    {targetDate.getMonth() + 1}月度
                  </li>
                  <li>
                    取引先:{" "}
                    {selectedPartnerId
                      ? (partners.find((p) => p.id === selectedPartnerId)
                          ?.name ?? clientName)
                      : "未選択"}
                  </li>
                  <li>稼働時間: {workTimeText}</li>
                  <li>
                    金額:{" "}
                    {amountCalculation
                      ? formatAmount(
                          amountCalculation.baseAmount +
                            amountCalculation.taxAmount,
                        )
                      : "---"}
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  ※ freee上でドラフト（下書き）として作成されます
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isCreatingInvoice}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  onClick={onCreateInvoice}
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
}