"use client";

import { Button } from "@/components/ui/button";
import { formatDateAsUTC } from "@/utils/date-utils";
import { formatTime } from "@/features/work-report/utils/attendance-utils";
import type { AttendanceData } from "@/features/work-report/types/attendance";
import type { WorkReportStatus } from "@/features/work-report/types/work-report";
import { Holiday } from "@/features/holidays/types/holiday";

interface AttendanceListProps {
  attendances: AttendanceData[];
  status: WorkReportStatus;
  holidays: Holiday[];
  onEdit: (date: Date) => void;
}

const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateStr = date.toISOString().split("T")[0];
  return holidays.some((holiday) => holiday.date === dateStr);
}

function getDateColorClass(date: Date, holidays: Holiday[]): string {
  const dayOfWeek = date.getDay();

  if (isHoliday(date, holidays)) {
    return "text-red-600";
  }

  if (dayOfWeek === 0) {
    return "text-red-600";
  }

  if (dayOfWeek === 6) {
    return "text-blue-600";
  }

  return "";
}

export function AttendanceList({
  attendances,
  status,
  holidays,
  onEdit,
}: AttendanceListProps) {
  const isSubmitted = status === "SUBMITTED";

  return (
    <>
      {/* Header for desktop view */}
      <div className="mb-2 hidden items-center px-3 text-sm font-medium text-muted-foreground lg:grid lg:grid-cols-[minmax(0,_1fr)_120px_120px_120px_minmax(0,_2fr)_100px] lg:gap-4">
        <span>日付</span>
        <span>出勤時間</span>
        <span>退勤時間</span>
        <span>休憩時間</span>
        <span>作業内容</span>
        <span />
      </div>

      {attendances.map((day) => (
        <div
          key={day.date.toISOString()}
          className="mb-4 rounded-lg border p-3 lg:grid lg:grid-cols-[minmax(0,_1fr)_120px_120px_120px_minmax(0,_2fr)_100px] lg:items-center lg:gap-4"
        >
          {/* Date */}
          <div className="flex items-center justify-between lg:col-span-1">
            <span className="text-sm font-medium">
              {(() => {
                const date = day.date;
                const dayOfWeek = date.getDay();
                const dateStr = formatDateAsUTC(date);
                const dayName = dayNames[dayOfWeek];
                const colorClass = getDateColorClass(date, holidays);

                return (
                  <>
                    {dateStr} <span className={colorClass}>({dayName})</span>
                  </>
                );
              })()}
            </span>
          </div>

          {/* Start Time */}
          <div className="mt-2 flex justify-between lg:mt-0 lg:block">
            <span className="text-sm text-muted-foreground lg:hidden">
              出勤時間:
            </span>
            <span className="text-sm">
              {day.startTime ? formatTime(day.startTime) : "-"}
            </span>
          </div>

          {/* End Time */}
          <div className="mt-1 flex justify-between lg:mt-0 lg:block">
            <span className="text-sm text-muted-foreground lg:hidden">
              退勤時間:
            </span>
            <span className="text-sm">
              {day.endTime ? formatTime(day.endTime) : "-"}
            </span>
          </div>

          {/* Break Duration */}
          <div className="mt-1 flex justify-between lg:mt-0 lg:block">
            <span className="text-sm text-muted-foreground lg:hidden">
              休憩時間:
            </span>
            <span className="text-sm">
              {day.breakDuration !== undefined && day.breakDuration !== null
                ? `${day.breakDuration}分`
                : "-"}
            </span>
          </div>

          {/* Memo */}
          <div className="mt-2 lg:mt-0">
            <span className="block text-sm text-muted-foreground lg:hidden">
              作業内容:
            </span>
            <span className="text-sm">
              {day.memo || "-"}
            </span>
          </div>

          {/* Edit Button */}
          <div className="mt-3 lg:mt-0 lg:text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(day.date)}
              disabled={isSubmitted}
            >
              編集
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}