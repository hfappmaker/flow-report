import { useState, useCallback } from "react";

interface MessageState {
  message: string;
  date: Date;
}

type MessageType = "error" | "success";

export const useMessageState = () => {
  const [error, setError] = useState<MessageState>({
    message: "",
    date: new Date(),
  });
  const [success, setSuccess] = useState<MessageState>({
    message: "",
    date: new Date(),
  });

  const showError = useCallback((message: string) => {
    setError({ message, date: new Date() });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccess({ message, date: new Date() });
  }, []);

  const setMessage = useCallback(
    ({ type, message }: { type: MessageType; message: string }) => {
      if (type === "error") {
        showError(message);
      } else if (type === "success") {
        showSuccess(message);
      }
    },
    [showError, showSuccess],
  );

  const clearMessages = useCallback(() => {
    setError({ message: "", date: new Date() });
    setSuccess({ message: "", date: new Date() });
  }, []);

  return { error, success, showError, showSuccess, setMessage, clearMessages };
};
