"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/features/subscription/actions/create-checkout-session";

type ResubscribeButtonProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const ResubscribeButton = ({ children, onSuccess }: ResubscribeButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(() => {
      void createCheckoutSession().then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.url) {
          // Stripeチェックアウトページにリダイレクト
          window.location.href = data.url;
          onSuccess?.();
        }
      });
    });
  };

  return (
    <div onClick={handleClick}>
      {isPending ? (
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ResubscribeButton;