"use client";

import * as React from "react";
import { FC, useRef, useState } from "react";
import { FieldValues, Control, Path } from "react-hook-form";
import { FaCalendarAlt } from "react-icons/fa";
import { StrictOmit } from "ts-essentials";

import { cn } from "@/utils/styles/tailwind-utils";

import { Button } from "./button";
import {
  FormControl,
  FormField,
  FormMessage,
  FormItem,
  FormLabel,
} from "./form";
import {
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
  Select,
} from "./select";

type DatePickerProps = {
  value?: string;
  onChange?: (date: string) => void;
} & StrictOmit<React.ComponentPropsWithRef<"input">, "onChange" | "value">;

export const DatePicker: FC<DatePickerProps> = ({
  className,
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <div>
      <div className="relative">
        <input
          type="date"
          className={cn(
            "flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border border-input focus-visible:ring-ring",
            className,
          )}
          onChange={handleChange}
          {...props}
          ref={inputRef}
        />
        <FaCalendarAlt
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
          onClick={handleIconClick}
        />
      </div>
    </div>
  );
};

DatePicker.displayName = "DatePicker";

interface DatePickerFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T> &
    {
      [P in Path<T>]: T[P] extends Date | undefined ? P : never;
    }[Path<T>];
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

const DatePickerFieldContent = ({
  field,
  label,
  placeholder,
  disabled,
}: {
  field: any;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    field.value ? new Date(field.value).toISOString().split("T")[0] : "",
  );

  return (
    <FormItem className="flex-1">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <DatePicker
          value={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            field.onChange(
              date ? new Date(date + "T00:00:00.000Z") : undefined,
            );
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

DatePickerFieldContent.displayName = "DatePickerFieldContent";

export const DatePickerField = <T extends FieldValues>(
  props: DatePickerFieldProps<T>,
) => {
  const { control, name, label, placeholder, disabled } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <DatePickerFieldContent
          field={field}
          label={label}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    />
  );
};

interface CommonSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder: React.ReactNode;
  className?: string;
  options: { value: string; label: string }[];
}

const CommonSelect = React.memo(
  ({
    value,
    onValueChange,
    placeholder,
    className,
    options,
  }: CommonSelectProps) => {
    const items = React.useMemo(
      () =>
        options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        )),
      [options],
    );

    return (
      <Select value={value} onValueChange={onValueChange}>
        <FormControl>
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>{items}</SelectContent>
      </Select>
    );
  },
);

CommonSelect.displayName = "CommonSelect";

// 年の選択肢を生成 (2025年から2099年までの範囲)
const YEAR_OPTIONS = Array.from({ length: 75 }, (_, i) => ({
  value: (2025 + i).toString(),
  label: `${2025 + i}年`,
}));

// 月の選択肢を生成
const MONTH_OPTIONS = [
  { value: "0", label: "1月" },
  { value: "1", label: "2月" },
  { value: "2", label: "3月" },
  { value: "3", label: "4月" },
  { value: "4", label: "5月" },
  { value: "5", label: "6月" },
  { value: "6", label: "7月" },
  { value: "7", label: "8月" },
  { value: "8", label: "9月" },
  { value: "9", label: "10月" },
  { value: "10", label: "11月" },
  { value: "11", label: "12月" },
];

interface YearMonthPickerFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T> &
    {
      [P in Path<T>]: T[P] extends Date | null ? P : never;
    }[Path<T>];
  label?: string;
  yearPlaceholder?: string;
  monthPlaceholder?: string;
  showClearButton?: boolean;
  yearTriggerClassName?: string;
  monthTriggerClassName?: string;
}

interface YearMonthPickerContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  yearPlaceholder: string;
  monthPlaceholder: string;
  label?: string;
  showClearButton: boolean;
  yearTriggerClassName?: string;
  monthTriggerClassName?: string;
}

const YearMonthPickerContent = ({
  field,
  yearPlaceholder,
  monthPlaceholder,
  label,
  showClearButton,
  yearTriggerClassName,
  monthTriggerClassName,
}: YearMonthPickerContentProps) => {
  const date = field.value as Date | null;
  const selectedYear = date?.getFullYear().toString();
  const selectedMonth = date?.getMonth().toString();

  const handleYearChange = (value: string) => {
    if (value) {
      field.onChange(
        new Date(Date.UTC(parseInt(value), parseInt(selectedMonth ?? "0"), 1)),
      );
    }
  };

  const handleMonthChange = (value: string) => {
    if (value) {
      field.onChange(
        new Date(
          Date.UTC(parseInt(selectedYear ?? "2025"), parseInt(value), 1),
        ),
      );
    }
  };

  const handleClear = () => {
    field.onChange(null);
  };

  const yearPlaceholderElement = React.useMemo(
    () => <span className="text-muted-foreground">{yearPlaceholder}</span>,
    [yearPlaceholder],
  );

  const monthPlaceholderElement = React.useMemo(
    () => <span className="text-muted-foreground">{monthPlaceholder}</span>,
    [monthPlaceholder],
  );

  return (
    <FormItem className="flex flex-col gap-2">
      <FormLabel>{label ?? ""}</FormLabel>
      <div className="flex gap-2">
        <CommonSelect
          value={selectedYear ?? ""}
          onValueChange={handleYearChange}
          placeholder={yearPlaceholderElement}
          className={yearTriggerClassName}
          options={YEAR_OPTIONS}
        />
        <CommonSelect
          value={selectedMonth ?? ""}
          onValueChange={handleMonthChange}
          placeholder={monthPlaceholderElement}
          className={monthTriggerClassName}
          options={MONTH_OPTIONS}
        />
      </div>
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

YearMonthPickerContent.displayName = "YearMonthPickerContent";

export const YearMonthPickerField = <T extends FieldValues>(
  props: YearMonthPickerFieldProps<T>,
) => {
  const {
    control,
    name,
    yearPlaceholder = "年",
    monthPlaceholder = "月",
    label,
    showClearButton = true,
    yearTriggerClassName,
    monthTriggerClassName,
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <YearMonthPickerContent
          field={field}
          yearPlaceholder={yearPlaceholder}
          monthPlaceholder={monthPlaceholder}
          label={label}
          showClearButton={showClearButton}
          yearTriggerClassName={yearTriggerClassName}
          monthTriggerClassName={monthTriggerClassName}
        />
      )}
    />
  );
};
