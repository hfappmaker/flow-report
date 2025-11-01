import { useState, memo, useLayoutEffect } from "react";
import { Control, Path, FieldValues, ControllerRenderProps } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "./button";

// 共通の型定義
interface TimePickerFieldProps<T extends FieldValues, V> {
  control: Control<T>;
  name: Path<T> &
    {
      [P in Path<T>]: T[P] extends V | null ? P : never;
    }[Path<T>];
  minuteStep?: number;
  showClearButton?: boolean;
  label: string;
}

// 共通のオプション生成関数
const createTimeOptions = (minuteStep: number) => {
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const minuteOptions = Array.from(
    { length: Math.floor(60 / minuteStep) },
    (_, i) => {
      const value = (i * minuteStep).toString().padStart(2, "0");
      return {
        value,
        label: value,
      };
    },
  );

  return { hourOptions, minuteOptions };
};

const TimeSelect = memo(
  ({
    hourOptions,
    minuteOptions,
    selectedHour,
    selectedMinute,
    onHourChange,
    onMinuteChange,
  }: {
    hourOptions: { value: string; label: string }[];
    minuteOptions: { value: string; label: string }[];
    selectedHour: string;
    selectedMinute: string;
    onHourChange: (value: string) => void;
    onMinuteChange: (value: string) => void;
  }) => (
    <div className="flex items-center space-x-2">
      <FormControl>
        <Select
          value={!selectedHour && selectedMinute ? "00" : selectedHour}
          onValueChange={onHourChange}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="時" />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((hour) => (
              <SelectItem key={hour.value} value={hour.value}>
                {hour.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <span className="self-center">:</span>
      <FormControl>
        <Select
          value={!selectedMinute && selectedHour ? "00" : selectedMinute}
          onValueChange={onMinuteChange}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="分" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((minute) => (
              <SelectItem key={minute.value} value={minute.value}>
                {minute.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
    </div>
  ),
);

TimeSelect.displayName = "TimeSelect";

const TimePickerFieldContent = <T extends FieldValues, V extends number | Date>({
  field,
  minuteStep,
  showClearButton,
  valueToTime,
  timeToValue,
  label,
}: {
  field: ControllerRenderProps<T, Path<T> & { [P in Path<T>]: T[P] extends V | null ? P : never; }[Path<T>]>;
  minuteStep: number;
  showClearButton: boolean;
  valueToTime: (value: V) => { hour: string; minute: string };
  timeToValue: (hour: string, minute: string) => V;
  label: string;
}) => {
  const { hourOptions, minuteOptions } = createTimeOptions(minuteStep);
  const defaultValueTime = field.value
    ? valueToTime(field.value)
    : { hour: "", minute: "" };
  const [selectedHour, setSelectedHour] = useState(defaultValueTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(defaultValueTime.minute);

  useLayoutEffect(() => {
    // 外部からの変更のみ同期
    const time = field.value ? valueToTime(field.value) : { hour: "", minute: "" };
    setSelectedHour(time.hour);
    setSelectedMinute(time.minute);
  }, [field.value, valueToTime]);

  const handleHourChange = (newHour: string) => {
    setSelectedHour(newHour);
    const newFieldValue = timeToValue(newHour, selectedMinute || "00");
    field.onChange(newFieldValue);
  };

  const handleMinuteChange = (newMinute: string) => {
    setSelectedMinute(newMinute);
    const newFieldValue = timeToValue(selectedHour || "00", newMinute);
    field.onChange(newFieldValue);
  };

  const handleClear = () => {
    setSelectedHour("");
    setSelectedMinute("");
    field.onChange(null);
  };

  return (
    <FormItem className="flex flex-col space-y-2">
      <FormLabel>{label}</FormLabel>
      <TimeSelect
        hourOptions={hourOptions}
        minuteOptions={minuteOptions}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onHourChange={handleHourChange}
        onMinuteChange={handleMinuteChange}
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

TimePickerFieldContent.displayName = "TimePickerFieldContent";

const TimePickerFieldBase = <T extends FieldValues, V extends number | Date>({
  control,
  name,
  minuteStep = 1,
  showClearButton = true,
  valueToTime,
  timeToValue,
  label,
}: TimePickerFieldProps<T, V> & {
  valueToTime: (value: V) => { hour: string; minute: string };
  timeToValue: (hour: string, minute: string) => V;
  label: string;
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <TimePickerFieldContent
            field={field}
            minuteStep={minuteStep}
            showClearButton={showClearButton}
            valueToTime={valueToTime}
            timeToValue={timeToValue}
            label={label}
          />
        )}
      />
    </div>
  );
};

// Date型用のTimePickerField
export function TimePickerFieldForDate<T extends FieldValues>(
  props: TimePickerFieldProps<T, Date>,
) {
  return TimePickerFieldBase<T, Date>({
    ...props,
    valueToTime: (value) => {
      const realValue = value instanceof Date ? value : new Date(value);
      return {
        hour: realValue.getUTCHours().toString().padStart(2, "0"),
        minute: realValue.getUTCMinutes().toString().padStart(2, "0"),
      };
    },
    timeToValue: (hour, minute) => {
      return new Date(Date.UTC(1970, 0, 1, parseInt(hour), parseInt(minute)));
    },
  });
}

// number型用のTimePickerField
export function TimePickerFieldForNumber<T extends FieldValues>(
  props: TimePickerFieldProps<T, number>,
) {
  return TimePickerFieldBase<T, number>({
    ...props,
    valueToTime: (value) => {
      return {
        hour: Math.floor(value / 60)
          .toString()
          .padStart(2, "0"),
        minute: (value % 60).toString().padStart(2, "0"),
      };
    },
    timeToValue: (hour, minute) => {
      return parseInt(hour) * 60 + parseInt(minute);
    },
  });
}
