"use client";

import * as React from "react";
import { FC } from "react";

import { cn } from "@/utils/styles/tailwind-utils";

const TextArea: FC<React.ComponentPropsWithRef<"textarea">> = ({
  className,
  name,
  ...props
}) => {
  return (
    <textarea
      name={name}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

TextArea.displayName = "TextArea";

export { TextArea };
