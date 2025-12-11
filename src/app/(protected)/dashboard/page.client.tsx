"use client";

import { Clock, FileText, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  getContractByIdAction,
  updateContractAction,
} from "@/features/contract/actions/contract";
import { ContractDetailsContent } from "@/features/contract/components/contract-details-content";
import {
  ContractDialog,
  type DialogType,
} from "@/features/contract/components/contract-dialog";
import {
  ContractForm,
  ContractFormValues,
} from "@/features/contract/components/contract-form";
import { type ContractOutput } from "@/features/contract/types/contract";
import {
  convertContractFormValuesToContract,
  convertContractToFormValues,
} from "@/features/contract/utils/contract-converter";
import {
  calculateTotalWorkMinutes,
  calculateWorkAmount,
  formatAmount,
  formatWorkTime,
} from "@/features/contract/utils/contract-calculation-utils";
import {
  type ContractDashboard,
  type DashboardClientPageProps,
  type WorkReportDashboard,
} from "@/features/dashboard/types/dashboard";
import {
  getAttendanceByWorkReportIdAndDateAction,
  updateWorkReportAttendanceAction,
} from "@/features/work-report/actions/attendance";
import { AttendanceEditDialog } from "@/features/work-report/components/attendance-edit-dialog";
import { type EditFormValues } from "@/features/work-report/schemas/work-report-form-schemas";
import {
  getWorkReportStatusColor,
  getWorkReportStatusDisplayText,
} from "@/features/work-report/utils/status-utils";
import { useMessageState } from "@/hooks/use-message-state";
import { getTargetYearMonth } from "@/utils/date-utils";

/**
 * 日本時間で今日の日付をUTC形式で取得する
 */
function getTodayInJapanTimeUTC(): Date {
  const now = new Date();
  const japanTimeMs = now.getTime() + 9 * 60 * 60 * 1000;
  const japanTime = new Date(japanTimeMs);
  return new Date(
    Date.UTC(
      japanTime.getUTCFullYear(),
      japanTime.getUTCMonth(),
      japanTime.getUTCDate(),
    ),
  );
}

/**
 * 作業報告書の金額・時間情報を計算する
 */
function calculateWorkReportSummary(
  workReport: WorkReportDashboard,
  contract: ContractDashboard,
): {
  totalWorkTimeText: string;
  baseAmountText: string;
  taxIncludedAmountText: string;
} {
  const totalWorkMinutes = calculateTotalWorkMinutes(
    workReport.attendances,
    contract.monthlyWorkMinutes,
  );
  const totalWorkTimeText = formatWorkTime(totalWorkMinutes);

  const amountCalculation = calculateWorkAmount(totalWorkMinutes, {
    unitPrice: contract.unitPrice,
    settlementMin: contract.settlementMin,
    settlementMax: contract.settlementMax,
    upperRate: contract.upperRate,
    lowerRate: contract.lowerRate,
    middleRate: contract.middleRate,
    hourlyRate: contract.hourlyRate,
    taxInclusiveType: contract.taxInclusiveType,
    taxRoundingType: contract.taxRoundingType,
    rateType: contract.rateType,
    monthlyWorkMinutes: contract.monthlyWorkMinutes,
  });

  const baseAmountText = amountCalculation
    ? formatAmount(amountCalculation.baseAmount)
    : "¥---,---";
  const taxIncludedAmountText = amountCalculation
    ? formatAmount(amountCalculation.baseAmount + amountCalculation.taxAmount)
    : "¥---,---";

  return {
    totalWorkTimeText,
    baseAmountText,
    taxIncludedAmountText,
  };
}

/**
 * 勤怠入力が可能かどうかを判定する
 * 対象月のWorkReportがDRAFT状態で存在する場合のみ入力可能
 */
