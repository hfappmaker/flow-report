"use client";

import { WorkReportStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransitionContext } from "@/contexts/transition-context";
import {
    type DashboardClientPageProps
} from "@/features/dashboard/types/dashboard";
import { SubscriptionStatus } from "@/features/subscription/components/subscription-status";

export default function DashboardClientPage({ draftWorkReports, submittedWorkReportsLast3Months, subscriptionInfo }: DashboardClientPageProps) {
    const router = useRouter();
    const { startTransition } = useTransitionContext();
    const getStatusColor = (status: WorkReportStatus) => {
        switch (status) {
            case "DRAFT":
                return "bg-yellow-200 text-yellow-800";
            case "SUBMITTED":
                return "bg-blue-200 text-blue-800";
            case "APPROVED":
                return "bg-green-200 text-green-800";
            case "REJECTED":
                return "bg-red-200 text-red-800";
            default:
                return "bg-gray-200 text-gray-800";
        }
    };

    const handleNavigation = (reportId: string) => {
        startTransition(() => {
            router.push(`/workReport/${reportId}`);
        });
    };

    const handleClientNavigation = (clientId: string) => {
        startTransition(() => {
            router.push(`/client/${clientId}`);
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
                    {subscriptionInfo.isTrialActive && (
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                無料トライアル期間は残り{subscriptionInfo.daysLeftInTrial}日です。
                                期間終了後は月額500円のプレミアムプランへの登録が必要となります。
                            </p>
                        </CardContent>
                    )}
                </Card>
            )}

            <h1 className="mb-6 text-2xl font-bold">現在の作業報告書一覧</h1>

            {Object.entries(draftWorkReports).map(([clientId, client]) => (
                <Card key={clientId} className="mb-6">
                    <CardHeader>
                        <CardTitle className="cursor-pointer hover:underline" onClick={() => { handleClientNavigation(clientId); }}>
                            {client.clientName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(client.contracts).map(([contractId, contract]) => (
                                <div key={contractId} className="rounded-lg border p-4">
                                    <h3 className="mb-2 cursor-pointer text-lg font-semibold hover:underline" onClick={() => { handleContractNavigation(contractId); }}>
                                        {contract.contractName}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {contract.workReports.map((workReport) => (
                                            <div
                                                key={workReport.id}
                                                className="block cursor-pointer rounded-lg border p-4 transition-colors"
                                            >
                                                <div className="mb-2 flex items-start justify-between space-x-2">
                                                    <div className="text-lg font-medium hover:underline" onClick={() => { handleNavigation(workReport.id); }}>
                                                        {workReport.targetDate.getFullYear()}年{workReport.targetDate.getMonth() + 1}月
                                                    </div>
                                                    <Badge className={getStatusColor(workReport.status)}>
                                                        {workReport.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <h2 className="mb-6 mt-12 text-2xl font-bold">提出済みの作業報告書一覧 (直近3ヶ月)</h2>
            {Object.entries(submittedWorkReportsLast3Months).map(([clientId, client]) => (
                <Card key={clientId} className="mb-6">
                    <CardHeader>
                        <CardTitle className="cursor-pointer hover:underline" onClick={() => { handleClientNavigation(clientId); }}>
                            {client.clientName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(client.contracts).map(([contractId, contract]) => (
                                <div key={contractId} className="rounded-lg border p-4">
                                    <h3 className="mb-2 cursor-pointer text-lg font-semibold hover:underline" onClick={() => { handleContractNavigation(contractId); }}>
                                        {contract.contractName}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {contract.workReports.map((workReport) => (
                                            <div
                                                key={workReport.id}
                                                className="block cursor-pointer rounded-lg border p-4 transition-colors"
                                                onClick={() => { handleNavigation(workReport.id); }}
                                            >
                                                <div className="mb-2 flex items-start justify-between space-x-2">
                                                    <div className="text-lg font-medium hover:underline">
                                                        {workReport.targetDate.getFullYear()}年{workReport.targetDate.getMonth() + 1}月
                                                    </div>
                                                    <Badge className={getStatusColor(workReport.status)}>
                                                        {workReport.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

        </div>
    );
}