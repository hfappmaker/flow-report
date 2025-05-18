import { Metadata } from "next";

import { getDraftWorkReports, getSubmittedWorkReportsByRecentMonths } from "@/features/work-report/repositories/work-report-repository";

import DashboardClientPage from "./page.client";



export const metadata: Metadata = {
    title: "ダッシュボード",
    description: "ダッシュボード",
};

export default async function DashboardPage() {
    const draftWorkReports = await getDraftWorkReports();
    const submittedWorkReportsLast3Months = await getSubmittedWorkReportsByRecentMonths();

    return (
        <DashboardClientPage
            draftWorkReports={draftWorkReports}
            submittedWorkReportsLast3Months={submittedWorkReportsLast3Months}
        />
    );
}
