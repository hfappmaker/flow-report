'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { YearMonthPickerField } from '@/components/ui/date-picker';
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Form } from '@/components/ui/form';
import { useTransitionContext } from '@/contexts/transition-context';
import { getContractByIdAction } from '@/features/contract/actions/contract';
import { ContractOutput } from "@/features/contract/types/contract";
import { createWorkReportAction, getWorkReportsByContractIdAndYearMonthDateRangeAction } from '@/features/work-report/actions/work-report';
import { WorkReportDialog, type DialogType } from "@/features/work-report/components/work-report-dialog"
import {
  createWorkReportFormSchema,
  type CreateWorkReportFormValues,
  searchFormSchema,
  type SearchFormValues,
} from "@/features/work-report/schemas/work-report-form-schemas";
import { WorkReport } from "@/features/work-report/types/work-report";
import { useMessageState } from '@/hooks/use-message-state';


export default function ContractClientPage({ contractId }: { contractId: string }) {
  const { error, success, showError, showSuccess } = useMessageState();
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [contract, setContract] = useState<ContractOutput | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // 現在の年月を取得
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentYearMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
  const currentYearMonthMinusOne = new Date(Date.UTC(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1,
    1
  ));

  const [searchFormValues, setSearchFormValues] = useState<SearchFormValues>({
    from: currentYearMonthMinusOne,
    to: currentYearMonth,
  });

  const createWorkReportForm = useForm<CreateWorkReportFormValues>({
    resolver: zodResolver(createWorkReportFormSchema),
    defaultValues: {
      yearMonth: currentYearMonth,
    },
  });

  // 検索フォームの初期値を設定
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: searchFormValues,
  });

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
  }, [contractId, startTransition]);

  // Fetch work time reports for the project
  const fetchReports = useCallback(async (fromDate: Date | null, toDate: Date | null) => {
    try {
      const data = await getWorkReportsByContractIdAndYearMonthDateRangeAction(contractId, fromDate ?? undefined, toDate ?? undefined);
      setWorkReports(data);
      setSearchFormValues({
        from: fromDate,
        to: toDate
      });
    } catch (error: unknown) {
      console.error(error);
      showError('作業報告書の取得に失敗しました');
    }
  }, [contractId]);

  // Load the reports on initial render
  useEffect(() => {
    startTransition(async () => {
      await fetchReports(searchFormValues.from, searchFormValues.to);
    });
  }, [contractId, startTransition, fetchReports, searchFormValues.from, searchFormValues.to]);

  // 検索処理の更新
  const onSearchSubmit = (data: SearchFormValues) => {
    startTransition(async () => {
      try {
        const fromDate = data.from;
        const toDate = data.to;
        // 検索条件を追加してfetchReportsを呼び出す
        await fetchReports(fromDate, toDate);
      } catch (error: unknown) {
        console.error(error);
        showError('検索に失敗しました');
      }
    });
  };

  // Handle creation of a new work time report
  const handleCreateReport = (values: CreateWorkReportFormValues) => {
    try {
      if (!contract) {
        showError('契約情報がありません');
        return;
      }

      const targetDate = values.yearMonth;

      startTransition(async () => {
        await createWorkReportAction(contractId, targetDate);
        showSuccess('作業報告書を作成しました');
        // Refresh report list after creation
        await fetchReports(searchFormValues.from, searchFormValues.to);
        // Close dialog and reset the creation form
        setActiveDialog(null);
        createWorkReportForm.reset({
          yearMonth: currentYearMonth,
        });
      });
    } catch (error: unknown) {
      console.error(error);
      showError('作業報告書の作成に失敗しました');
    }
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
      <div className="mb-4 flex items-center">
        <div className="mr-4 flex items-center gap-2">
          <span className="text-muted-foreground">
            {searchFormValues.from ? String(searchFormValues.from.getFullYear()) + "年" + String(searchFormValues.from.getMonth() + 1) + "月" : ""}
          </span>
          <span className="text-muted-foreground">
            ~
          </span>
          <span className="text-muted-foreground">
            {searchFormValues.to ? String(searchFormValues.to.getFullYear()) + "年" + String(searchFormValues.to.getMonth() + 1) + "月" : ""}
          </span>
        </div>
        <Button onClick={() => { setActiveDialog("search"); }} className="mr-4">
          検索
        </Button>
        <Button onClick={() => { setActiveDialog("create"); }}>
          作業報告書を作成
        </Button>
      </div>

      {workReports.length === 0 ? (
        <p>作業報告書がありません</p>
      ) : (
        <ul>
          {workReports.map((workReport) => (
            <li key={workReport.id} className="py-2">
              <div
                onClick={() => { handleNavigation(workReport.id); }}
                className="cursor-pointer hover:text-blue-500"
              >
                {workReport.targetDate.getFullYear()}年{workReport.targetDate.getMonth() + 1}月分
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 検索ダイアログ */}
      <WorkReportDialog
        isOpen={activeDialog === "search"}
        onClose={() => { setActiveDialog(null); }}
        title="作業報告書を検索"
      >
        <Form {...searchForm}>
          <form
            onSubmit={searchForm.handleSubmit((data) => {
              onSearchSubmit(data);
              setActiveDialog(null);
            })}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <YearMonthPickerField
                control={searchForm.control}
                name="from"
                yearTriggerClassName="w-24"
                monthTriggerClassName="w-20"
              />
              <span>から</span>
              <YearMonthPickerField
                control={searchForm.control}
                name="to"
                yearTriggerClassName="w-24"
                monthTriggerClassName="w-20"
              />
              <span>まで</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => {
                setActiveDialog(null);
                searchForm.reset(searchFormValues);
              }}>
                キャンセル
              </Button>
              <Button type="submit">検索</Button>
            </div>
          </form>
        </Form>
      </WorkReportDialog>

      {/* 作成ダイアログ */}
      <WorkReportDialog
        isOpen={activeDialog === "create"}
        onClose={() => { setActiveDialog(null); }}
        title="作業報告書を作成"
      >
        <Form {...createWorkReportForm}>
          <form onSubmit={createWorkReportForm.handleSubmit(handleCreateReport)} className="space-y-4">
            <div className="flex gap-4">
              <YearMonthPickerField
                control={createWorkReportForm.control}
                name="yearMonth"
                yearTriggerClassName="w-24"
                monthTriggerClassName="w-20"
                showClearButton={false}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => {
                setActiveDialog(null);
                createWorkReportForm.reset({
                  yearMonth: currentYearMonth,
                });
              }}>
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
        </Form>
      </WorkReportDialog>
    </div>
  );
}