function getAttendanceEntryInfo(
  contract: ContractDashboard,
  contractId: string,
  submittedWorkReports: Record<string, ContractDashboard>,
): { canEnter: boolean; targetWorkReport: WorkReportDashboard | null } {
  const todayUTC = getTodayInJapanTimeUTC();
  const targetYearMonth = getTargetYearMonth(todayUTC, contract.closingDay);

  // ドラフト一覧から対象月のWorkReportを探す
  const draftWorkReport = contract.workReports.find((wr) => {
    const wrYear = wr.targetDate.getFullYear();
    const wrMonth = wr.targetDate.getMonth() + 1;
    return wrYear === targetYearMonth.year && wrMonth === targetYearMonth.month;
  });

  if (draftWorkReport) {
    return { canEnter: true, targetWorkReport: draftWorkReport };
  }

  // 対象月のWorkReportがsubmittedにあるかチェック（すでに作成済みの場合は無効）
  const submittedContract = submittedWorkReports[contractId];
  if (submittedContract) {
    const submittedWorkReport = submittedContract.workReports.find((wr) => {
      const wrYear = wr.targetDate.getFullYear();
      const wrMonth = wr.targetDate.getMonth() + 1;
      return (
        wrYear === targetYearMonth.year && wrMonth === targetYearMonth.month
      );
    });
    if (submittedWorkReport) {
      // 作成済みなので入力不可
      return { canEnter: false, targetWorkReport: null };
    }
  }

  // 対象月のWorkReportが存在しない場合も入力不可
  return { canEnter: false, targetWorkReport: null };
}

