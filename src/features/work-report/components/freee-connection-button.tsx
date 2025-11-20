import { Button } from "@/components/ui/button";

type FreeeConnectionButtonProps = {
  disabled: boolean;
  onConnectionStart: () => void;
};

export const FreeeConnectionButton = ({
  disabled,
  onConnectionStart,
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
      freee連携
    </Button>
  );
};
