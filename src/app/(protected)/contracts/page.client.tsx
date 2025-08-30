"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatDateAsUTC, formatDateLongAsUTC } from "@/utils/date-utils";

export default function ContractsClientPage({ userId }: { userId: string }) {
  const { error, success, showError, showSuccess } = useMessageState();
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
  const fetchContracts = async () => {
    try {
      const contractsData = await getContractsByUserIdAction(userId);
      setContracts(contractsData);
    } catch (error: unknown) {
      console.error(error);
      showError("契約の取得に失敗しました");
    }
  };

  // 検索処理
  const handleSearch = () => {
    const hasSearchQuery = searchQuery.trim();
    const hasPeriodFilters = periodFrom || periodTo;

    if (!hasSearchQuery && !hasPeriodFilters) {
      setIsSearching(false);
      startTransition(async () => {
        await fetchContracts();
      });
      return;
    }

    setIsSearching(true);
    startTransition(async () => {
      try {
        const searchResults = await searchContractsAction(
          userId,
          searchQuery || undefined,
          periodFrom || undefined,
          periodTo || undefined,
        );
        setContracts(searchResults);
      } catch (error: unknown) {
        console.error(error);
        showError("検索に失敗しました");
      }
    });
  };

  // 検索クリア
  const handleClearSearch = () => {
    setSearchQuery("");
    setPeriodFrom("");
    setPeriodTo("");
    setIsSearching(false);
    startTransition(async () => {
      await fetchContracts();
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
    startTransition(async () => {
      try {
        await deleteContractAction(activeContract.id);
        showSuccess(`契約 '${activeContract.name}' を削除しました`);
        await fetchContracts();
      } catch (error: unknown) {
        console.error(error);
        showError(
          "契約の削除に失敗しました。関連する作業報告書が存在する可能性があります。",
        );
      } finally {
        closeDialog();
      }
    });
  };

  // 契約作成
  const onCreateContract = (data: ContractFormValues) => {
    startTransition(async () => {
      try {
        const contractData = convertContractFormValuesToContract(data, userId);
        await createContractAction(contractData);
        showSuccess(`契約 '${data.name}' を作成しました`);
        await fetchContracts();
      } catch (error: unknown) {
        console.error(error);
        showError("契約の作成に失敗しました");
      } finally {
        closeDialog();
      }
    });
  };

  // 契約編集
  const onEditContract = (data: ContractFormValues) => {
    if (!activeContract) return;
    startTransition(async () => {
      try {
        const contractData = convertContractFormValuesToContract(data, userId);
        await updateContractAction(activeContract.id, contractData);
        showSuccess(`契約 '${data.name}' を編集しました`);
        await fetchContracts();
      } catch (error: unknown) {
        console.error(error);
        showError("契約の更新に失敗しました");
      } finally {
        closeDialog();
      }
    });
  };

  // 初期データ読み込み
  useEffect(() => {
    startTransition(async () => {
      await fetchContracts();
    });
  }, [userId]);

  // 日付フォーマット関数
  const formatDate = (date: string | Date) => {
    return formatDateLongAsUTC(date);
  };

  // 契約ステータスの取得
  const getContractStatus = (contract: ContractOutput) => {
    const now = new Date();
    const endDate = contract.endDate ? new Date(contract.endDate) : null;

    if (endDate && endDate < now) {
      return { status: "終了", color: "text-red-600" };
    } else if (endDate) {
      return { status: "進行中", color: "text-green-600" };
    } else {
      return { status: "無期限", color: "text-blue-600" };
    }
  };

  return (
    <div className="mx-auto min-w-96 max-w-6xl p-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">契約一覧</h1>
          <Button
            onClick={() => {
              setActiveDialog("create");
            }}
          >
            新しい契約を作成
          </Button>
        </div>
        <p className="text-muted-foreground">あなたの契約を管理できます</p>
      </div>

      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess
        message={success.message}
        resetSignal={success.date.getTime()}
      />

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
          <div className="flex gap-2">
            <DatePicker
              placeholder="期間開始"
              value={periodFrom}
              onChange={(date) => {
                setPeriodFrom(date);
              }}
              className="flex-1"
            />
            <span className="flex items-center text-muted-foreground">〜</span>
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
                        {contract.endDate && (
                          <div>終了: {formatDate(contract.endDate)}</div>
                        )}
                        <div>担当: {contract.clientContactName}</div>
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
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium">基本情報</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    契約名
                  </label>
                  <p className="mt-1 whitespace-pre-line">
                    {activeContract.name}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    クライアント名
                  </label>
                  <p className="mt-1">{activeContract.clientName}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    担当者
                  </label>
                  <p className="mt-1">{activeContract.clientContactName}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    メールアドレス
                  </label>
                  <p className="mt-1">{activeContract.clientEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    開始日
                  </label>
                  <p className="mt-1">
                    {formatDateAsUTC(activeContract.startDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    終了日
                  </label>
                  <p className="mt-1">
                    {activeContract.endDate
                      ? formatDateAsUTC(activeContract.endDate)
                      : "なし"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">精算情報</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    月単価
                    {activeContract.taxInclusiveType === "INCLUSIVE"
                      ? "（税込）"
                      : "（税抜）"}
                  </label>
                  <p className="mt-1">
                    {activeContract.unitPrice
                      ? `${activeContract.unitPrice}円`
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    精算下限
                  </label>
                  <p className="mt-1">
                    {activeContract.settlementMin
                      ? `${activeContract.settlementMin}時間`
                      : "なし"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    精算上限
                  </label>
                  <p className="mt-1">
                    {activeContract.settlementMax
                      ? `${activeContract.settlementMax}時間`
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    超過単価
                    {activeContract.taxInclusiveType === "INCLUSIVE"
                      ? "（税込）"
                      : "（税抜）"}
                  </label>
                  <p className="mt-1">
                    {activeContract.upperRate
                      ? `${activeContract.upperRate}円`
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    控除単価
                    {activeContract.taxInclusiveType === "INCLUSIVE"
                      ? "（税込）"
                      : "（税抜）"}
                  </label>
                  <p className="mt-1">
                    {activeContract.lowerRate
                      ? `${activeContract.lowerRate}円`
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    中間単価
                    {activeContract.taxInclusiveType === "INCLUSIVE"
                      ? "（税込）"
                      : "（税抜）"}
                  </label>
                  <p className="mt-1">
                    {activeContract.middleRate
                      ? `${activeContract.middleRate}円`
                      : "なし"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">税務設定</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    税込・税抜設定
                  </label>
                  <p className="mt-1">
                    {activeContract.taxInclusiveType === "INCLUSIVE"
                      ? "税込"
                      : "税抜"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    消費税端数処理
                  </label>
                  <p className="mt-1">
                    {activeContract.taxRoundingType === "ROUND_DOWN" &&
                      "切り捨て"}
                    {activeContract.taxRoundingType === "ROUND_UP" &&
                      "切り上げ"}
                    {activeContract.taxRoundingType === "ROUND" && "四捨五入"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">勤務設定</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    1日あたりの作業単位
                  </label>
                  <p className="mt-1">
                    {activeContract.dailyWorkMinutes
                      ? `${activeContract.dailyWorkMinutes.toString()}分`
                      : "なし"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    1ヶ月あたりの作業単位
                  </label>
                  <p className="mt-1">
                    {activeContract.monthlyWorkMinutes
                      ? `${activeContract.monthlyWorkMinutes.toString()}分`
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    基本開始時刻
                  </label>
                  <p className="mt-1">
                    {activeContract.basicStartTime
                      ? new Date(
                          activeContract.basicStartTime,
                        ).toLocaleTimeString("en-US", {
                          timeZone: "UTC",
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    基本終了時刻
                  </label>
                  <p className="mt-1">
                    {activeContract.basicEndTime
                      ? new Date(
                          activeContract.basicEndTime,
                        ).toLocaleTimeString("en-US", {
                          timeZone: "UTC",
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    基本休憩時間
                  </label>
                  <p className="mt-1">
                    {activeContract.basicBreakDuration
                      ? `${activeContract.basicBreakDuration.toString()}分`
                      : "なし"}
                  </p>
                </div>
                <div className="col-span-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    締め日
                  </label>
                  <p className="mt-1">
                    {activeContract.closingDay
                      ? `${activeContract.closingDay.toString()}日`
                      : "末日"}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter sticky className="p-6">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveDialog("edit");
                }}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setActiveDialog("delete");
                }}
              >
                削除
              </Button>
              <Button variant="outline" onClick={closeDialog}>
                閉じる
              </Button>
            </DialogFooter>
          </div>
        )}
      </ContractDialog>

      <ContractDialog
        type="create"
        isOpen={activeDialog === "create"}
        onClose={closeDialog}
      >
        <ContractForm
          defaultValues={undefined}
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
          isEditing={true}
        />
      </ContractDialog>

      <ContractDialog
        type="delete"
        isOpen={activeDialog === "delete"}
        onClose={closeDialog}
      >
        <div>
          <p>本当に契約 &quot;{activeContract?.name}&quot; を削除しますか？</p>
          <p className="mt-2 text-sm text-muted-foreground">
            この操作は元に戻すことができません。
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
    </div>
  );
}
