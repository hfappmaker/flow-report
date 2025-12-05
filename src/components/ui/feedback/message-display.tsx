import FormError from "./error-alert";
import FormSuccess from "./success-alert";

interface MessageDisplayProps {
  error: string;
  success: string;
  onCloseError?: () => void;
  onCloseSuccess?: () => void;
}

export const MessageDisplay = ({
  error,
  success,
  onCloseError,
  onCloseSuccess,
}: MessageDisplayProps) => {
  return (
    <>
      <FormError message={error} onClose={onCloseError} />
      <FormSuccess message={success} onClose={onCloseSuccess} />
    </>
  );
};
