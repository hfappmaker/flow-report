import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTransitionContext } from "@/contexts/transition-context";
import { useMessageState } from "@/hooks/use-message-state";
import {
  calculateWorkAmount,
  calculateTotalWorkMinutes,
  formatWorkTime,
} from "@/features/contract/utils/contract-calculation-utils";
import {
  updateWorkReportAttendanceAction,
  updateWorkReportAttendancesAction,
  updateWorkReportStatusAction,
} from "@/features/work-report/actions/work-report";
import type { AttendanceData } from "@/features/work-report/types/attendance";
import type { WorkReportStatus } from "@/features/work-report/types/work-report";

interface UseWorkReportProps {
  initialAttendances: AttendanceData[];
  initialStatus: WorkReportStatus;
  contractId: string;
  workReportId: string;
  clientId: string;
  targetDate: Date;
  basicHourlyRate?: number;
  basicFixedRate?: number;
  dailyWorkMinutes?: number;
  contractType?: "HOURLY" | "FIXED";
}

interface UseWorkReportReturn {
  currentAttendances: AttendanceData[];
  setCurrentAttendances: (attendances: AttendanceData[]) => void;
  status: WorkReportStatus;
  setStatus: (status: WorkReportStatus) => void;
  editingDate: Date | null;
  setEditingDate: (date: Date | null) => void;
  isBulkEditModalOpen: boolean;
  setIsBulkEditModalOpen: (open: boolean) => void;
  error: { message: string; date: Date };
  success: { message: string; date: Date };
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  startTransition: (callback: () => void) => void;
  setManualPending: (pending: boolean) => void;
  totalWorkMinutes: number;
  workTimeText: string;
  amountCalculation: ReturnType<typeof calculateWorkAmount> | null;
  workReportStartDate: Date;
  workReportEndDate: Date;
  handleNavigateToList: () => void;
  handleConfirmStatusChange: () => Promise<void>;
  updateAttendance: (attendance: AttendanceData) => Promise<void>;
  updateAllAttendances: () => Promise<void>;
}

export function useWorkReport({
  initialAttendances,
  initialStatus,
  contractId,
  workReportId,
  clientId,
  targetDate,
  basicHourlyRate,
  basicFixedRate,
  dailyWorkMinutes,
  contractType,
}: UseWorkReportProps): UseWorkReportReturn {
  const router = useRouter();
  const { error, success, showError, showSuccess } = useMessageState();
  const { startTransition, setManualPending } = useTransitionContext();

  // State management
  const [currentAttendances, setCurrentAttendances] = useState<AttendanceData[]>(initialAttendances);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [status, setStatus] = useState<WorkReportStatus>(initialStatus);

  // Calculations
  const totalWorkMinutes = calculateTotalWorkMinutes(currentAttendances);
  const workTimeText = formatWorkTime(totalWorkMinutes);

  const amountCalculation =
    (basicHourlyRate !== undefined && basicHourlyRate !== null) ||
    (basicFixedRate !== undefined && basicFixedRate !== null)
      ? calculateWorkAmount({
          totalWorkMinutes,
          hourlyRate: basicHourlyRate ?? 0,
          fixedRate: basicFixedRate ?? 0,
          contractType: contractType ?? "HOURLY",
        })
      : null;

  // Date calculations
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const workReportStartDate = new Date(year, month, 1);
  const workReportEndDate = new Date(year, month + 1, 0);

  // Navigation
  const handleNavigateToList = useCallback(() => {
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    router.push(`/contracts?year=${targetYear}&month=${targetMonth}&contractId=${contractId}`);
  }, [router, targetDate, contractId]);

  // Status change handler
  const handleConfirmStatusChange = useCallback(async () => {
    const newStatus = status === "SUBMITTED" ? "DRAFT" : "SUBMITTED";

    try {
      const result = await updateWorkReportStatusAction({
        workReportId,
        status: newStatus,
      });

      if (result.success) {
        setStatus(newStatus);
        showSuccess(
          newStatus === "SUBMITTED"
            ? "月締めを完了しました"
            : "月締めを解除しました"
        );
      } else {
        showError(result.message ?? "ステータスの更新に失敗しました");
      }
    } catch (err) {
      showError("ステータスの更新中にエラーが発生しました");
    }
  }, [status, workReportId, setStatus, showSuccess, showError]);

  // Update single attendance
  const updateAttendance = useCallback(async (attendance: AttendanceData) => {
    const result = await updateWorkReportAttendanceAction({
      workReportId,
      attendance: {
        date: attendance.date,
        startTime: attendance.startTime,
        endTime: attendance.endTime,
        breakDuration: attendance.breakDuration,
        memo: attendance.memo || "",
      },
    });

    if (result.success) {
      setCurrentAttendances((prev) =>
        prev.map((a) =>
          a.date.getTime() === attendance.date.getTime() ? attendance : a
        )
      );
      showSuccess("勤怠情報を更新しました");
    } else {
      showError(result.message ?? "勤怠情報の更新に失敗しました");
    }
  }, [workReportId, setCurrentAttendances, showSuccess, showError]);

  // Update all attendances
  const updateAllAttendances = useCallback(async () => {
    const result = await updateWorkReportAttendancesAction({
      workReportId,
      attendances: currentAttendances.map((attendance) => ({
        date: attendance.date,
        startTime: attendance.startTime,
        endTime: attendance.endTime,
        breakDuration: attendance.breakDuration,
        memo: attendance.memo || "",
      })),
    });

    if (result.success) {
      showSuccess("すべての勤怠情報を更新しました");
    } else {
      showError(result.message ?? "勤怠情報の更新に失敗しました");
    }
  }, [workReportId, currentAttendances, showSuccess, showError]);

  return {
    currentAttendances,
    setCurrentAttendances,
    status,
    setStatus,
    editingDate,
    setEditingDate,
    isBulkEditModalOpen,
    setIsBulkEditModalOpen,
    error,
    success,
    showError,
    showSuccess,
    startTransition,
    setManualPending,
    totalWorkMinutes,
    workTimeText,
    amountCalculation,
    workReportStartDate,
    workReportEndDate,
    handleNavigateToList,
    handleConfirmStatusChange,
    updateAttendance,
    updateAllAttendances,
  };
}