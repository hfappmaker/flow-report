"use client";

import {
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ComponentPropsWithRef, FC, useState, memo, useCallback } from "react";
import * as React from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/utils/styles/tailwind-utils";

import { Button } from "./button";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger: FC<
  ComponentPropsWithRef<typeof SelectPrimitive.Trigger>
> = ({ className, children, ...props }) => (
  <SelectPrimitive.Trigger
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton: FC<
  ComponentPropsWithRef<typeof SelectPrimitive.ScrollUpButton>
> = ({ className, ...props }) => (
  <SelectPrimitive.ScrollUpButton
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton: FC<
  ComponentPropsWithRef<typeof SelectPrimitive.ScrollDownButton>
> = ({ className, ...props }) => (
  <SelectPrimitive.ScrollDownButton
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
);

SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent: FC<
  ComponentPropsWithRef<typeof SelectPrimitive.Content>
> = ({ className, children, position = "popper", ...props }) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel: FC<ComponentPropsWithRef<typeof SelectPrimitive.Label>> = ({
  className,
  ...props
}) => (
  <SelectPrimitive.Label
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem: FC<ComponentPropsWithRef<typeof SelectPrimitive.Item>> = ({
  className,
  children,
  ...props
}) => (
  <SelectPrimitive.Item
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator: FC<
  ComponentPropsWithRef<typeof SelectPrimitive.Separator>
> = ({ className, ...props }) => (
  <SelectPrimitive.Separator
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

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

const ComboBoxFieldContent = ({
  field,
  options,
  placeholder,
  triggerClassName,
  label,
  showClearButton,
  disabled,
}: {
  field: any;
  options: { label: string; value: any }[];
  placeholder?: string;
  triggerClassName?: string;
  label?: string;
  showClearButton: boolean;
  disabled?: boolean;
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

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <ComboBoxSelect
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
        />
      )}
    />
  );
};

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
