"use client";

import { X } from "lucide-react";
import { useState, useCallback, KeyboardEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/styles/tailwind-utils";

interface EmailAddressInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailAddressInput({
  value,
  onChange,
  placeholder = "メールアドレスを入力してEnterで追加",
  disabled = false,
  className,
}: EmailAddressInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addEmail = useCallback(
    (email: string) => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        return;
      }

      if (!EMAIL_REGEX.test(trimmedEmail)) {
        setError("有効なメールアドレスを入力してください");
        return;
      }

      if (value.includes(trimmedEmail)) {
        setError("このメールアドレスは既に追加されています");
        return;
      }

      onChange([...value, trimmedEmail]);
      setInputValue("");
      setError(null);
    },
    [value, onChange],
  );

  const removeEmail = useCallback(
    (emailToRemove: string) => {
      onChange(value.filter((email) => email !== emailToRemove));
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addEmail(inputValue);
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        value.length > 0
      ) {
        removeEmail(value[value.length - 1]);
      }
    },
    [inputValue, value, addEmail, removeEmail],
  );

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      addEmail(inputValue);
    }
  }, [inputValue, addEmail]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // カンマが入力された場合は追加処理
      if (newValue.includes(",")) {
        const emails = newValue.split(",");
        emails.forEach((email) => {
          if (email.trim()) {
            addEmail(email);
          }
        });
        return;
      }
      setInputValue(newValue);
      if (error) {
        setError(null);
      }
    },
    [addEmail, error],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-input px-3 py-1.5",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {value.map((email) => (
          <Badge
            key={email}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-0.5"
          >
            <span className="text-xs">{email}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => {
                  removeEmail(email);
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`${email}を削除`}
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          type="email"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="h-6 min-w-[200px] flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
