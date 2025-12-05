"use client";

import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { useTransitionContext } from "@/contexts/transition-context";
import { getContractByIdAction } from "@/features/contract/actions/contract";
import { ContractOutput } from "@/features/contract/types/contract";
import {
  calculateWorkAmount,
  calculateTotalWorkMinutes,
  formatWorkTime,
  formatAmount,
} from "@/features/contract/utils/contract-calculation-utils";
import { getWorkReportsByContractIdAndYearMonthDateRangeAction } from "@/features/work-report/actions/work-report";
import { WorkReportWithAttendances } from "@/features/work-report/types/work-report";
import {
  getWorkReportStatusColor,
  getWorkReportStatusDisplayText,
} from "@/features/work-report/utils/status-utils";
import { useMessageState } from "@/hooks/use-message-state";

export default function ContractClientPage({
  contractId,
}: {
  contractId: string;
}) {
  const { error, success, showError } = useMessageState();
  const [workReports, setWorkReports] = useState<WorkReportWithAttendances[]>(
    [],
  );
  const [contract, setContract] = useState<ContractOutput | null>(null);

  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // コントラクト情報を取得
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      const result = await getContractByIdAction(contractId);
      if (!result.success) {
        showError(result.error);
        return;
      }
      if (!result.data) {
        showError("契約情報が見つかりません");
        return;
      }
      setContract(result.data);
    });
  }, [contractId, showError, startTransition]);

  // Fetch work time reports for the project
  const fetchReports = useCallback(
    async (fromDate: Date | null, toDate: Date | null) => {
      const result =
        await getWorkReportsByContractIdAndYearMonthDateRangeAction(
          contractId,
          fromDate ?? undefined,
          toDate ?? undefined,
        );
      if (!result.success) {
        showError(result.error);
        return;
      }
      setWorkReports(result.data);
    },
    [contractId, showError],
  );

  // Load the reports on initial render
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      await fetchReports(null, null);
    });
  }, [contractId, fetchReports, startTransition]);

  const handleNavigation = (workReportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${workReportId}`);
    });
  };

  const handleNavigateToContracts = () => {
    startTransition(() => {
      router.push("/contracts");
    });
  };

  // 作業報告書をステータスでフィルタリング
  const draftWorkReports = workReports.filter(
    (report) => report.status === "DRAFT",
  );
  const submittedWorkReports = workReports
    .filter((report) => report.status === "SUBMITTED")
    .sort((a, b) => b.targetDate.getTime() - a.targetDate.getTime());

  // 作業報告書カードを生成する共通関数
  const renderWorkReportCard = (workReport: WorkReportWithAttendances) => {
    // 稼働時間と金額を計算
    const totalWorkMinutes = calculateTotalWorkMinutes(
      workReport.attendances,
      contract?.monthlyWorkMinutes,
    );
    const workTimeText = formatWorkTime(totalWorkMinutes);

    const amountCalculation = contract
      ? calculateWorkAmount(totalWorkMinutes, {
          unitPrice: contract.unitPrice ? Number(contract.unitPrice) : null,
          settlementMin: contract.settlementMin
            ? Number(contract.settlementMin)
            : null,
          settlementMax: contract.settlementMax
            ? Number(contract.settlementMax)
            : null,
          upperRate: contract.upperRate ? Number(contract.upperRate) : null,
          lowerRate: contract.lowerRate ? Number(contract.lowerRate) : null,
          middleRate: contract.middleRate ? Number(contract.middleRate) : null,
          hourlyRate: contract.hourlyRate ? Number(contract.hourlyRate) : null,
          taxInclusiveType: contract.taxInclusiveType,
          taxRoundingType: contract.taxRoundingType,
          rateType: contract.rateType,
          monthlyWorkMinutes: contract.monthlyWorkMinutes,
        })
      : null;

    return (
      <div
        key={workReport.id}
        className="w-full rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-400 hover:bg-muted/50 hover:shadow-sm"
      >
        <div className="flex w-full items-center justify-between">
          <div
            role="button"
            tabIndex={0}
            className="flex-1 cursor-pointer"
            onClick={() => {
              handleNavigation(workReport.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNavigation(workReport.id);
              }
            }}
          >
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {workReport.targetDate.getFullYear()}年
              {workReport.targetDate.getMonth() + 1}月分
            </h3>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">総稼働時間:</span> {workTimeText}
              </div>
              <div>
                <span className="font-medium">税抜:</span>{" "}
                {amountCalculation
                  ? formatAmount(amountCalculation.baseAmount)
                  : "¥---,---"}
              </div>
              <div>
                <span className="font-medium">税込:</span>{" "}
                {amountCalculation
                  ? formatAmount(
                      amountCalculation.baseAmount +
                        amountCalculation.taxAmount,
                    )
                  : "¥---,---"}
              </div>
            </div>
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-3">
            <Badge
              className={`${getWorkReportStatusColor(workReport.status)} pointer-events-none`}
            >
              {getWorkReportStatusDisplayText(workReport.status)}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-x-3">
        <div>
          <div className="flex items-center gap-x-3 font-semibold">
            <ClipboardList className="text-3xl text-sky-400" />
            <h1 className="text-2xl">作業報告書一覧（{contract?.name}）</h1>
          </div>
        </div>
        <Button onClick={handleNavigateToContracts}>契約一覧へ</Button>
      </CardHeader>
      <CardContent>
        <FormError message={error.message} resetSignal={error.date.getTime()} />
        <FormSuccess
          message={success.message}
          resetSignal={success.date.getTime()}
        />

        {workReports.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>作業報告書がありません</p>
          </div>
        ) : (
          <>
            {/* 作成中の作業報告書セクション */}
            {draftWorkReports.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-4 text-xl font-bold">作成中</h2>
                <div className="space-y-3">
                  {draftWorkReports.map((workReport) =>
                    renderWorkReportCard(workReport),
                  )}
                </div>
              </div>
            )}

            {/* 作成済みの作業報告書セクション */}
            {submittedWorkReports.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold">作成済み</h2>
                <div className="space-y-3">
                  {submittedWorkReports.map((workReport) =>
                    renderWorkReportCard(workReport),
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
