'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { YearMonthPickerField } from '@/components/ui/date-picker';
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Form } from '@/components/ui/form';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransitionContext } from '@/contexts/transition-context';
import { getContractByIdAction } from '@/features/contract/actions/contract';
import { ContractOutput } from "@/features/contract/types/contract";
import { getWorkReportsByContractIdAndYearMonthDateRangeAction, createWorkReportAction, deleteWorkReportAction } from '@/features/work-report/actions/work-report';
import { WorkReportDialog } from "@/features/work-report/components/work-report-dialog";
import { WorkReport } from "@/features/work-report/types/work-report";
import { useMessageState } from '@/hooks/use-message-state';

// 作業報告書作成用のスキーマ
const createWorkReportSchema = z.object({
  targetDate: z.date({
    required_error: "対象年月は必須です",
  }),
});

type CreateWorkReportValues = z.infer<typeof createWorkReportSchema>;

// ステータス表示用のヘルパー関数
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return { label: '作成中', variant: 'secondary' as const };
    case 'SUBMITTED':
      return { label: '作成完了', variant: 'default' as const };
    default:
      return { label: status, variant: 'secondary' as const };
  }
};

export default function ContractClientPage({ contractId }: { contractId: string }) {
  const { error, success, showError, showSuccess } = useMessageState();
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [contract, setContract] = useState<ContractOutput | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkReport | null>(null);

  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // 作成フォーム
  const createForm = useForm<CreateWorkReportValues>({
    resolver: zodResolver(createWorkReportSchema),
    defaultValues: {
      targetDate: new Date(selectedYear, new Date().getMonth(), 1),
    },
  });

  // 年の選択肢を生成（過去5年から未来2年まで）
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 2; year++) {
      years.push({ label: `${year}年`, value: year });
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
    startTransition(async () => {
      try {
        const contractData = await getContractByIdAction(contractId);
        setContract(contractData);
      } catch (error: unknown) {
        console.error(error);
        showError('契約情報の取得に失敗しました');
      }
    });
  }, [contractId]);

  // Fetch work time reports for the project
  const fetchReports = useCallback(async (fromDate: Date | null, toDate: Date | null) => {
    try {
      const data = await getWorkReportsByContractIdAndYearMonthDateRangeAction(contractId, fromDate ?? undefined, toDate ?? undefined);
      setWorkReports(data);
    } catch (error: unknown) {
      console.error(error);
      showError('作業報告書の取得に失敗しました');
    }
  }, [contractId]);

  // 年選択の変更ハンドラ
  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    setSelectedYear(year);
    const yearRange = getYearRange(year);
    
    // 年変更時に即座にデータを取得
    startTransition(async () => {
      await fetchReports(yearRange.from, yearRange.to);
    });
  };

  // Load the reports on initial render
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearRange = getYearRange(currentYear);
    startTransition(async () => {
      await fetchReports(yearRange.from, yearRange.to);
    });
  }, [contractId, fetchReports]);


  // 作成完了状態（SUBMITTEDステータス）は削除不可
  const isDeletable = (workReport: WorkReport): boolean => {
    return workReport.status !== 'SUBMITTED';
  };

  // 作業報告書作成処理
  const handleCreateWorkReport = (data: CreateWorkReportValues) => {
    startTransition(async () => {
      try {
        const createdWorkReport = await createWorkReportAction(contractId, data.targetDate);
        setIsCreateDialogOpen(false);
        createForm.reset();
        
        // 作成された作業報告書の画面に遷移
        router.push(`/workReport/${createdWorkReport.id}`);
      } catch (error) {
        console.error('Failed to create work report:', error);
        // サーバーエラーメッセージを表示（重複エラーを含む）
        const errorMessage = error instanceof Error ? error.message : '作業報告書の作成に失敗しました';
        showError(errorMessage);
      }
    });
  };

  // 削除確認ダイアログを開く
  const openDeleteDialog = (workReport: WorkReport) => {
    setDeleteTarget(workReport);
  };

  // 削除確認ダイアログを閉じる
  const closeDeleteDialog = () => {
    setDeleteTarget(null);
  };

  // 作業報告書削除実行
  const executeDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        await deleteWorkReportAction(deleteTarget.id);
        showSuccess(`${deleteTarget.targetDate.getFullYear()}年${deleteTarget.targetDate.getMonth() + 1}月の作業報告書を削除しました`);
        
        // 現在表示中の年の作業報告書を再取得
        const yearRange = getYearRange(selectedYear);
        await fetchReports(yearRange.from, yearRange.to);
        closeDeleteDialog();
      } catch (error) {
        console.error('Failed to delete work report:', error);
        showError('作業報告書の削除に失敗しました');
      }
    });
  };

  const handleNavigation = (workReportId: string) => {
    startTransition(() => {
      router.push(`/workReport/${workReportId}`);
    });
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">
        作業報告書一覧（{contract?.name}）
      </h1>
      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess message={success.message} resetSignal={success.date.getTime()} />
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">表示年</Label>
          <div className="w-32">
            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateYearOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { setIsCreateDialogOpen(true); }}>
            作業報告書を作成
          </Button>
        </div>
      </div>

      {workReports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>作業報告書がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workReports.map((workReport) => {
            const statusDisplay = getStatusDisplay(workReport.status);
            return (
              <div
                key={workReport.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 w-full"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 cursor-pointer" onClick={() => { handleNavigation(workReport.id); }}>
                    <h3 className="text-lg font-semibold text-foreground">
                      {workReport.targetDate.getFullYear()}年{workReport.targetDate.getMonth() + 1}月分
                    </h3>
                  </div>
                  <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                    <Badge variant={statusDisplay.variant}>
                      {statusDisplay.label}
                    </Badge>
                    {isDeletable(workReport) ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(workReport);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
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
              <p className="text-sm text-muted-foreground mb-2">削除対象:</p>
              <p className="font-medium">
                {deleteTarget.targetDate.getFullYear()}年{deleteTarget.targetDate.getMonth() + 1}月分の作業報告書
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

