"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TimePickerFieldForDate } from "@/components/ui/time-picker";
import { TimePickerFieldForNumber } from "@/components/ui/time-picker";
import { editFormSchema } from "@/features/work-report/schemas/work-report-form-schemas";
import { type Holiday } from "@/features/holidays/types/holiday";
import { formatDateAsUTC } from "@/utils/date-utils";

type EditFormValues = z.infer<typeof editFormSchema>;

interface AttendanceEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSubmit: (date: Date, data: EditFormValues) => void | Promise<void>;
  defaultValues?: Partial<EditFormValues>;
  basicStartTime: Date | null;
  basicEndTime: Date | null;
  basicBreakDuration: number | null;
  basicMemo: string | null;
  dailyWorkMinutes: number;
  holidays?: Holiday[];
}

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

// 祝日判定
function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format
  return holidays.some((holiday) => holiday.date === dateStr);
}

// 日付の色クラスを取得
function getDateColorClass(date: Date, holidays: Holiday[]): string {
  const dayOfWeek = date.getDay();

  // 祝日チェック
  if (isHoliday(date, holidays)) {
    return "text-red-600"; // 祝日は赤
  }

  // 日曜日
  if (dayOfWeek === 0) {
    return "text-red-600"; // 日曜日は赤
  }

  // 土曜日
  if (dayOfWeek === 6) {
    return "text-blue-600"; // 土曜日は青
  }

  // 平日
  return "";
}

export function AttendanceEditDialog({
  isOpen,
  onClose,
  selectedDate,
  onSubmit,
  defaultValues,
  basicStartTime,
  basicEndTime,
  basicBreakDuration,
  basicMemo,
  dailyWorkMinutes,
  holidays = [],
}: AttendanceEditDialogProps) {
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      startTime: defaultValues?.startTime ?? null,
      endTime: defaultValues?.endTime ?? null,
      breakDuration: defaultValues?.breakDuration ?? null,
      memo: defaultValues?.memo ?? "",
    },
  });

  // 基本時間を入力
  const fillBasicTime = () => {
    if (basicStartTime) {
      editForm.setValue("startTime", new Date(basicStartTime.toISOString()));
    }
    if (basicEndTime) {
      editForm.setValue("endTime", new Date(basicEndTime.toISOString()));
    }
    if (basicBreakDuration !== null) {
      editForm.setValue("breakDuration", basicBreakDuration);
    }
    if (basicMemo) {
      editForm.setValue("memo", basicMemo);
    }
  };

  const handleSubmit = async (data: EditFormValues) => {
    await onSubmit(selectedDate, data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>勤怠情報の入力</DialogTitle>
        </DialogHeader>
        {selectedDate && (
          <Form {...editForm}>
            <form
              onSubmit={(e) => {
                void editForm.handleSubmit(handleSubmit)(e);
              }}
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  {(() => {
                    const date = new Date(selectedDate);
                    const dayOfWeek = date.getDay();
                    const dateStr = formatDateAsUTC(date);
                    const dayName = dayNames[dayOfWeek];
                    const colorClass = getDateColorClass(date, holidays);

                    return (
                      <>
                        {dateStr}{" "}
                        <span className={colorClass}>({dayName})</span>
                        の勤怠情報を編集
                      </>
                    );
                  })()}
                </h3>
              </div>
              <div className="mb-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillBasicTime}
                  disabled={
                    !basicStartTime &&
                    !basicEndTime &&
                    !basicBreakDuration &&
                    !basicMemo
                  }
                >
                  基本時間を入力
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <TimePickerFieldForDate
                  control={editForm.control}
                  name="startTime"
                  label="出勤時間"
                  minuteStep={dailyWorkMinutes}
                />
                <TimePickerFieldForDate
                  control={editForm.control}
                  name="endTime"
                  label="退勤時間"
                  minuteStep={dailyWorkMinutes}
                />
                <TimePickerFieldForNumber
                  control={editForm.control}
                  name="breakDuration"
                  label="休憩時間"
                  minuteStep={dailyWorkMinutes}
                />
                <FormField
                  control={editForm.control}
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
                  onClick={onClose}
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
