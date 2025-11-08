import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type EditFormValues,
  type BulkEditFormValues,
  editFormSchema,
  bulkEditFormSchema,
} from "@/features/work-report/schemas/work-report-form-schemas";
import type { AttendanceData } from "@/features/work-report/types/attendance";
import { Holiday } from "@/features/holidays/types/holiday";
import { getBulkEditFormDefaults } from "@/features/work-report/utils/attendance-utils";

interface UseAttendanceFormProps {
  basicStartTime?: Date;
  basicEndTime?: Date;
  basicBreakDuration?: number;
  workReportStartDate: Date;
  workReportEndDate: Date;
}

interface UseAttendanceFormReturn {
  editForm: ReturnType<typeof useForm<EditFormValues>>;
  bulkEditForm: ReturnType<typeof useForm<BulkEditFormValues>>;
  fillBasicTime: () => void;
  resetBulkEditForm: () => void;
  applyBulkEdit: (
    values: BulkEditFormValues,
    currentAttendances: AttendanceData[],
    holidays: Holiday[],
  ) => AttendanceData[];
}

export function useAttendanceForm({
  basicStartTime,
  basicEndTime,
  basicBreakDuration,
  workReportStartDate,
  workReportEndDate,
}: UseAttendanceFormProps): UseAttendanceFormReturn {
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      startTime: undefined,
      endTime: undefined,
      breakDuration: undefined,
      memo: "",
    },
  });

  const bulkEditForm = useForm<BulkEditFormValues>({
    resolver: zodResolver(bulkEditFormSchema),
    defaultValues: getBulkEditFormDefaults(
      basicStartTime ?? null,
      basicEndTime ?? null,
      basicBreakDuration ?? null,
      workReportStartDate,
      workReportEndDate,
    ),
  });

  // Fill basic time for edit form
  const fillBasicTime = useCallback(() => {
    if (basicStartTime) {
      editForm.setValue("startTime", basicStartTime);
    }
    if (basicEndTime) {
      editForm.setValue("endTime", basicEndTime);
    }
    if (basicBreakDuration !== undefined) {
      editForm.setValue("breakDuration", basicBreakDuration);
    }
  }, [basicStartTime, basicEndTime, basicBreakDuration, editForm]);

  // Reset bulk edit form
  const resetBulkEditForm = useCallback(() => {
    bulkEditForm.reset(
      getBulkEditFormDefaults(
        basicStartTime ?? null,
        basicEndTime ?? null,
        basicBreakDuration ?? null,
        workReportStartDate,
        workReportEndDate,
      ),
    );
  }, [
    bulkEditForm,
    basicStartTime,
    basicEndTime,
    basicBreakDuration,
    workReportStartDate,
    workReportEndDate,
  ]);

  // Apply bulk edit
  const applyBulkEdit = useCallback(
    (
      values: BulkEditFormValues,
      currentAttendances: AttendanceData[],
      holidays: Holiday[],
    ): AttendanceData[] => {
      const isHoliday = (date: Date): boolean => {
        const dateStr = date.toISOString().split("T")[0];
        return holidays.some((holiday) => holiday.date === dateStr);
      };

      return currentAttendances.map((attendance) => {
        const dayOfWeek = attendance.date.getDay();

        // Check if this day should be updated
        const shouldUpdate =
          values.selectedDays?.includes(dayOfWeek) &&
          (!values.excludeHolidays || !isHoliday(attendance.date));

        if (!shouldUpdate) {
          return attendance;
        }

        // Apply the bulk edit values
        return {
          ...attendance,
          startTime: values.startTime ?? attendance.startTime,
          endTime: values.endTime ?? attendance.endTime,
          breakDuration: values.breakDuration ?? attendance.breakDuration,
          memo: values.memo || attendance.memo,
        };
      });
    },
    [],
  );

  return {
    editForm,
    bulkEditForm,
    fillBasicTime,
    resetBulkEditForm,
    applyBulkEdit,
  };
}
