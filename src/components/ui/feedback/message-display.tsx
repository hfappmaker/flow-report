import FormError from "./error-alert";
import FormSuccess from "./success-alert";

interface MessageState {
  message: string;
  date: Date;
}

interface MessageDisplayProps {
  error: MessageState;
  success: MessageState;
}

export const MessageDisplay = ({ error, success }: MessageDisplayProps) => {
  return (
    <>
      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess
        message={success.message}
        resetSignal={success.date.getTime()}
      />
    </>
  );
};
