import { Metadata } from "next";

import { getDraftWorkReports } from "@/features/work-report/repositories/work-report-repository";

import DashboardClientPage from "./page.client";



export const metadata: Metadata = {
    title: "ダッシュボード",
    description: "ダッシュボード",
};

export default async function DashboardPage() {
    const draftWorkReports = await getDraftWorkReports();

    return <DashboardClientPage draftWorkReports={draftWorkReports} />;
}
