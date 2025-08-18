"use client";

import { WorkReportStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransitionContext } from "@/contexts/transition-context";
import { type DashboardClientPageProps } from "@/features/dashboard/types/dashboard";
import { SubscriptionStatus } from "@/features/subscription/components/subscription-status";

export default function DashboardClientPage({
  draftWorkReports,
  submittedWorkReportsLast3Months,
  subscriptionInfo,
}: DashboardClientPageProps) {
  const router = useRouter();
  const { startTransition } = useTransitionContext();
  const getStatusColor = (status: WorkReportStatus) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-200 text-yellow-800";
      case "SUBMITTED":
        return "bg-blue-200 text-blue-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const handleNavigation = (reportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${reportId}`);
    });
  };

  const handleContractNavigation = (contractId: string) => {
    startTransition(() => {
      router.push(`/contract/${contractId}`);
    });
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
                handleContractNavigation(contractId);
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
                      className={`${getStatusColor(workReport.status)} pointer-events-none`}
                    >
                      {workReport.status}
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
                  handleContractNavigation(contractId);
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
                        className={`${getStatusColor(workReport.status)} pointer-events-none`}
                      >
                        {workReport.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
