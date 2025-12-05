import { Cross2Icon } from "@radix-ui/react-icons";

export type AlertVariant = "success" | "error";

export interface AlertProps {
  message?: string;
  onClose?: () => void;
  variant: AlertVariant;
  icon: React.ReactNode;
}

export const Alert = ({ message, onClose, variant, icon }: AlertProps) => {
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
