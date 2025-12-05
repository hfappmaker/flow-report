"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { DialogFooter } from "@/components/ui/dialog";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Input } from "@/components/ui/input";
import { useTransitionContext } from "@/contexts/transition-context";
import {
  getContractsByUserIdAction,
  searchContractsAction,
  deleteContractAction,
  createContractAction,
  updateContractAction,
} from "@/features/contract/actions/contract";
import { ContractDetailsContent } from "@/features/contract/components/contract-details-content";
import {
  ContractDialog,
  type DialogType,
} from "@/features/contract/components/contract-dialog";
import {
  ContractForm,
  ContractFormValues,
} from "@/features/contract/components/contract-form";
import { ContractOutput } from "@/features/contract/types/contract";
import {
  convertContractFormValuesToContract,
  convertContractToFormValues,
} from "@/features/contract/utils/contract-converter";
import { useMessageState } from "@/hooks/use-message-state";
import { formatDateLongAsUTC } from "@/utils/date-utils";

export default function ContractsClientPage({ userId }: { userId: string }) {
  const { error, success, showError, showSuccess, clearError, clearSuccess } =
    useMessageState();
  const [contracts, setContracts] = useState<ContractOutput[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeContract, setActiveContract] = useState<ContractOutput | null>(
    null,
  );
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const { startTransition } = useTransitionContext();
  const router = useRouter();

  // 契約一覧を取得
  const fetchContracts = useCallback(async () => {
    const result = await getContractsByUserIdAction(userId);
    if (!result.success) {
      showError(result.error);
      return;
    }
    setContracts(result.data);
  }, [userId, showError]);

  // 検索処理
  const handleSearch = () => {
    const hasSearchQuery = searchQuery.trim();
    const hasPeriodFilters = periodFrom || periodTo;

    if (!hasSearchQuery && !hasPeriodFilters) {
      setIsSearching(false);
      startTransition(() => {
        void fetchContracts();
      });
      return;
    }

    setIsSearching(true);
    startTransition(() => {
      void (async () => {
        const result = await searchContractsAction(
          userId,
          searchQuery || undefined,
          periodFrom || undefined,
          periodTo || undefined,
        );
        if (!result.success) {
          showError(result.error);
          return;
        }
        setContracts(result.data);
      })();
    });
  };

  // 検索クリア
  const handleClearSearch = () => {
    setSearchQuery("");
    setPeriodFrom("");
    setPeriodTo("");
    setIsSearching(false);
    startTransition(() => {
      void fetchContracts();
    });
  };

  // ダイアログを閉じる
  const closeDialog = () => {
    setActiveDialog(null);
    setActiveContract(null);
  };

  // 契約詳細ダイアログを開く
  const openDetailsDialog = (contract: ContractOutput) => {
    setActiveContract(contract);
    setActiveDialog("details");
  };

  // 作業報告書ページへ遷移
  const handleNavigateToWorkReports = (contractId: string) => {
    startTransition(() => {
      router.push(`/contract/${contractId}`);
    });
    closeDialog();
  };

  // 契約削除
  const onDeleteContract = () => {
    if (!activeContract) return;
    startTransition(() => {
      void (async () => {
        const result = await deleteContractAction(activeContract.id);
        if (result.success) {
          showSuccess(`契約 '${activeContract.name}' を削除しました`);
          await fetchContracts();
        } else {
          console.error(result.error);
          showError(result.error || "契約の削除に失敗しました。");
        }
        closeDialog();
      })();
    });
  };

  // 契約作成
  const onCreateContract = (data: ContractFormValues) => {
    startTransition(() => {
      void (async () => {
        const contractData = convertContractFormValuesToContract(data, userId);
        const result = await createContractAction(contractData);

        if (result.success) {
          showSuccess(`契約 '${data.name}' を作成しました`);
          await fetchContracts();
        } else {
          console.error(result.error);
          showError(result.error || "契約の作成に失敗しました");
        }
        closeDialog();
      })();
    });
  };

  // 契約編集
  const onEditContract = (data: ContractFormValues) => {
    if (!activeContract) return;
    startTransition(() => {
      void (async () => {
        const contractData = convertContractFormValuesToContract(data, userId);
        const result = await updateContractAction(
          activeContract.id,
          contractData,
        );
        if (result.success) {
          showSuccess(`契約 '${data.name}' を編集しました`);
          await fetchContracts();
        } else {
          console.error(result.error);
          showError(result.error || "契約の更新に失敗しました");
        }
        closeDialog();
      })();
    });
  };

  // 契約コピー
  const onCopyContract = (data: ContractFormValues) => {
    startTransition(() => {
      void (async () => {
        const contractData = convertContractFormValuesToContract(data, userId);
        const result = await createContractAction(contractData);

        if (result.success) {
          showSuccess(`契約 '${data.name}' をコピーして作成しました`);
          await fetchContracts();
        } else {
          console.error(result.error);
          showError(result.error || "契約のコピーに失敗しました");
        }
        closeDialog();
      })();
    });
  };

  // 初期データ読み込み
  useEffect(() => {
    startTransition(() => {
      void fetchContracts();
    });
  }, [fetchContracts, startTransition]);

  // 契約コピー用の変換関数
  const convertContractToCopyFormValues = (
    contract: ContractOutput,
  ): ContractFormValues => {
    const baseValues = convertContractToFormValues(contract);
    // 開始日の設定（コピー元の終了日の翌日）
    const newStartDate = new Date(
      Date.UTC(
        contract.endDate.getFullYear(),
        contract.endDate.getMonth(),
        contract.endDate.getDate() + 1,
      ),
    );

    // コピー元の契約期間の月数を計算
    const originalMonthDiff =
      (contract.endDate.getFullYear() - contract.startDate.getFullYear()) * 12 +
      (contract.endDate.getMonth() - contract.startDate.getMonth());

    // 新しい終了日 = 新しい開始日 + コピー元の契約期間の月数
    // 日にちはコピー元の締め日（closingDayがnullの場合は月末）
    const closingDay = contract.closingDay ?? 31;
    const newEndYear = newStartDate.getUTCFullYear();
    const newEndMonth = newStartDate.getUTCMonth() + originalMonthDiff;

    // 指定された月の最終日を取得
    const lastDayOfMonth = new Date(
      Date.UTC(newEndYear, newEndMonth + 1, 0),
    ).getUTCDate();

    // 締め日と月の最終日のうち小さい方を使用
    const actualEndDay = Math.min(closingDay, lastDayOfMonth);

    const newEndDate = new Date(
      Date.UTC(newEndYear, newEndMonth, actualEndDay),
    );

    return {
      ...baseValues,
      startDate: newStartDate,
      endDate: newEndDate,
    };
  };

  // 日付フォーマット関数
  const formatDate = (date: string | Date) => {
    return formatDateLongAsUTC(date);
  };

  // 契約ステータスの取得
  const getContractStatus = (contract: ContractOutput) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // 時刻を00:00:00に設定して日付のみで比較
    const endDate = new Date(contract.endDate);
    endDate.setHours(0, 0, 0, 0); // 時刻を00:00:00に設定して日付のみで比較

    if (endDate < now) {
      return { status: "終了", color: "text-red-600" };
    } else {
      return { status: "進行中", color: "text-green-600" };
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-3 font-semibold">
          <FileText className="text-3xl text-sky-400" />
          <h1 className="text-2xl">契約一覧</h1>
        </div>
        <Button
          onClick={() => {
            setActiveDialog("create");
          }}
        >
          新しい契約を作成
        </Button>
      </CardHeader>
      <CardContent>
        <FormError message={error} onClose={clearError} />
        <FormSuccess message={success} onClose={clearSuccess} />

        {/* 検索フォーム */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="契約名またはクライアント名で検索..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="flex-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              期間検索（契約期間と重複する期間を検索）
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <DatePicker
                placeholder="期間開始"
                value={periodFrom}
                onChange={(date) => {
                  setPeriodFrom(date);
                }}
                className="flex-1"
              />
              <span className="flex items-center text-muted-foreground">
                〜
              </span>
              <DatePicker
                placeholder="期間終了"
                value={periodTo}
                onChange={(date) => {
                  setPeriodTo(date);
                }}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim() && !periodFrom && !periodTo}
            >
              検索
            </Button>
            {isSearching && (
              <Button variant="outline" onClick={handleClearSearch}>
                クリア
              </Button>
            )}
          </div>
        </div>

        {/* 契約一覧 */}
        {contracts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              {isSearching ? "検索結果がありません" : "契約がありません"}
            </p>
            {!isSearching && (
              <p className="mt-2 text-muted-foreground">
                新しい契約を作成してください
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => {
              const statusInfo = getContractStatus(contract);
              return (
                <Card
                  key={contract.id}
                  className="w-full transition-all duration-200 hover:bg-muted/50 hover:shadow-lg"
                >
                  <div className="p-4">
                    <div className="flex w-full items-center justify-between">
                      <div
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-6"
                        onClick={() => {
                          handleNavigateToWorkReports(contract.id);
                        }}
                      >
                        <div className="min-w-48">
                          <h3 className="truncate text-lg font-semibold text-foreground">
                            {contract.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {contract.clientName}
                          </p>
                        </div>
                        <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
                          <div>開始: {formatDate(contract.startDate)}</div>
                          <div>終了: {formatDate(contract.endDate)}</div>
                        </div>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-3">
                        <span
                          className={`text-sm font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.status}
                        </span>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailsDialog(contract);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          詳細
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <ContractDialog
          type="details"
          isOpen={activeDialog === "details"}
          onClose={closeDialog}
        >
          {activeContract && (
            <ContractDetailsContent
              contract={activeContract}
              onNavigateToWorkReports={handleNavigateToWorkReports}
              onEdit={() => {
                setActiveDialog("edit");
              }}
              onCopy={() => {
                setActiveDialog("copy");
              }}
              onDelete={() => {
                setActiveDialog("delete");
              }}
              onClose={closeDialog}
              showWorkReportsButton
              showEditButton
              showCopyButton
              showDeleteButton
            />
          )}
        </ContractDialog>

        <ContractDialog
          type="create"
          isOpen={activeDialog === "create"}
          onClose={closeDialog}
        >
          <ContractForm
            onSubmit={onCreateContract}
            onCancel={closeDialog}
            submitButtonText="作成"
          />
        </ContractDialog>

        <ContractDialog
          type="edit"
          isOpen={activeDialog === "edit"}
          onClose={closeDialog}
        >
          <ContractForm
            defaultValues={
              activeContract
                ? convertContractToFormValues(activeContract)
                : undefined
            }
            onSubmit={onEditContract}
            onCancel={closeDialog}
            submitButtonText="更新"
            isEditing
          />
        </ContractDialog>

        <ContractDialog
          type="delete"
          isOpen={activeDialog === "delete"}
          onClose={closeDialog}
        >
          <div>
            <p>
              本当に契約 &quot;{activeContract?.name}&quot; を削除しますか？
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              関連する作業報告書も削除されます。この操作は元に戻すことができません。
            </p>
          </div>
          <DialogFooter sticky className="p-6">
            <Button variant="outline" onClick={closeDialog}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={onDeleteContract}>
              削除
            </Button>
          </DialogFooter>
        </ContractDialog>

        <ContractDialog
          type="copy"
          isOpen={activeDialog === "copy"}
          onClose={closeDialog}
        >
          <ContractForm
            defaultValues={
              activeContract
                ? convertContractToCopyFormValues(activeContract)
                : undefined
            }
            onSubmit={onCopyContract}
            onCancel={closeDialog}
            submitButtonText="作成"
          />
        </ContractDialog>
      </CardContent>
    </Card>
  );
}
