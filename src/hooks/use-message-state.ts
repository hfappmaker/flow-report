import { useState, useCallback } from "react";

type MessageType = "error" | "success";

export const useMessageState = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showError = useCallback((message: string) => {
    setError(message);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccess(message);
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

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess("");
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    error,
    success,
    showError,
    showSuccess,
    setMessage,
    clearError,
    clearSuccess,
    clearMessages,
  };
};
