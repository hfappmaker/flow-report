"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TimePickerFieldForDate,
  TimePickerFieldForNumber,
} from "@/components/ui/time-picker";
import { type UseFormReturn } from "react-hook-form";
import type { BulkEditFormValues } from "@/features/work-report/schemas/work-report-form-schemas";

interface BulkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<BulkEditFormValues>;
  onSubmit: (values: BulkEditFormValues) => void;
  onReset: () => void;
  dailyWorkMinutes?: number;
  workReportStartDate: Date;
  workReportEndDate: Date;
}

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

export function BulkEditDialog({
  isOpen,
  onClose,
  form,
  onSubmit,
  onReset,
  dailyWorkMinutes = 15,
  workReportStartDate,
  workReportEndDate,
}: BulkEditDialogProps) {
  const handleClose = () => {
    onReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>一括入力</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {/* 期間指定 */}
            <div>
              <h3 className="mb-2 text-sm font-medium">期間指定</h3>
              <div className="flex flex-wrap items-end gap-4">
                <DatePickerField
                  control={form.control}
                  name="startDate"
                  label="開始日"
                  min={workReportStartDate.toISOString().split("T")[0]}
                  max={workReportEndDate.toISOString().split("T")[0]}
                />
                <DatePickerField
                  control={form.control}
                  name="endDate"
                  label="終了日"
                  min={workReportStartDate.toISOString().split("T")[0]}
                  max={workReportEndDate.toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* 曜日を選択 */}
            <div className="py-2">
              <h3 className="mb-2 text-sm font-medium">曜日を選択</h3>
              <FormField
                control={form.control}
                name="selectedDays"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {dayNames.map((day, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`day-${String(index)}`}
                              checked={field.value?.includes(index)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value ?? [];
                                if (checked) {
                                  field.onChange([...currentValue, index]);
                                } else {
                                  field.onChange(
                                    currentValue.filter((d) => d !== index),
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`day-${String(index)}`}>
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 祝日除外チェックボックス */}
            <div className="py-2">
              <FormField
                control={form.control}
                name="excludeHolidays"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? undefined}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      祝日は除く
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* 勤怠情報 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">勤怠情報</h3>
              <div className="flex flex-wrap gap-4">
                <TimePickerFieldForDate
                  control={form.control}
                  name="startTime"
                  showClearButton={false}
                  minuteStep={dailyWorkMinutes}
                  label="出勤時間"
                />
                <TimePickerFieldForDate
                  control={form.control}
                  name="endTime"
                  showClearButton={false}
                  minuteStep={dailyWorkMinutes}
                  label="退勤時間"
                />
                <TimePickerFieldForNumber
                  control={form.control}
                  name="breakDuration"
                  showClearButton={false}
                  minuteStep={dailyWorkMinutes}
                  label="休憩時間"
                />
                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>作業内容</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className="w-full max-w-[400px]"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                className="w-full sm:w-auto"
              >
                キャンセル
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                適用
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
