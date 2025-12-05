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

  const handleAction = () => {
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAction();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handleAction();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="inline-block"
    >
      {children}
    </span>
  );
};

export default ManageSubscriptionButton;
