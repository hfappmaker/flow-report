"use client";

import { toast } from "sonner";

import { useTransitionContext } from "@/contexts/transition-context";
import { createCustomerPortalSession } from "@/features/subscription/actions/create-customer-portal-session";

interface ManageSubscriptionButtonProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const ManageSubscriptionButton = ({
  children,
  onSuccess,
}: ManageSubscriptionButtonProps) => {
  const { startTransition } = useTransitionContext();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(() => {
      void createCustomerPortalSession().then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.url) {
          // カスタマーポータルにリダイレクト
          // eslint-disable-next-line functional/immutable-data
          window.location.href = data.url;
          onSuccess?.();
        }
      });
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      {children}
    </div>
  );
};

export default ManageSubscriptionButton;
