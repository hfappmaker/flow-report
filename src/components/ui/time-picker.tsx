import { useId, useMemo } from "react";
import { Control, Path, FieldValues } from "react-hook-form";

import { Button } from "./button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";

// 共通の型定義
interface TimePickerFieldProps<T extends FieldValues, V> {
  control: Control<T>;
  name: {
    [P in Path<T>]: T[P] extends V | null ? P : never;
  }[Path<T>];
  minuteStep?: number;
  showClearButton?: boolean;
  showFormMessage?: boolean;
  label: string;
}

const inputClassName =
  "flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

// minuteStepに基づいて時刻の選択肢を生成
const generateTimeOptions = (minuteStep: number): string[] => {
  const options: string[] = [];
  const totalMinutesInDay = 24 * 60;
  for (let i = 0; i < totalMinutesInDay; i += minuteStep) {
    const hours = Math.floor(i / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (i % 60).toString().padStart(2, "0");
    options.push(`${hours}:${minutes}`);
  }
  return options;
};

// Date型用のTimePickerField
export function TimePickerFieldForDate<T extends FieldValues>({
  control,
  name,
  minuteStep = 1,
  showClearButton = true,
  showFormMessage = true,
  label,
}: TimePickerFieldProps<T, Date>) {
  const datalistId = useId();
  const timeOptions = useMemo(
    () => generateTimeOptions(minuteStep),
    [minuteStep],
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Date → HH:MM形式に変換
        const timeValue =
          field.value !== null && field.value !== undefined
            ? (() => {
                const date = new Date(field.value as Date);
                const hours = date.getUTCHours().toString().padStart(2, "0");
                const minutes = date
                  .getUTCMinutes()
                  .toString()
                  .padStart(2, "0");
                return `${hours}:${minutes}`;
              })()
            : "";

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (value === "") {
            field.onChange(null);
          } else {
            const [hours, minutes] = value.split(":").map(Number);
            const newDate = new Date(Date.UTC(1970, 0, 1, hours, minutes));
            field.onChange(newDate);
          }
        };

        const handleClear = () => {
          field.onChange(null);
        };

        return (
          <FormItem className="flex flex-col space-y-2">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <input
                type="time"
                className={inputClassName}
                value={timeValue}
                onChange={handleChange}
                step={minuteStep * 60}
                autoComplete="on"
                list={datalistId}
              />
            </FormControl>
            <datalist id={datalistId}>
              {timeOptions.map((time) => (
                <option key={time} value={time} />
              ))}
            </datalist>
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
            {showFormMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}

// number型用のTimePickerField
export function TimePickerFieldForNumber<T extends FieldValues>({
  control,
  name,
  minuteStep = 1,
  showClearButton = true,
  showFormMessage = true,
  label,
}: TimePickerFieldProps<T, number>) {
  const datalistId = useId();
  const timeOptions = useMemo(
    () => generateTimeOptions(minuteStep),
    [minuteStep],
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // number(分) → HH:MM形式に変換
        const timeValue =
          field.value !== null && field.value !== undefined
            ? (() => {
                const totalMinutes = field.value as number;
                const hours = Math.floor(totalMinutes / 60)
                  .toString()
                  .padStart(2, "0");
                const minutes = (totalMinutes % 60)
                  .toString()
                  .padStart(2, "0");
                return `${hours}:${minutes}`;
              })()
            : "";

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (value === "") {
            field.onChange(null);
          } else {
            const [hours, minutes] = value.split(":").map(Number);
            const totalMinutes = hours * 60 + minutes;
            field.onChange(totalMinutes);
          }
        };

        const handleClear = () => {
          field.onChange(null);
        };

        return (
          <FormItem className="flex flex-col space-y-2">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <input
                type="time"
                className={inputClassName}
                value={timeValue}
                onChange={handleChange}
                step={minuteStep * 60}
                autoComplete="on"
                list={datalistId}
              />
            </FormControl>
            <datalist id={datalistId}>
              {timeOptions.map((time) => (
                <option key={time} value={time} />
              ))}
            </datalist>
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
            {showFormMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
