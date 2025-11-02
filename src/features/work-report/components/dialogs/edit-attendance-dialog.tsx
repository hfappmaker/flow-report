"use client";

import { Button } from "@/components/ui/button";
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
import {
  TimePickerFieldForDate,
  TimePickerFieldForNumber,
} from "@/components/ui/time-picker";
import { type UseFormReturn } from "react-hook-form";
import type { EditFormValues } from "@/features/work-report/schemas/work-report-form-schemas";
import { formatDateAsUTC } from "@/utils/date-utils";

interface EditAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<EditFormValues>;
  onSubmit: (values: EditFormValues) => void;
  onCancel: () => void;
  onFillBasicTime: () => void;
  editingDate: Date | null;
  dailyWorkMinutes?: number;
  hasBasicTime: boolean;
}

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

export function EditAttendanceDialog({
  isOpen,
  onClose,
  form,
  onSubmit,
  onCancel,
  onFillBasicTime,
  editingDate,
  dailyWorkMinutes = 15,
  hasBasicTime,
}: EditAttendanceDialogProps) {
  const handleClose = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>勤怠情報の編集</DialogTitle>
        </DialogHeader>
        {editingDate && (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }}
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  {(() => {
                    const date = new Date(editingDate);
                    const dayOfWeek = date.getDay();
                    return `${formatDateAsUTC(editingDate)} (${dayNames[dayOfWeek]})の勤怠情報を編集`;
                  })()}
                </h3>
              </div>

              <div className="mb-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onFillBasicTime}
                  disabled={!hasBasicTime}
                >
                  基本時間を入力
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <TimePickerFieldForDate
                  control={form.control}
                  name="startTime"
                  label="出勤時間"
                  minuteStep={dailyWorkMinutes}
                />
                <TimePickerFieldForDate
                  control={form.control}
                  name="endTime"
                  label="退勤時間"
                  minuteStep={dailyWorkMinutes}
                />
                <TimePickerFieldForNumber
                  control={form.control}
                  name="breakDuration"
                  label="休憩時間"
                  minuteStep={dailyWorkMinutes}
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

              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="w-full sm:w-auto"
                >
                  キャンセル
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  保存
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}