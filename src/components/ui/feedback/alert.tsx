import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect } from "react";

export type AlertVariant = "success" | "error";

export interface AlertProps {
  message?: string;
  onClose?: () => void;
  variant: AlertVariant;
  icon: React.ReactNode;
  /** 自動で閉じるまでの時間（ミリ秒）。デフォルトは5000ms（5秒）。nullを指定すると自動で閉じない */
  autoCloseDelay?: number | null;
}

const DEFAULT_AUTO_CLOSE_DELAY = 5000;

export const Alert = ({
  message,
  onClose,
  variant,
  icon,
  autoCloseDelay,
}: AlertProps) => {
  const resolvedDelay =
    autoCloseDelay === undefined ? DEFAULT_AUTO_CLOSE_DELAY : autoCloseDelay;

  useEffect(() => {
    if (!message || resolvedDelay === null || !onClose) return;

    const delay = resolvedDelay;
    const timer = setTimeout(() => {
      onClose();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [message, resolvedDelay, onClose]);

  if (!message) return null;

  const variantStyles = {
    success: "bg-emerald-500/15 text-emerald-500",
    error: "bg-destructive/15 text-destructive",
  };

  return (
    <div
      className={`flex items-center justify-between gap-x-2 rounded-md p-3 text-sm ${variantStyles[variant]}`}
    >
      <span className="size-4 flex-none">{icon}</span>
      <p className="pr-6">{message}</p>
      <button
        onClick={() => onClose?.()}
        className="ml-auto p-1 focus:outline-none"
      >
        <Cross2Icon className="size-4" />
      </button>
    </div>
  );
};
