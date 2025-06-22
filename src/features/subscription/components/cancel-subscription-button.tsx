"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { createCustomerPortalSession } from "@/features/subscription/actions/create-customer-portal-session";

type CancelSubscriptionButtonProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const CancelSubscriptionButton = ({ children, onSuccess }: CancelSubscriptionButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(() => {
      void createCustomerPortalSession().then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.url) {
          // カスタマーポータルにリダイレクト
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

export default CancelSubscriptionButton; 