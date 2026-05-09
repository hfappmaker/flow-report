"use client";

import * as React from "react";
import { ComponentPropsWithRef, FC, useState } from "react";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";

import { cn } from "@/utils/styles/tailwind-utils";

export type PasswordInputProps = {} & ComponentPropsWithRef<"input">;

const PasswordInput: FC<PasswordInputProps> = ({ className, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      />
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
      </span>
    </div>
  );
};
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
