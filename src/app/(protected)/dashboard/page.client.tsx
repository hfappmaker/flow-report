"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Clock } from "lucide-react";

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
import { type DashboardClientPageProps } from "@/features/dashboard/types/dashboard";
import { SubscriptionStatus } from "@/features/subscription/components/subscription-status";
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

export default function DashboardClientPage({
  draftWorkReports,
  submittedWorkReportsLast3Months,
  subscriptionInfo,
  hasContracts,
  holidays,
}: DashboardClientPageProps) {
  const router = useRouter();
  const { startTransition } = useTransitionContext();
  const { error, success, showError, showSuccess } = useMessageState();
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
    try {
      const contractData = await getContractByIdAction(contractId);
      if (contractData) {
        setActiveContract(contractData);
        setActiveDialog("details");
      }
    } catch (error) {
      console.error("Error fetching contract details:", error);
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
    startTransition(async () => {
      try {
        const contractData = convertContractFormValuesToContract(
          data,
          activeContract.userId,
        );
        await updateContractAction(activeContract.id, contractData);
        const newContractData = await getContractByIdAction(activeContract.id);
        // 更新されたデータで activeContract を更新
        setActiveContract(newContractData);
        showSuccess(`契約 '${data.name}' を編集しました`);
      } catch (error: unknown) {
        console.error(error);
        showError("契約の更新に失敗しました");
      } finally {
        closeDialog();
      }
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
    try {
      const contractData = await getContractByIdAction(contractId);
      if (contractData) {
        const today = new Date();
        const date = new Date(
          Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
        );
        const attendanceData = await getAttendanceByWorkReportIdAndDateAction(
          workReportId,
          date,
        );
        setAttendanceDialogState({
          isOpen: true,
          contractId,
          workReportId,
          contract: contractData,
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
      }
    } catch (error) {
      console.error("Error fetching contract details:", error);
      showError("契約情報の取得に失敗しました");
    }
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
  const handleAttendanceSave = async (date: Date, data: EditFormValues) => {
    const { workReportId } = attendanceDialogState;
    if (!workReportId) return;

    try {
      startTransition(() => {
        void (async () => {
          await updateWorkReportAttendanceAction(workReportId, date, {
            date,
            startTime: data.startTime,
            endTime: data.endTime,
            breakDuration: data.breakDuration,
            memo: data.memo,
            workReportId,
          });
          showSuccess("勤怠情報を保存しました");
          closeAttendanceDialog();
          // ページをリフレッシュしてデータを更新
          router.refresh();
        })();
      });
    } catch (error) {
      console.error("勤怠情報の保存に失敗しました", error);
      showError("勤怠情報の保存に失敗しました");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess
        message={success.message}
        resetSignal={success.date.getTime()}
      />
      {/* サブスクリプション情報を上部に表示 */}
      {subscriptionInfo && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>サブスクリプション情報</CardTitle>
              <SubscriptionStatus subscriptionInfo={subscriptionInfo} />
            </div>
          </CardHeader>
        </Card>
      )}

      <h1 className="mb-6 text-2xl font-bold">作成中の作業報告書一覧</h1>

      {Object.entries(draftWorkReports).map(([contractId, contract]) => (
        <Card key={contractId} className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle
                  className="cursor-pointer transition-colors hover:text-blue-600"
                  onClick={() => {
                    startTransition(async () => {
                      await openContractDetailsDialog(contractId);
                    });
                  }}
                >
                  {contract.contractName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {contract.clientName}
                </p>
              </div>
              {contract.workReports.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    startTransition(async () => {
                      // 最新の作業報告書を取得（通常は1件のはず）
                      const latestWorkReport = contract.workReports[0];
                      await openAttendanceDialog(
                        contractId,
                        latestWorkReport.id,
                      );
                    });
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  勤怠入力
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contract.workReports.map((workReport) => (
                <div
                  key={workReport.id}
                  className="block cursor-pointer rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                  onClick={() => {
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <h2 className="mb-6 mt-12 text-2xl font-bold">
        作成済みの作業報告書一覧 (直近3ヶ月)
      </h2>
      {Object.entries(submittedWorkReportsLast3Months).map(
        ([contractId, contract]) => (
          <Card key={contractId} className="mb-6">
            <CardHeader>
              <CardTitle
                className="cursor-pointer transition-colors hover:text-blue-600"
                onClick={() => {
                  startTransition(async () => {
                    await openContractDetailsDialog(contractId);
                  });
                }}
              >
                {contract.contractName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {contract.clientName}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contract.workReports.map((workReport) => (
                  <div
                    key={workReport.id}
                    className="block cursor-pointer rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
                    onClick={() => {
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ),
      )}

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
    </div>
  );
}
