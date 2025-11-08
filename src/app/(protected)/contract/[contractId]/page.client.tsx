"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // 年の選択肢を生成（契約期間内のみ）
  const generateYearOptions = () => {
    if (!contract) {
      return [];
    }

    const startYear = new Date(contract.startDate).getFullYear();
    const endYear = new Date(contract.endDate).getFullYear();

    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ label: `${year.toString()}年`, value: year });
    }
    return years;
  };

  // 選択された年に基づいて初期の検索範囲を設定
  const getYearRange = (year: number) => {
    const from = new Date(Date.UTC(year, 0, 1)); // 1月
    const to = new Date(Date.UTC(year, 11, 1)); // 12月
    return { from, to };
  };

  // コントラクト情報を取得
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      try {
        const contractData = await getContractByIdAction(contractId);
        if (!contractData) {
          showError("契約情報が見つかりません");
          return;
        }
        setContract(contractData);

        // 契約期間内に現在の選択年が収まっているかチェック
        const startYear = new Date(contractData.startDate).getFullYear();
        const endYear = new Date(contractData.endDate).getFullYear();

        setSelectedYear((currentYear) => {
          if (currentYear < startYear || currentYear > endYear) {
            return startYear;
          }
          return currentYear;
        });
      } catch (error: unknown) {
        console.error(error);
        showError("契約情報の取得に失敗しました");
      }
    });
  }, [contractId, showError, startTransition]);

  // Fetch work time reports for the project
  const fetchReports = useCallback(
    async (fromDate: Date | null, toDate: Date | null) => {
      try {
        const data =
          await getWorkReportsByContractIdAndYearMonthDateRangeAction(
            contractId,
            fromDate ?? undefined,
            toDate ?? undefined,
          );
        setWorkReports(data);
      } catch (error: unknown) {
        console.error(error);
        showError("作業報告書の取得に失敗しました");
      }
    },
    [contractId, showError],
  );

  // 年選択の変更ハンドラ
  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    setSelectedYear(year);
  };

  // Load the reports on initial render
  useEffect(() => {
    const selectedYearRange = getYearRange(selectedYear);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      await fetchReports(selectedYearRange.from, selectedYearRange.to);
    });
  }, [contractId, fetchReports, startTransition, selectedYear]);

  const handleNavigation = (workReportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${workReportId}`);
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
          taxInclusiveType: contract.taxInclusiveType,
          taxRoundingType: contract.taxRoundingType,
          rateType: contract.rateType,
        })
      : null;

    return (
      <div
        key={workReport.id}
        className="w-full rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-400 hover:bg-muted/50 hover:shadow-sm"
      >
        <div className="flex w-full items-center justify-between">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => {
              handleNavigation(workReport.id);
            }}
          >
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {workReport.targetDate.getFullYear()}年
              {workReport.targetDate.getMonth() + 1}月分
            </h3>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">稼働時間:</span> {workTimeText}
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
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">
        作業報告書一覧（{contract?.name}）
      </h1>
      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess
        message={success.message}
        resetSignal={success.date.getTime()}
      />
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">表示年</Label>
          <div className="w-32">
            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateYearOptions().map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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

          {/* 提出済みの作業報告書セクション */}
          {submittedWorkReports.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">提出済み</h2>
              <div className="space-y-3">
                {submittedWorkReports.map((workReport) =>
                  renderWorkReportCard(workReport),
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
