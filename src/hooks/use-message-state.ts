import { useState, useCallback, useEffect, useRef } from "react";

interface MessageState {
  message: string;
  date: Date;
}

type MessageType = "error" | "success";

const AUTO_CLOSE_DELAY = 5000;

export const useMessageState = () => {
  const [error, setError] = useState<MessageState>({
    message: "",
    date: new Date(),
  });
  const [success, setSuccess] = useState<MessageState>({
    message: "",
    date: new Date(),
  });

  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    if (error.message) {
      errorTimerRef.current = setTimeout(() => {
        setError({ message: "", date: new Date() });
      }, AUTO_CLOSE_DELAY);
    }
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [error.date]);

  useEffect(() => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    if (success.message) {
      successTimerRef.current = setTimeout(() => {
        setSuccess({ message: "", date: new Date() });
      }, AUTO_CLOSE_DELAY);
    }
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [success.date]);

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
