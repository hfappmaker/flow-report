import * as React from "react";
import { FC, useState, memo, useCallback } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import { cn } from "@/utils/styles/tailwind-utils";

import {
  FormControl,
  FormLabel,
  FormField,
  FormMessage,
  FormItem,
} from "./form";

const Input: FC<React.ComponentPropsWithRef<"input">> = ({
  className,
  type,
  ...props
}) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

Input.displayName = "Input";

interface NumberInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T> &
    {
      [P in Path<T>]: T[P] extends number | null ? P : never;
    }[Path<T>];
  label: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  onBlur?: () => void;
}

const NumberInput = memo(
  ({
    value,
    onChange,
    onKeyDown,
    onBlur,
    placeholder,
    disabled,
    min = 0,
    max,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
  }) => (
    <Input
      type="number"
      placeholder={placeholder}
      value={value}
      min={min}
      max={max}
      step="1"
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      disabled={disabled}
    />
  ),
);

NumberInput.displayName = "NumberInput";

const NumberInputFieldContent = ({
  field,
  label,
  placeholder,
  disabled,
  min,
  max,
  onBlur,
}: {
  field: any;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  onBlur?: () => void;
}) => {
  const [localValue, setLocalValue] = useState<string>(
    field.value?.toString() ?? "",
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);
      if (value === "") {
        field.onChange(null);
      } else {
        const numValue = Number(value);
        if (numValue >= 0) {
          field.onChange(numValue);
        }
      }
    },
    [field],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "-" || e.key === "." || e.key === ",") {
        e.preventDefault();
      }
    },
    [],
  );

  const handleBlur = useCallback(() => {
    field.onBlur();
    onBlur?.();
  }, [field, onBlur]);

  return (
    <FormItem className="flex-1">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <NumberInput
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

NumberInputFieldContent.displayName = "NumberInputFieldContent";

export const NumberInputField = <T extends FieldValues>(
  props: NumberInputFieldProps<T>,
) => {
  const { control, name, label, placeholder, disabled, min, max, onBlur } =
    props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <NumberInputFieldContent
          field={field}
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          onBlur={onBlur}
        />
      )}
    />
  );
};

export { Input };
