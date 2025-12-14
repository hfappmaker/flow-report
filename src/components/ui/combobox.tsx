"use client";

import { ComponentPropsWithRef, FC, useState, memo, useCallback } from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/styles/tailwind-utils";

import { Button } from "./button";

export interface ComboBoxFieldProps<T extends FieldValues, V> {
  control: Control<T>;
  name: Path<T> &
    {
      [P in Path<T>]: T[P] extends V | null ? P : never;
    }[Path<T>];
  options: { label: string; value: V }[];
  placeholder?: string;
  triggerClassName?: string;
  label?: string;
  showClearButton?: boolean;
  disabled?: boolean;
  variant?: "default" | "native";
}

const ComboBoxSelect = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    triggerClassName,
    disabled,
  }: {
    options: { label: string; value: string | number | bigint }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    triggerClassName?: string;
    disabled?: boolean;
  }) => (
    <Select onValueChange={onValueChange} value={value} disabled={disabled}>
      <FormControl>
        <SelectTrigger className={triggerClassName} disabled={disabled}>
          <SelectValue
            placeholder={
              <span className="text-muted-foreground">{placeholder}</span>
            }
            className="truncate"
          />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
);

ComboBoxSelect.displayName = "ComboBoxSelect";

const NativeSelect = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    triggerClassName,
    disabled,
  }: {
    options: { label: string; value: string | number | bigint }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    triggerClassName?: string;
    disabled?: boolean;
  }) => (
    <FormControl>
      <select
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground",
          triggerClassName,
        )}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
      >
        <option
          value=""
          disabled
          className="bg-background text-muted-foreground"
        >
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value.toString()}
            className="bg-background text-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormControl>
  ),
);

NativeSelect.displayName = "NativeSelect";

const ComboBoxFieldContent = ({
  field,
  options,
  placeholder,
  triggerClassName,
  label,
  showClearButton,
  disabled,
  variant = "default",
}: {
  field: any;
  options: { label: string; value: any }[];
  placeholder?: string;
  triggerClassName?: string;
  label?: string;
  showClearButton: boolean;
  disabled?: boolean;
  variant?: "default" | "native";
}) => {
  const [localValue, setLocalValue] = useState<string>(
    field.value?.toString() ?? "",
  );

  const handleValueChange = useCallback(
    (value: string) => {
      setLocalValue(value);
      const option =
        options.find((opt) => opt.value.toString() === value) ?? null;
      if (option) {
        field.onChange(option.value);
      }
    },
    [options, field],
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    field.onChange(null);
  }, [field]);

  const SelectComponent = variant === "native" ? NativeSelect : ComboBoxSelect;

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <SelectComponent
        options={options}
        value={localValue}
        onValueChange={handleValueChange}
        placeholder={placeholder}
        triggerClassName={triggerClassName}
        disabled={disabled}
      />
      {showClearButton && (
        <Button
          type="button"
          onClick={handleClear}
          variant="outline"
          size="sm"
          className="w-fit text-sm text-muted-foreground hover:text-foreground"
        >
          クリア
        </Button>
      )}
      <FormMessage />
    </FormItem>
  );
};

ComboBoxFieldContent.displayName = "ComboBoxFieldContent";

export const ComboBoxField = <
  T extends FieldValues,
  V extends string | number | bigint,
>(
  props: ComboBoxFieldProps<T, V>,
) => {
  const {
    control,
    name,
    options,
    placeholder,
    triggerClassName,
    label,
    showClearButton = true,
    disabled,
    variant = "default",
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <ComboBoxFieldContent
          field={field}
          options={options}
          placeholder={placeholder}
          triggerClassName={triggerClassName}
          label={label}
          showClearButton={showClearButton}
          disabled={disabled}
          variant={variant}
        />
      )}
    />
  );
};
