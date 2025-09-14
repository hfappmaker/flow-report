"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransitionContext } from "@/contexts/transition-context";
import { getContractByIdAction } from "@/features/contract/actions/contract";
import { ContractDetailsContent } from "@/features/contract/components/contract-details-content";
import {
  ContractDialog,
  type DialogType,
} from "@/features/contract/components/contract-dialog";
import { type ContractOutput } from "@/features/contract/types/contract";
import { type DashboardClientPageProps } from "@/features/dashboard/types/dashboard";
import { SubscriptionStatus } from "@/features/subscription/components/subscription-status";
import {
  getWorkReportStatusColor,
  getWorkReportStatusDisplayText,
} from "@/features/work-report/utils/status-utils";

export default function DashboardClientPage({
  draftWorkReports,
  submittedWorkReportsLast3Months,
  subscriptionInfo,
}: DashboardClientPageProps) {
  const router = useRouter();
  const { startTransition } = useTransitionContext();
  const [activeContract, setActiveContract] = useState<ContractOutput | null>(
    null,
  );
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

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

  return (
    <div className="space-y-6 p-6">
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

      <h1 className="mb-6 text-2xl font-bold">現在の作業報告書一覧</h1>

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
        提出済みの作業報告書一覧 (直近3ヶ月)
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
            onClose={closeDialog}
            showWorkReportsButton
            showEditButton={false}
            showDeleteButton={false}
          />
        )}
      </ContractDialog>
    </div>
  );
}
