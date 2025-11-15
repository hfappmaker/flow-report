"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ExcelJS from "exceljs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Resolver, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TimePickerFieldForDate,
  TimePickerFieldForNumber,
} from "@/components/ui/time-picker";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  calculateWorkAmount,
  calculateTotalWorkMinutes,
  formatWorkTime,
  formatAmount,
} from "@/features/contract/utils/contract-calculation-utils";
import { getFreeePartnersAction } from "@/features/freee/actions/freee-accounting-actions";
import { checkFreeeConnectionAction } from "@/features/freee/actions/freee-auth-actions";
import { createFreeeInvoiceFromWorkReportAction } from "@/features/freee/actions/freee-invoice-actions";
import type { FreeePartner } from "@/features/freee/types/freee-accounting-types";
import { updateWorkReportAttendanceAction } from "@/features/work-report/actions/attendance";
import {
  updateWorkReportAttendancesAction,
  updateWorkReportStatusAction,
} from "@/features/work-report/actions/work-report";
import { AttendanceEditDialog } from "@/features/work-report/components/attendance-edit-dialog";
import { TemplateSelectionDialog } from "@/features/work-report/components/template-selection-dialog";
import { generateWorkReportExcel } from "@/features/work-report/libs/excel-report-generator";
import {
  type EditFormValues,
  type BulkEditFormValues,
  bulkEditFormSchema,
} from "@/features/work-report/schemas/work-report-form-schemas";
import { type AttendanceData } from "@/features/work-report/types/attendance";
import {
  type WorkReportClientProps,
  type WorkReportStatus,
} from "@/features/work-report/types/work-report";
import {
  generateDefaultAttendances,
  mergeAttendances,
  shouldUpdateDate,
  getBulkEditFormDefaults,
} from "@/features/work-report/utils/attendance-utils";
import { getDateColorClass } from "@/features/work-report/utils/date-display-utils";
import {
  formatWorkReportFileName,
  formatWorkReportEmailSubject,
  formatWorkReportEmailMonth,
  formatTimeInput,
  formatBreakDuration,
} from "@/features/work-report/utils/date-formatting";
import { useMessageState } from "@/hooks/use-message-state";
import { formatDateAsUTC } from "@/utils/date-utils";