export default function DashboardClientPage({
  draftWorkReports,
  submittedWorkReportsLast3Months,
  hasContracts,
  holidays,
}: DashboardClientPageProps) {
  const router = useRouter();
  const { startTransition } = useTransitionContext();
  const { error, success, showError, showSuccess, clearError, clearSuccess } =
    useMessageState();
  const [activeContract, setActiveContract] = useState<ContractOutput | null>(
    null,
  );
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [showContractPromptDialog, setShowContractPromptDialog] =
    useState(false);

  // 勤怠入力ダイアログの状態
  const [attendanceDialogState, setAttendanceDialogState] = useState<{
    isOpen: boolean;
    contractId: string | null;
    workReportId: string | null;
    date: Date | null;
    contract: ContractOutput | null;
    startTime: Date | null;
    endTime: Date | null;
    breakDuration: number | null;
    memo: string | null;
  }>({
    isOpen: false,
    contractId: null,
    workReportId: null,
    date: null,
    contract: null,
    startTime: null,
    endTime: null,
    breakDuration: null,
    memo: null,
  });

  const handleNavigation = (reportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${reportId}`);
    });
  };

  const openContractDetailsDialog = async (contractId: string) => {
    const result = await getContractByIdAction(contractId);
    if (!result.success) {
      console.error("Error fetching contract details:", result.error);
      return;
    }
    if (result.data) {
      setActiveContract(result.data);
      setActiveDialog("details");
    }
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setActiveContract(null);
  };

  const handleNavigateToWorkReports = (contractId: string) => {
    startTransition(() => {
      router.push(`/contract/${contractId}`);
    });
    closeDialog();
  };

  // 契約編集
  const onEditContract = (data: ContractFormValues) => {
    if (!activeContract) return;
    startTransition(() => {
      void (async () => {
        const contractData = convertContractFormValuesToContract(
          data,
          activeContract.userId,
        );
        const updateResult = await updateContractAction(
          activeContract.id,
          contractData,
        );
        if (!updateResult.success) {
          showError(updateResult.error);
          closeDialog();
          return;
        }
        const newContractResult = await getContractByIdAction(
          activeContract.id,
        );
        if (newContractResult.success && newContractResult.data) {
          setActiveContract(newContractResult.data);
        }
        showSuccess(`契約 '${data.name}' を編集しました`);
        closeDialog();
      })();
    });
  };

  // 契約がない場合、契約作成を促すダイアログを表示
  useEffect(() => {
    if (!hasContracts) {
      setShowContractPromptDialog(true);
    }
  }, [hasContracts]);

  // 契約一覧ページへ遷移
  const handleNavigateToContracts = () => {
    startTransition(() => {
      router.push("/contracts");
    });
  };

  // 勤怠入力ダイアログを開く
  const openAttendanceDialog = async (
    contractId: string,
    workReportId: string,
  ) => {
    const contractResult = await getContractByIdAction(contractId);
    if (!contractResult.success) {
      showError(contractResult.error);
      return;
    }
    if (!contractResult.data) {
      showError("契約情報が見つかりません");
      return;
    }
    const today = new Date();
    const date = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    const attendanceResult = await getAttendanceByWorkReportIdAndDateAction(
      workReportId,
      date,
    );
    const attendanceData = attendanceResult.success
      ? attendanceResult.data
      : null;
    setAttendanceDialogState({
      isOpen: true,
      contractId,
      workReportId,
      contract: contractResult.data,
      date,
      startTime: attendanceData?.startTime
        ? new Date(attendanceData.startTime)
        : null,
      endTime: attendanceData?.endTime
        ? new Date(attendanceData.endTime)
        : null,
      breakDuration: attendanceData?.breakDuration ?? null,
      memo: attendanceData?.memo ?? null,
    });
  };

  // 勤怠入力ダイアログを閉じる
  const closeAttendanceDialog = () => {
    setAttendanceDialogState({
      isOpen: false,
      contractId: null,
      workReportId: null,
      contract: null,
      date: null,
      startTime: null,
      endTime: null,
      breakDuration: null,
      memo: null,
    });
  };

  // 勤怠データを保存
  const handleAttendanceSave = (date: Date, data: EditFormValues) => {
    const { workReportId } = attendanceDialogState;
    if (!workReportId) return;

    startTransition(() => {
      void (async () => {
        const result = await updateWorkReportAttendanceAction(
          workReportId,
          date,
          {
            date,
            startTime: data.startTime,
            endTime: data.endTime,
            breakDuration: data.breakDuration,
            memo: data.memo,
            workReportId,
          },
        );
        if (result.success) {
          showSuccess("勤怠情報を保存しました");
          closeAttendanceDialog();
          // ページをリフレッシュしてデータを更新
          router.refresh();
        } else {
          console.error(result.error);
          showError(result.error || "勤怠情報の保存に失敗しました");
        }
      })();
    });
  };

  return (
    <>
      <Card className="w-full shadow-sm">
        <CardHeader className="flex-row items-center justify-between gap-x-3">
          <div className="flex items-center gap-x-3 font-semibold">
            <LayoutDashboard className="text-3xl text-sky-400" />
            <h1 className="text-2xl">ダッシュボード</h1>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormError message={error} onClose={clearError} />
          <FormSuccess message={success} onClose={clearSuccess} />

          <h2 className="text-xl font-bold">作成中の作業報告書一覧</h2>

          {Object.entries(draftWorkReports).map(([contractId, contract]) => (
            <Card
              key={contractId}
              className="group/card mb-6 cursor-pointer transition-colors hover:bg-muted/30 has-[button:hover]:bg-transparent has-[.work-report-card:hover]:bg-transparent"
              onClick={() => {
                startTransition(() => {
                  void openContractDetailsDialog(contractId);
                });
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{contract.contractName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {contract.clientName}
                    </p>
                  </div>
                  {contract.workReports.length > 0 &&
                    (() => {
                      const { canEnter, targetWorkReport } =
                        getAttendanceEntryInfo(
                          contract,
                          contractId,
                          submittedWorkReportsLast3Months,
                        );
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEnter}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canEnter || !targetWorkReport) return;
                            startTransition(() => {
                              void openAttendanceDialog(
                                contractId,
                                targetWorkReport.id,
                              );
                            });
                          }}
                        >
                          <Clock className="mr-2 size-4" />
                          勤怠入力
                        </Button>
                      );
                    })()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contract.workReports.map((workReport) => {
                    const {
                      totalWorkTimeText,
                      baseAmountText,
                      taxIncludedAmountText,
                    } = calculateWorkReportSummary(workReport, contract);
                    return (
                      <button
                        key={workReport.id}
                        type="button"
                        className="work-report-card block w-full cursor-pointer rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation(workReport.id);
                        }}
                      >
                        <div className="mb-2 flex items-start justify-between space-x-2">
                          <div className="text-lg font-medium">
                            {workReport.targetDate.getFullYear()}年
                            {workReport.targetDate.getMonth() + 1}月
                          </div>
                          <Badge
                            className={`${getWorkReportStatusColor(
                              workReport.status,
                            )} pointer-events-none`}
                          >
                            {getWorkReportStatusDisplayText(workReport.status)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>総稼働時間: {totalWorkTimeText}</div>
                          <div className="flex gap-2">
                            <span>税抜: {baseAmountText}</span>
                            <span>税込: {taxIncludedAmountText}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          {Object.entries(draftWorkReports).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 size-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                作成中の作業報告書はありません
              </p>
            </div>
          )}

          <h2 className="mt-8 text-xl font-bold">
            作成済みの作業報告書一覧 (直近3ヶ月)
          </h2>
          {Object.entries(submittedWorkReportsLast3Months).map(
            ([contractId, contract]) => (
              <Card
                key={contractId}
                className="group/card mb-6 cursor-pointer transition-colors hover:bg-muted/30 has-[button:hover]:bg-transparent has-[.work-report-card:hover]:bg-transparent"
                onClick={() => {
                  startTransition(() => {
                    void openContractDetailsDialog(contractId);
                  });
                }}
              >
                <CardHeader>
                  <CardTitle>{contract.contractName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {contract.clientName}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contract.workReports.map((workReport) => {
                      const {
                        totalWorkTimeText,
                        baseAmountText,
                        taxIncludedAmountText,
                      } = calculateWorkReportSummary(workReport, contract);
                      return (
                        <button
                          key={workReport.id}
                          type="button"
                          className="work-report-card block w-full cursor-pointer rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation(workReport.id);
                          }}
                        >
                          <div className="mb-2 flex items-start justify-between space-x-2">
                            <div className="text-lg font-medium">
                              {workReport.targetDate.getFullYear()}年
                              {workReport.targetDate.getMonth() + 1}月
                            </div>
                            <Badge
                              className={`${getWorkReportStatusColor(
                                workReport.status,
                              )} pointer-events-none`}
                            >
                              {getWorkReportStatusDisplayText(
                                workReport.status,
                              )}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>総稼働時間: {totalWorkTimeText}</div>
                            <div className="flex gap-2">
                              <span>税抜: {baseAmountText}</span>
                              <span>税込: {taxIncludedAmountText}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ),
          )}
          {Object.entries(submittedWorkReportsLast3Months).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 size-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                作成済みの作業報告書はありません
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ContractDialog
        type="details"
        isOpen={activeDialog === "details"}
        onClose={closeDialog}
      >
        {activeContract && (
          <ContractDetailsContent
            contract={activeContract}
            onNavigateToWorkReports={handleNavigateToWorkReports}
            onEdit={() => {
              setActiveDialog("edit");
            }}
            onClose={closeDialog}
            showWorkReportsButton
            showEditButton
            showDeleteButton={false}
          />
        )}
      </ContractDialog>

      <ContractDialog
        type="edit"
        isOpen={activeDialog === "edit"}
        onClose={closeDialog}
      >
        <ContractForm
          defaultValues={
            activeContract
              ? convertContractToFormValues(activeContract)
              : undefined
          }
          onSubmit={onEditContract}
          onCancel={closeDialog}
          submitButtonText="更新"
          isEditing
        />
      </ContractDialog>

      {/* 契約作成促進ダイアログ */}
      <Dialog
        open={showContractPromptDialog}
        onOpenChange={setShowContractPromptDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>契約を作成してください</DialogTitle>
            <DialogDescription>
              作業報告書を作成するには、まず契約を登録する必要があります。契約一覧画面で契約を作成してください。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowContractPromptDialog(false);
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleNavigateToContracts}>契約一覧へ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 勤怠入力ダイアログ */}
      {attendanceDialogState.contract && (
        <AttendanceEditDialog
          isOpen={attendanceDialogState.isOpen}
          onClose={closeAttendanceDialog}
          selectedDate={attendanceDialogState.date ?? new Date()}
          onSubmit={handleAttendanceSave}
          defaultValues={{
            startTime: attendanceDialogState.startTime
              ? new Date(attendanceDialogState.startTime)
              : null,
            endTime: attendanceDialogState.endTime
              ? new Date(attendanceDialogState.endTime)
              : null,
            breakDuration: attendanceDialogState.breakDuration,
            memo: attendanceDialogState.memo ?? null,
          }}
          basicStartTime={
            attendanceDialogState.contract.basicStartTime
              ? new Date(attendanceDialogState.contract.basicStartTime)
              : null
          }
          basicEndTime={
            attendanceDialogState.contract.basicEndTime
              ? new Date(attendanceDialogState.contract.basicEndTime)
              : null
          }
          basicBreakDuration={
            attendanceDialogState.contract.basicBreakDuration ?? null
          }
          basicMemo={attendanceDialogState.contract.basicMemo ?? null}
          dailyWorkMinutes={
            attendanceDialogState.contract.dailyWorkMinutes ?? 15
          }
          holidays={holidays}
        />
      )}
    </>
  );
}
