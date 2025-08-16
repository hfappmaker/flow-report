"use client";

import { toast } from "sonner";

import { useTransitionContext } from "@/contexts/transition-context";
import { createCustomerPortalSession } from "@/features/subscription/actions/create-customer-portal-session";

type ResubscribeButtonProps = {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const ResubscribeButton = ({ 
  children, 
  onSuccess 
}: ResubscribeButtonProps) => {
  const { startTransition } = useTransitionContext();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      await createCustomerPortalSession().then((data) => {
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

  return <div onClick={handleClick}>{children}</div>;
};

export default ResubscribeButton;