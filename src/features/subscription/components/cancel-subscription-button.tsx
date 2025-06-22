"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { cancelSubscription } from "@/features/subscription/actions/cancel-subscription";

type CancelSubscriptionButtonProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const CancelSubscriptionButton = ({ children, onSuccess }: CancelSubscriptionButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInitialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
  };

  const handleConfirmAction = () => {
    startTransition(() => {
      void cancelSubscription().then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.success) {
          toast.success(data.success);
          onSuccess?.();
        }
        setShowConfirm(false);
      });
    });
  };

  const handleBackdropClick = () => {
    if (!isPending) {
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <h3 className="text-lg font-semibold mb-4">サブスクリプションをキャンセルしますか？</h3>
          <p className="text-gray-600 mb-6">
            キャンセル後も現在の請求期間終了まではサービスをご利用いただけます。
            再度購読する場合、トライアル期間は適用されません。
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleConfirmCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={isPending}
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirmAction}
              disabled={isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "処理中..." : "確認"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleInitialClick}>
      {children}
    </div>
  );
};

export default CancelSubscriptionButton; 