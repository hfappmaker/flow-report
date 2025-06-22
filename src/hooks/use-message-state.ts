import { useState } from "react";

type MessageState = {
  message: string;
  date: Date;
};

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

  const showError = (message: string) => {
    setError({ message, date: new Date() });
  };

  const showSuccess = (message: string) => {
    setSuccess({ message, date: new Date() });
  };

  const setMessage = ({ type, message }: { type: MessageType; message: string }) => {
    if (type === "error") {
      showError(message);
    } else if (type === "success") {
      showSuccess(message);
    }
  };

  const clearMessages = () => {
    setError({ message: "", date: new Date() });
    setSuccess({ message: "", date: new Date() });
  };

  return { error, success, showError, showSuccess, setMessage, clearMessages };
}; 