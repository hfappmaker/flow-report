"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YearMonthPickerField } from "@/components/ui/date-picker";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Form } from "@/components/ui/form";
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
import {
  getWorkReportsByContractIdAndYearMonthDateRangeAction,
  createWorkReportAction,
  deleteWorkReportAction,
} from "@/features/work-report/actions/work-report";
import { WorkReportDialog } from "@/features/work-report/components/work-report-dialog";
import { WorkReportWithAttendances } from "@/features/work-report/types/work-report";
import {
  getWorkReportStatusColor,
  getWorkReportStatusDisplayText,
} from "@/features/work-report/utils/status-utils";
import { useMessageState } from "@/hooks/use-message-state";

// 作業報告書作成用のスキーマ
const createWorkReportSchema = z.object({
  targetDate: z.date({
    required_error: "対象年月は必須です",
  }),
});

type CreateWorkReportValues = z.infer<typeof createWorkReportSchema>;

export default function ContractClientPage({
  contractId,
}: {
  contractId: string;
}) {
  const { error, success, showError, showSuccess } = useMessageState();
  const [workReports, setWorkReports] = useState<WorkReportWithAttendances[]>(
    [],
  );
  const [contract, setContract] = useState<ContractOutput | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<WorkReportWithAttendances | null>(null);

  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // 作成フォーム
  const createForm = useForm<CreateWorkReportValues>({
    resolver: zodResolver(createWorkReportSchema),
    defaultValues: {
      targetDate: new Date(Date.UTC(selectedYear, new Date().getMonth(), 1)), // 初期値は選択年の1月1日
    },
  });

  // 年の選択肢を生成（契約期間内のみ）
  const generateYearOptions = () => {
    if (!contract) {
      return [];
    }

    const startYear = new Date(contract.startDate).getFullYear();
    const endYear = contract.endDate
      ? new Date(contract.endDate).getFullYear()
      : new Date().getFullYear() + 2; // 終了日がない場合は未来2年まで

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
        const endYear = contractData.endDate
          ? new Date(contractData.endDate).getFullYear()
          : new Date().getFullYear() + 2;

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
    const yearRange = getYearRange(year);

    // 年変更時に即座にデータを取得
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      await fetchReports(yearRange.from, yearRange.to);
    });
  };

  // Load the reports on initial render
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearRange = getYearRange(currentYear);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      await fetchReports(yearRange.from, yearRange.to);
    });
  }, [contractId, fetchReports, startTransition]);

  // 作業報告書作成処理
  const handleCreateWorkReport = (data: CreateWorkReportValues) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      try {
        const createdWorkReport = await createWorkReportAction(
          contractId,
          data.targetDate,
        );
        setIsCreateDialogOpen(false);
        createForm.reset();

        // 作成された作業報告書の画面に遷移
        router.push(`/workReport/${createdWorkReport.id}`);
      } catch (error) {
        console.error("Failed to create work report:", error);
        // サーバーエラーメッセージを表示（重複エラーを含む）
        const errorMessage =
          error instanceof Error
            ? error.message
            : "作業報告書の作成に失敗しました";
        createForm.setError("targetDate", {
          type: "manual",
          message: errorMessage,
        });
      }
    });
  };

  // 削除確認ダイアログを開く
  const openDeleteDialog = (workReport: WorkReportWithAttendances) => {
    setDeleteTarget(workReport);
  };

  // 削除確認ダイアログを閉じる
  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  // 作業報告書削除実行
  const executeDelete = () => {
    if (!deleteTarget) return;

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    startTransition(async () => {
      try {
        await deleteWorkReportAction(deleteTarget.id);
        showSuccess(
          `${deleteTarget.targetDate.getFullYear().toString()}年${(deleteTarget.targetDate.getMonth() + 1).toString()}月の作業報告書を削除しました`,
        );

        // 現在表示中の年の作業報告書を再取得
        const yearRange = getYearRange(selectedYear);
        await fetchReports(yearRange.from, yearRange.to);
        closeDeleteDialog();
      } catch (error) {
        console.error("Failed to delete work report:", error);
        showError("作業報告書の削除に失敗しました");
      }
    });
  };

  const handleNavigation = (workReportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${workReportId}`);
    });
  };

  // 年月が無効かどうかを判定する関数
  const isYearMonthDisabled = (year: number, month: number): boolean => {
    if (!contract) return true;

    // 契約範囲外の年月をチェック
    const targetDate = new Date(Date.UTC(year, month, 1));
    const contractStart = new Date(contract.startDate);
    const contractStartMonth = new Date(
      Date.UTC(contractStart.getFullYear(), contractStart.getMonth(), 1),
    );

    // 契約開始月より前は無効
    if (targetDate < contractStartMonth) {
      return true;
    }

    // 契約終了日が設定されている場合、終了月より後は無効
    if (contract.endDate) {
      const contractEnd = new Date(contract.endDate);
      const contractEndMonth = new Date(
        Date.UTC(contractEnd.getFullYear(), contractEnd.getMonth(), 1),
      );
      if (targetDate > contractEndMonth) {
        return true;
      }
    }

    // 既存の作業報告書がある年月は無効
    const hasExistingReport = workReports.some((report) => {
      const reportDate = new Date(report.targetDate);
      return (
        reportDate.getFullYear() === year && reportDate.getMonth() === month
      );
    });

    return hasExistingReport;
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
          <Button
            onClick={() => {
              setIsCreateDialogOpen(true);
            }}
          >
            作業報告書を作成
          </Button>
        </div>
      </div>

      {workReports.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>作業報告書がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workReports.map((workReport) => {
            // 稼働時間と金額を計算
            const totalWorkMinutes = calculateTotalWorkMinutes(
              workReport.attendances,
            );
            const workTimeText = formatWorkTime(totalWorkMinutes);

            const amountCalculation = contract
              ? calculateWorkAmount(totalWorkMinutes, {
                  unitPrice: contract.unitPrice
                    ? Number(contract.unitPrice)
                    : undefined,
                  settlementMin: contract.settlementMin
                    ? Number(contract.settlementMin)
                    : undefined,
                  settlementMax: contract.settlementMax
                    ? Number(contract.settlementMax)
                    : undefined,
                  upperRate: contract.upperRate
                    ? Number(contract.upperRate)
                    : undefined,
                  lowerRate: contract.lowerRate
                    ? Number(contract.lowerRate)
                    : undefined,
                  middleRate: contract.middleRate
                    ? Number(contract.middleRate)
                    : undefined,
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
                        <span className="font-medium">稼働時間:</span>{" "}
                        {workTimeText}
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
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(workReport);
                      }}
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 作業報告書作成ダイアログ */}
      <WorkReportDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          createForm.reset();
        }}
        title="作業報告書を作成"
      >
        <Form {...createForm}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={createForm.handleSubmit(handleCreateWorkReport)}
            className="space-y-4"
          >
            <YearMonthPickerField
              control={createForm.control}
              name="targetDate"
              label="対象年月"
              yearTriggerClassName="w-24"
              monthTriggerClassName="w-20"
              showClearButton={false}
              isYearMonthDisabled={isYearMonthDisabled}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  createForm.reset();
                }}
              >
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
        </Form>
      </WorkReportDialog>

      {/* 作業報告書削除確認ダイアログ */}
      <WorkReportDialog
        isOpen={!!deleteTarget}
        onClose={closeDeleteDialog}
        title="作業報告書を削除"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">削除対象:</p>
              <p className="font-medium">
                {deleteTarget.targetDate.getFullYear()}年
                {deleteTarget.targetDate.getMonth() + 1}月分の作業報告書
              </p>
            </div>
            <p className="text-sm text-red-600">
              この操作は元に戻すことができません。
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={closeDeleteDialog}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={executeDelete}>
                削除
              </Button>
            </div>
          </div>
        )}
      </WorkReportDialog>
    </div>
  );
}
