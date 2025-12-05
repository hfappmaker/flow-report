import { Metadata } from "next";
import { notFound } from "next/navigation";

import ClientWorkReportPage from "./page.client";
import { currentUser } from "@/features/auth/libs/auth";
import { fetchHolidays } from "@/features/holidays/libs/google-calendar";
import { getAttendancesByWorkReportIdAction } from "@/features/work-report/actions/attendance";
import { getWorkReportWithContractById } from "@/features/work-report/repositories/work-report-repository";

export const metadata: Metadata = {
  title: "作業報告書",
  description: "作業報告書",
};

export default async function WorkReportPage({
  params,
}: {
  params: Promise<{ workReportId: string }>;
}) {
  const { workReportId } = await params;
  const user = await currentUser();
  if (!user?.id) {
    return notFound();
  }

  // 作業報告書と契約情報を一緒に取得（N+1クエリを回避）
  const workReportWithContractResult =
    await getWorkReportWithContractById(workReportId);
  if (
    !workReportWithContractResult.success ||
    !workReportWithContractResult.data
  ) {
    return notFound();
  }

  const workReportWithContract = workReportWithContractResult.data;

  // 契約の作成者がログインユーザーと一致するか確認
  if (workReportWithContract.contract.userId !== user.id) {
    return notFound();
  }

  const workReport = workReportWithContract;
  const contract = workReportWithContract.contract;

  const attendancesResult =
    await getAttendancesByWorkReportIdAction(workReportId);
  const attendances = attendancesResult.success ? attendancesResult.data : [];

  const year = workReport.targetDate.getFullYear();
  const holidayData = await fetchHolidays(year);

  return (
    <ClientWorkReportPage
      contractId={contract.id}
      workReportId={workReportId}
      userId={user.id}
      targetDate={workReport.targetDate}
      userName={user.name ?? ""}
      userEmail={user.email ?? ""}
      attendances={attendances}
      contractName={contract.name}
      clientName={contract.clientName}
      dailyWorkMinutes={contract.dailyWorkMinutes ?? 1}
      monthlyWorkMinutes={contract.monthlyWorkMinutes ?? 1}
      basicStartTime={contract.basicStartTime}
      basicEndTime={contract.basicEndTime}
      basicBreakDuration={contract.basicBreakDuration}
      basicMemo={contract.basicMemo}
      remarks={workReport.remarks}
      closingDay={contract.closingDay}
      status={workReport.status}
      holidays={holidayData}
      unitPrice={contract.unitPrice ? Number(contract.unitPrice) : null}
      settlementMin={
        contract.settlementMin ? Number(contract.settlementMin) : null
      }
      settlementMax={
        contract.settlementMax ? Number(contract.settlementMax) : null
      }
      upperRate={contract.upperRate ? Number(contract.upperRate) : null}
      lowerRate={contract.lowerRate ? Number(contract.lowerRate) : null}
      middleRate={contract.middleRate ? Number(contract.middleRate) : null}
      hourlyRate={contract.hourlyRate ? Number(contract.hourlyRate) : null}
      taxInclusiveType={contract.taxInclusiveType}
      taxRoundingType={contract.taxRoundingType}
      rateType={contract.rateType}
      paymentMonthOffset={contract.paymentMonthOffset}
      paymentDay={contract.paymentDay}
    />
  );
}
