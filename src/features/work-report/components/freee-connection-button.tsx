import { Button } from "@/components/ui/button";

interface FreeeConnectionButtonProps {
  disabled: boolean;
  onConnectionStart: () => void;
  label?: string;
}

export const FreeeConnectionButton = ({
  disabled,
  onConnectionStart,
  label = "freee連携",
}: FreeeConnectionButtonProps) => {
  const handleClick = () => {
    const returnTo = encodeURIComponent(window.location.pathname);
    onConnectionStart();
    window.location.href = `/api/auth/freee/authorize?returnTo=${returnTo}`;
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
};