export default function ClientWorkReportPage({
  contractId,
  workReportId,
  attendances,
  contractName,
  clientName,
  contactName,
  closingDay,
  userName,
  clientEmail,
  targetDate,
  dailyWorkMinutes,
  monthlyWorkMinutes,
  basicStartTime,
  basicEndTime,
  basicBreakDuration,
  basicMemo,
  holidays,
  status: initialStatus,
  unitPrice,
  settlementMin,
  settlementMax,
  upperRate,
  lowerRate,
  middleRate,
  hourlyRate,
  taxInclusiveType,
  taxRoundingType,
  rateType,
}: WorkReportClientProps) {
  const router = useRouter();
  const { error, success, showError, showSuccess } = useMessageState();
  const { startTransition, setManualPending } = useTransitionContext();

  // モーダルの状態管理
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [defaultValuesForEdit, setDefaultValuesForEdit] = useState<
    Partial<EditFormValues> | undefined
  >(undefined);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [showReauthDialog, setShowReauthDialog] = useState(false);

  // freee連携状態
  const [isFreeeConnected, setIsFreeeConnected] = useState(false);
  const [isCheckingFreeeConnection, setIsCheckingFreeeConnection] =
    useState(true);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // freee取引先関連
  const [partners, setPartners] = useState<FreeePartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<
    number | undefined
  >();
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  const [status, setStatus] = useState<WorkReportStatus>(initialStatus);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Compute default attendance values for each day in the range…
  const defaults = generateDefaultAttendances(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    closingDay,
  );

  const initialAttendances = mergeAttendances(defaults, attendances);

  const [currentAttendances, setCurrentAttendances] =
    useState<AttendanceData[]>(initialAttendances);

  // 作業報告書の開始日と終了日を計算
  const workReportStartDate = currentAttendances[0]?.date || new Date();
  const workReportEndDate =
    currentAttendances[currentAttendances.length - 1]?.date || new Date();

  // Calculate work hours and amounts for summary
  const totalWorkMinutes = useMemo(
    () => calculateTotalWorkMinutes(currentAttendances),
    [currentAttendances],
  );

  const workTimeText = useMemo(
    () => formatWorkTime(totalWorkMinutes),
    [totalWorkMinutes],
  );

  // Calculate work time for a single attendance in minutes
  const calculateAttendanceWorkMinutes = useCallback(
    (
      startTime: Date | null,
      endTime: Date | null,
      breakDuration: number | null,
    ): number | null => {
      if (!startTime || !endTime) return null;
      const workMinutes =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      const breakMinutes = breakDuration ?? 0;
      return Math.max(0, workMinutes - breakMinutes);
    },
    [],
  );

  const amountCalculation = useMemo(
    () =>
      calculateWorkAmount(totalWorkMinutes, {
        unitPrice,
        settlementMin,
        settlementMax,
        upperRate,
        lowerRate,
        middleRate,
        hourlyRate,
        taxInclusiveType,
        taxRoundingType,
        rateType,
      }),
    [
      totalWorkMinutes,
      unitPrice,
      settlementMin,
      settlementMax,
      upperRate,
      lowerRate,
      middleRate,
      hourlyRate,
      taxInclusiveType,
      taxRoundingType,
      rateType,
    ],
  );

  // 一括編集用フォーム
  const bulkEditForm = useForm<BulkEditFormValues>({
    resolver: zodResolver(bulkEditFormSchema) as Resolver<BulkEditFormValues>,
    defaultValues: getBulkEditFormDefaults(
      basicStartTime,
      basicEndTime,
      basicBreakDuration,
      basicMemo,
      workReportStartDate,
      workReportEndDate,
    ),
  });

  // 作業報告書一覧画面へ遷移
  const handleNavigateToList = () => {
    startTransition(() => {
      router.push(`/contract/${contractId}`);
    });
  };

  // 一括編集フォームをリセットする関数を追加
  const resetBulkEditForm = () => {
    bulkEditForm.reset(
      getBulkEditFormDefaults(
        basicStartTime,
        basicEndTime,
        basicBreakDuration,
        basicMemo,
        workReportStartDate,
        workReportEndDate,
      ),
    );
    setIsBulkEditModalOpen(false);
  };

  // 曜日名の配列
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  // 一括編集を適用する
  const applyBulkEdit = useCallback(
    (data: BulkEditFormValues) => {
      startTransition(() => {
        void (async () => {
          // startDateとendDateはバリデーションで必須なので、ここではnullではない
          if (!data.startDate || !data.endDate) {
            return;
          }

          const startDate = data.startDate;
          const endDate = data.endDate;

          const updatedValues = currentAttendances.map((attendance) => {
            const shouldUpdate = shouldUpdateDate(
              attendance.date,
              data.selectedDays,
              startDate,
              endDate,
              data.excludeHolidays,
              holidays,
            );
            if (shouldUpdate) {
              return {
                ...attendance,
                startTime: data.startTime,
                endTime: data.endTime,
                breakDuration: data.breakDuration,
                memo: data.memo,
              };
            }
            return attendance;
          });
          await updateWorkReportAttendancesAction(
            workReportId,
            updatedValues.map((attendance) => ({
              ...attendance,
              workReportId: workReportId,
            })),
          );
          setCurrentAttendances(updatedValues);
          resetBulkEditForm();
          showSuccess("一括編集を適用しました");
        })();
      });
    },
    [
      currentAttendances,
      holidays,
      workReportId,
      startTransition,
      resetBulkEditForm,
      showSuccess,
    ],
  );

  // 編集フォームの送信処理
  const onEditSubmit = useCallback(
    async (date: Date, data: EditFormValues) => {
      try {
        startTransition(() => {
          void (async () => {
            const updatedValues = currentAttendances.map((attendance) => {
              if (attendance.date.getTime() === date.getTime()) {
                return {
                  ...attendance,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  breakDuration: data.breakDuration,
                  memo: data.memo,
                };
              }
              return attendance;
            });
            // フォームの値を更新
            const attendance = updatedValues.find(
              (attendance) => attendance.date.getTime() === date.getTime(),
            );
            if (attendance) {
              await updateWorkReportAttendanceAction(
                workReportId,
                attendance.date,
                {
                  ...attendance,
                  workReportId: workReportId,
                },
              );
            }
            setCurrentAttendances(updatedValues);
            setEditingDate(null);
          })();
        });
        showSuccess("編集を適用しました");
      } catch (error) {
        console.error("編集の適用に失敗しました", error);
        showError("編集の適用に失敗しました");
      }
    },
    [currentAttendances, workReportId, startTransition, showSuccess, showError],
  );

  // openEditDialog関数を簡略化
  const openEditDialog = (date: Date) => {
    const attendance = currentAttendances.find(
      (att) => att.date.getTime() === date.getTime(),
    );
    if (attendance) {
      setDefaultValuesForEdit({
        startTime: attendance.startTime,
        endTime: attendance.endTime,
        breakDuration: attendance.breakDuration,
        memo: attendance.memo,
      });
    }
    setEditingDate(date);
  };

  // freee連携状態をチェック
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingFreeeConnection(true);
      try {
        const connected = await checkFreeeConnectionAction();
        setIsFreeeConnected(connected);
      } catch (error) {
        console.error("Failed to check freee connection:", error);
      } finally {
        setIsCheckingFreeeConnection(false);
      }
    };

    void checkConnection();

    // OAuth コールバックから戻ってきた場合の処理
    const params = new URLSearchParams(window.location.search);
    if (params.get("freee_connected") === "true") {
      setIsFreeeConnected(true);
      showSuccess("freeeとの連携が完了しました");
      // URLパラメータをクリア
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error") === "freee_auth_failed") {
      showError("freee連携に失敗しました");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error") === "freee_auth_denied") {
      showError("freee連携がキャンセルされました");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showSuccess, showError]);

  // 請求書ダイアログが開いた時に取引先一覧を取得
  useEffect(() => {
    if (isInvoiceDialogOpen && isFreeeConnected && partners.length === 0) {
      const fetchPartners = async () => {
        setIsLoadingPartners(true);
        try {
          const result = await getFreeePartnersAction();
          if (result.success && result.partners) {
            setPartners(result.partners);
            // clientName に一致する取引先があれば自動選択
            const matchingPartner = result.partners.find(
              (p) => p.name === clientName,
            );
            if (matchingPartner) {
              setSelectedPartnerId(matchingPartner.id);
            }
          } else {
            // 再連携が必要な場合
            if (result.requiresReauth) {
              setIsFreeeConnected(false);
              showError(result.message);
              setIsInvoiceDialogOpen(false);
              setShowReauthDialog(true);
            } else {
              showError(result.message);
            }
          }
        } catch (error) {
          console.error("Failed to fetch partners:", error);
          showError("取引先一覧の取得に失敗しました");
        } finally {
          setIsLoadingPartners(false);
        }
      };

      void fetchPartners();
    }
  }, [
    isInvoiceDialogOpen,
    isFreeeConnected,
    partners.length,
    clientName,
    showError,
  ]);

  // テンプレートからの作業報告書作成
  const createReportFromTemplate = async (
    templateWorkbook: ExcelJS.Workbook,
  ) => {
    try {
      const blob = await generateWorkReportExcel(templateWorkbook, {
        attendances: currentAttendances,
        targetDate,
        userName,
        basicStartTime,
        basicEndTime,
        basicBreakDuration,
        dailyWorkMinutes,
        monthlyWorkMinutes,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = formatWorkReportFileName(targetDate, userName);
      link.click();
      window.URL.revokeObjectURL(url);
      showSuccess("テンプレートからの作業報告書作成が完了しました");
    } catch (err) {
      console.error("Error creating report from template:", err);
      showError("テンプレートからの作業報告書作成に失敗しました");
    }
  };

  // メール送信用の関数を追加
  const createReportAndSendEmail = () => {
    try {
      if (
        !window.confirm(
          "作業報告書は自動で添付されません。\n「作業報告書を作成」でダウンロードしたファイルを手動で添付してください。",
        )
      ) {
        return;
      }
      // メーラーを起動
      const recipient = clientEmail; // 送信先
      const subject = encodeURIComponent(
        formatWorkReportEmailSubject(targetDate, userName),
      );
      const body = encodeURIComponent(`
${contactName ? contactName : clientName}様

お世話になっております。${userName}です。

${formatWorkReportEmailMonth(targetDate)}の作業報告書を送付いたします。
ご確認のほど、よろしくお願いいたします。
`);
      window.open(
        `mailto:${recipient}?subject=${subject}&body=${body}`,
        "_blank",
      );
    } catch (error) {
      console.error("作業報告書の作成に失敗しました", error);
      showError("作業報告書の作成に失敗しました");
    }
  };

  const handleConfirmCreateReport = async (
    customWorkbook: ExcelJS.Workbook | null,
  ) => {
    try {
      let workbook: ExcelJS.Workbook;

      if (customWorkbook) {
        // Use custom template
        workbook = customWorkbook;
      } else {
        // Use default template
        const response = await fetch("/work-report-default-template.xlsx");
        if (!response.ok) {
          throw new Error("デフォルトテンプレートの取得に失敗しました");
        }
        const buffer = await response.arrayBuffer();
        workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
      }

      await createReportFromTemplate(workbook);
    } catch (err) {
      console.error("テンプレートの読み込みに失敗しました:", err);
      showError("テンプレートの読み込みに失敗しました");
      return;
    }
  };

  // 月締め処理を実行
  const handleConfirmStatusChange = () => {
    const nextStatus = status === "DRAFT" ? "SUBMITTED" : "DRAFT";
    startTransition(() => {
      void (async () => {
        try {
          await updateWorkReportStatusAction(workReportId, nextStatus);
          setStatus(nextStatus);
          showSuccess(
            nextStatus === "SUBMITTED"
              ? "月締めしました"
              : "月締め解除しました",
          );
        } catch {
          showError("月締めステータスの変更に失敗しました");
        }
      })();
    });
    setStatus(nextStatus);
  };

  // freee請求書作成処理
  const handleCreateFreeeInvoice = async () => {
    if (!isFreeeConnected) {
      // freee連携ページへリダイレクト
      const returnTo = encodeURIComponent(window.location.pathname);
      window.location.href = `/api/auth/freee/authorize?returnTo=${returnTo}`;
      return;
    }

    // 取引先選択チェック
    if (!selectedPartnerId) {
      showError("取引先を選択してください");
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const result = await createFreeeInvoiceFromWorkReportAction(
        workReportId,
        selectedPartnerId,
      );

      if (result.success) {
        showSuccess(result.message);
        if (result.invoiceUrl) {
          // 請求書URLをクリップボードにコピー（エラーが発生しても継続）
          try {
            await navigator.clipboard.writeText(result.invoiceUrl);
            showSuccess("請求書URLをクリップボードにコピーしました");
          } catch (clipboardError) {
            console.warn("Failed to copy to clipboard:", clipboardError);
            // クリップボードエラーは致命的ではないので処理を継続
          }

          // freee請求書ページを新しいタブで開く
          window.open(result.invoiceUrl, "_blank");
        }
        setIsInvoiceDialogOpen(false);
      } else {
        // 再連携が必要な場合
        if (result.requiresReauth) {
          setIsFreeeConnected(false);
          showError(result.message);
          setIsInvoiceDialogOpen(false);
          setShowReauthDialog(true);
        } else {
          showError(result.message);
        }
      }
    } catch (error) {
      console.error("Failed to create freee invoice:", error);
      showError("請求書の作成中にエラーが発生しました");
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  return (
    <div className="mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-muted-foreground">
          {contractName}の{targetDate.getFullYear()}年
          {targetDate.getMonth() + 1}
          月度作業報告書
        </h1>
        <Button type="button" onClick={handleNavigateToList}>
          作業報告書一覧へ
        </Button>
      </div>
      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess
        message={success.message}
        resetSignal={success.date.getTime()}
      />

      {/* Work Hours and Amount Summary */}
      <div className="mb-6 rounded-lg border bg-muted/30 p-4">
        <h2 className="mb-3 text-lg font-semibold">稼働時間・金額サマリー</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">稼働時間:</span>
            <div className="text-base font-semibold">{workTimeText}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">税抜金額:</span>
            <div className="text-base font-semibold">
              {amountCalculation
                ? formatAmount(amountCalculation.baseAmount)
                : "¥---,---"}
            </div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">税込金額:</span>
            <div className="text-base font-semibold">
              {amountCalculation
                ? formatAmount(
                    amountCalculation.baseAmount + amountCalculation.taxAmount,
                  )
                : "¥---,---"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="mb-2 flex justify-end">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleConfirmStatusChange}
            >
              {status === "SUBMITTED" ? "月締め解除" : "月締め"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={status === "SUBMITTED"}
              onClick={() => {
                setIsBulkEditModalOpen(true);
              }}
            >
              一括入力
            </Button>
          </div>
        </div>
        <div className="mb-4 flex justify-end">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={status !== "SUBMITTED"}
              onClick={() => {
                setIsTemplateDialogOpen(true);
              }}
            >
              作業報告書を作成
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={status !== "SUBMITTED"}
              onClick={() => {
                const returnTo = encodeURIComponent(window.location.pathname);
                setManualPending(true);
                window.location.href = `/api/auth/freee/authorize?returnTo=${returnTo}`;
              }}
            >
              freee連携
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={status !== "SUBMITTED"}
              onClick={() => {
                setIsInvoiceDialogOpen(true);
              }}
            >
              請求書作成
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={status !== "SUBMITTED"}
              onClick={createReportAndSendEmail}
            >
              メール送信
            </Button>
          </div>
        </div>

        {/* Header for desktop view */}
        <div className="mb-2 hidden items-center px-3 text-sm font-medium text-muted-foreground lg:grid lg:grid-cols-[minmax(0,_1fr)_120px_120px_120px_120px_minmax(0,_2fr)_100px] lg:gap-4">
          <span>日付</span>
          <span>出勤時間</span>
          <span>退勤時間</span>
          <span>休憩時間</span>
          <span>稼働時間</span>
          <span>作業内容</span>
          <span />
        </div>

        {currentAttendances.map((day) => (
          <div
            key={day.date.toISOString()}
            className="mb-4 rounded-lg border p-3 lg:grid lg:grid-cols-[minmax(0,_1fr)_120px_120px_120px_120px_minmax(0,_2fr)_100px] lg:items-center lg:gap-4"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="lg:hidden"
                disabled={status === "SUBMITTED"}
                onClick={() => {
                  openEditDialog(day.date);
                }}
              >
                編集
              </Button>
            </div>

            {/* Inputs */}
            <div className="mt-3 space-y-3 lg:mt-0 lg:contents">
              <div className="flex flex-wrap gap-2 lg:contents">
                {/* Start time */}
                <div className="w-[calc(50%-0.25rem)] lg:col-span-1 lg:w-auto">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground lg:hidden">
                    出勤時間
                  </label>
                  <Input
                    type="time"
                    id={`start-${day.date.toISOString()}`}
                    readOnly
                    value={formatTimeInput(day.startTime)}
                  />
                </div>
                {/* End time */}
                <div className="w-[calc(50%-0.25rem)] lg:col-span-1 lg:w-auto">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground lg:hidden">
                    退勤時間
                  </label>
                  <Input
                    type="time"
                    id={`end-${day.date.toISOString()}`}
                    readOnly
                    value={formatTimeInput(day.endTime)}
                  />
                </div>
                {/* Break time */}
                <div className="w-[calc(50%-0.25rem)] lg:col-span-1 lg:w-auto">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground lg:hidden">
                    休憩時間
                  </label>
                  <Input
                    type="time"
                    id={`break-${day.date.toISOString()}`}
                    readOnly
                    value={formatBreakDuration(day.breakDuration)}
                  />
                </div>
                {/* Work time */}
                <div className="w-[calc(50%-0.25rem)] lg:col-span-1 lg:w-auto">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground lg:hidden">
                    稼働時間
                  </label>
                  <Input
                    type="time"
                    id={`work-${day.date.toISOString()}`}
                    readOnly
                    value={formatBreakDuration(
                      calculateAttendanceWorkMinutes(
                        day.startTime,
                        day.endTime,
                        day.breakDuration,
                      ),
                    )}
                  />
                </div>
                {/* Memo */}
                <div className="lg:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground lg:hidden">
                    作業内容
                  </label>
                  <Input
                    type="text"
                    id={`memo-${day.date.toISOString()}`}
                    readOnly
                    value={day.memo ?? ""}
                  />
                </div>
              </div>
            </div>
            {/* Edit Button (Desktop) */}
            <div className="hidden text-center lg:col-span-1 lg:block">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={status === "SUBMITTED"}
                onClick={() => {
                  openEditDialog(day.date);
                }}
              >
                編集
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 一括編集用モーダルダイアログ */}
      <Dialog
        open={isBulkEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetBulkEditForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>勤怠情報の一括入力</DialogTitle>
          </DialogHeader>
          <Form {...bulkEditForm}>
            <form
              onSubmit={(e) => {
                void bulkEditForm.handleSubmit(applyBulkEdit)(e);
              }}
              className="space-y-4"
            >
              {/* 適用する期間 */}
              <div>
                <h3 className="mb-2 text-sm font-medium">適用する期間</h3>
                <div className="grid grid-cols-2 gap-4">
                  <DatePickerField
                    control={bulkEditForm.control}
                    name="startDate"
                    label="開始日"
                    placeholder="開始日を選択"
                    min={workReportStartDate.toISOString().split("T")[0]}
                    max={workReportEndDate.toISOString().split("T")[0]}
                  />
                  <DatePickerField
                    control={bulkEditForm.control}
                    name="endDate"
                    label="終了日"
                    placeholder="終了日を選択"
                    min={workReportStartDate.toISOString().split("T")[0]}
                    max={workReportEndDate.toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* 曜日を選択 */}
              <div className="py-2">
                <h3 className="mb-2 text-sm font-medium">曜日を選択</h3>
                <FormField
                  control={bulkEditForm.control}
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
                  control={bulkEditForm.control}
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
                    control={bulkEditForm.control}
                    name="startTime"
                    showClearButton={false}
                    minuteStep={dailyWorkMinutes}
                    label="出勤時間"
                  />
                  <TimePickerFieldForDate
                    control={bulkEditForm.control}
                    name="endTime"
                    showClearButton={false}
                    minuteStep={dailyWorkMinutes}
                    label="退勤時間"
                  />
                  <TimePickerFieldForNumber
                    control={bulkEditForm.control}
                    name="breakDuration"
                    showClearButton={false}
                    minuteStep={dailyWorkMinutes}
                    label="休憩時間"
                  />
                  <FormField
                    control={bulkEditForm.control}
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
                  onClick={resetBulkEditForm}
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

      {/* 編集用モーダルダイアログ */}
      <AttendanceEditDialog
        key={editingDate?.toISOString() ?? "closed"}
        isOpen={editingDate !== null}
        onClose={() => { setEditingDate(null); }}
        selectedDate={editingDate ?? new Date()}
        onSubmit={onEditSubmit}
        defaultValues={defaultValuesForEdit}
        basicStartTime={basicStartTime}
        basicEndTime={basicEndTime}
        basicBreakDuration={basicBreakDuration}
        basicMemo={basicMemo}
        dailyWorkMinutes={dailyWorkMinutes}
        holidays={holidays}
      />

      {/* 請求書作成ダイアログ */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>freee請求書作成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isCheckingFreeeConnection ? (
              <p className="text-center text-muted-foreground">
                freee連携状態を確認中...
              </p>
            ) : !isFreeeConnected ? (
              <>
                <p className="text-muted-foreground">
                  freeeとの連携が必要です。
                </p>
                <p className="text-sm text-muted-foreground">
                  freeeアカウントと連携すると、作業報告書から請求書を作成できます。
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsInvoiceDialogOpen(false);
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner-select">取引先（必須）</Label>
                    {isLoadingPartners ? (
                      <p className="text-sm text-muted-foreground">
                        取引先を読み込み中...
                      </p>
                    ) : (
                      <Select
                        value={selectedPartnerId?.toString()}
                        onValueChange={(value) => {
                          setSelectedPartnerId(parseInt(value, 10));
                        }}
                      >
                        <SelectTrigger id="partner-select">
                          <SelectValue placeholder="取引先を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {partners.map((partner) => (
                            <SelectItem
                              key={partner.id}
                              value={partner.id.toString()}
                            >
                              {partner.name}
                              {partner.code ? ` (${partner.code})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      以下の内容でfreee請求書を作成します：
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      <li>
                        対象月: {targetDate.getFullYear()}年
                        {targetDate.getMonth() + 1}月度
                      </li>
                      <li>
                        取引先:{" "}
                        {selectedPartnerId
                          ? (partners.find((p) => p.id === selectedPartnerId)
                              ?.name ?? clientName)
                          : "未選択"}
                      </li>
                      <li>稼働時間: {workTimeText}</li>
                      <li>
                        金額:{" "}
                        {amountCalculation
                          ? formatAmount(
                              amountCalculation.baseAmount +
                                amountCalculation.taxAmount,
                            )
                          : "---"}
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      ※ freee上でドラフト（下書き）として作成されます
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsInvoiceDialogOpen(false);
                    }}
                    disabled={isCreatingInvoice}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      startTransition(() => {
                        void handleCreateFreeeInvoice();
                      });
                    }}
                    disabled={isCreatingInvoice || !selectedPartnerId}
                  >
                    {isCreatingInvoice ? "作成中..." : "作成"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* freee再連携促進ダイアログ */}
      <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>freee再連携が必要です</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              freee連携の有効期限が切れています。左側の「freee連携」ボタンから再度連携してください。
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                setShowReauthDialog(false);
              }}
            >
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TemplateSelectionDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onConfirm={handleConfirmCreateReport}
      />
    </div>
  );
}
