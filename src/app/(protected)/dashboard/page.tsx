import { Metadata } from "next";

import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";
import { getDraftWorkReports, getSubmittedWorkReportsByRecentMonths } from "@/features/work-report/repositories/work-report-repository";

import DashboardClientPage from "./page.client";

export const metadata: Metadata = {
    title: "ダッシュボード",
    description: "ダッシュボード",
};

export default async function DashboardPage() {
    const [draftWorkReports, submittedWorkReportsLast3Months, subscriptionInfo] = await Promise.all([
        getDraftWorkReports(),
        getSubmittedWorkReportsByRecentMonths(),
        getSubscriptionInfo()
    ]);

    return (
        <DashboardClientPage
            draftWorkReports={draftWorkReports}
            submittedWorkReportsLast3Months={submittedWorkReportsLast3Months}
            subscriptionInfo={subscriptionInfo}
        />
    );
}
