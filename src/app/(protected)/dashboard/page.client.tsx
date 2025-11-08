"use client";

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
import { type DashboardClientPageProps } from "@/features/dashboard/types/dashboard";
import { SubscriptionStatus } from "@/features/subscription/components/subscription-status";
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
    </div>
  );
}
