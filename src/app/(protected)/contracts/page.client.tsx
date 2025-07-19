'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import { Input } from '@/components/ui/input';
import { useTransitionContext } from '@/contexts/transition-context';
import { getContractsByUserIdAction, searchContractsAction, deleteContractAction, createContractAction, updateContractAction } from '@/features/contract/actions/contract';
import { ContractOutput } from "@/features/contract/types/contract";
import { ContractDialog, type DialogType } from "@/features/contract/components/contract-dialog";
import { ContractForm, ContractFormValues } from "@/features/contract/components/contract-form";
import { convertContractFormValuesToContract, convertContractToFormValues } from "@/features/contract/utils/contract-converter";
import { useMessageState } from '@/hooks/use-message-state';

export default function ContractsClientPage({ userId }: { userId: string }) {
  const { error, success, showError, showSuccess } = useMessageState();
  const [contracts, setContracts] = useState<ContractOutput[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeContract, setActiveContract] = useState<ContractOutput | null>(null);
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
      showError('契約の取得に失敗しました');
    }
  };

  // 検索処理
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await fetchContracts();
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await searchContractsAction(userId, searchQuery);
      setContracts(searchResults);
    } catch (error: unknown) {
      console.error(error);
      showError('検索に失敗しました');
    }
  };

  // 検索クリア
  const handleClearSearch = () => {
    setSearchQuery('');
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
        closeDialog();
        await fetchContracts();
      } catch (error: unknown) {
        console.error(error);
        showError('契約の削除に失敗しました。関連する作業報告書が存在する可能性があります。');
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
        closeDialog();
        await fetchContracts();
      } catch (error: unknown) {
        console.error(error);
        showError('契約の作成に失敗しました');
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
        closeDialog();
        await fetchContracts();
      } catch (error: unknown) {
        console.error(error);
        showError('契約の更新に失敗しました');
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
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 契約ステータスの取得
  const getContractStatus = (contract: ContractOutput) => {
    const now = new Date();
    const endDate = contract.endDate ? new Date(contract.endDate) : null;

    if (endDate && endDate < now) {
      return { status: '終了', color: 'text-red-600' };
    } else if (endDate) {
      return { status: '進行中', color: 'text-green-600' };
    } else {
      return { status: '無期限', color: 'text-blue-600' };
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">契約一覧</h1>
          <Button onClick={() => { setActiveDialog("create"); }}>
            新しい契約を作成
          </Button>
        </div>
        <p className="text-gray-600">あなたの契約を管理できます</p>
      </div>

      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess message={success.message} resetSignal={success.date.getTime()} />

      {/* 検索バー */}
      <div className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="契約名またはクライアント名で検索..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              void handleSearch();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
          検索
        </Button>
        {isSearching && (
          <Button variant="outline" onClick={handleClearSearch}>
            クリア
          </Button>
        )}
      </div>

      {/* 契約一覧 */}
      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isSearching ? '検索結果がありません' : '契約がありません'}
          </p>
          {!isSearching && (
            <p className="text-gray-400 mt-2">
              新しい契約を作成してください
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contracts.map((contract) => {
            const statusInfo = getContractStatus(contract);
            return (
              <Card
                key={contract.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => { openDetailsDialog(contract); }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">
                      {contract.name}
                    </CardTitle>
                    <span className={`text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.status}
                    </span>
                  </div>
                  <CardDescription className="text-base font-medium text-gray-700">
                    {contract.clientName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>開始日:</span>
                      <span>{formatDate(contract.startDate)}</span>
                    </div>
                    {contract.endDate && (
                      <div className="flex justify-between">
                        <span>終了日:</span>
                        <span>{formatDate(contract.endDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>担当者:</span>
                      <span>{contract.clientContactName}</span>
                    </div>
                    {contract.unitPrice && (
                      <div className="flex justify-between">
                        <span>月単価:</span>
                        <span className="font-medium">
                          ¥{Number(contract.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
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
                <div className="font-semibold">契約名</div>
                <div>{activeContract.name}</div>
                <div>
                  <label className="text-sm font-medium text-gray-500">クライアント名</label>
                  <p className="mt-1">{activeContract.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">担当者</label>
                  <p className="mt-1">{activeContract.clientContactName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">メールアドレス</label>
                  <p className="mt-1">{activeContract.clientEmail}</p>
                </div>
                <div className="font-semibold">開始日</div>
                <div>{new Date(activeContract.startDate).toLocaleDateString()}</div>
                <div className="font-semibold">終了日</div>
                <div>{activeContract.endDate ? new Date(activeContract.endDate).toLocaleDateString() : 'なし'}</div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">精算情報</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="font-semibold">単価</div>
                <div>{activeContract.unitPrice ? `${activeContract.unitPrice}円` : 'なし'}</div>
                <div className="font-semibold">精算下限</div>
                <div>{activeContract.settlementMin ? `${activeContract.settlementMin}時間` : 'なし'}</div>
                <div className="font-semibold">精算上限</div>
                <div>{activeContract.settlementMax ? `${activeContract.settlementMax}時間` : 'なし'}</div>
                <div className="font-semibold">超過単価</div>
                <div>{activeContract.upperRate ? `${activeContract.upperRate}円` : 'なし'}</div>
                <div className="font-semibold">控除単価</div>
                <div>{activeContract.lowerRate ? `${activeContract.lowerRate}円` : 'なし'}</div>
                <div className="font-semibold">中間単価</div>
                <div>{activeContract.middleRate ? `${activeContract.middleRate}円` : 'なし'}</div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium">勤務設定</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="font-semibold">1日あたりの作業単位</div>
                <div>{activeContract.dailyWorkMinutes ? `${activeContract.dailyWorkMinutes.toString()}分` : 'なし'}</div>
                <div className="font-semibold">1ヶ月あたりの作業単位</div>
                <div>{activeContract.monthlyWorkMinutes ? `${activeContract.monthlyWorkMinutes.toString()}分` : 'なし'}</div>
                <div className="font-semibold">基本開始時刻</div>
                <div>{activeContract.basicStartTime ? new Date(activeContract.basicStartTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) : 'なし'}</div>
                <div className="font-semibold">基本終了時刻</div>
                <div>{activeContract.basicEndTime ? new Date(activeContract.basicEndTime).toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) : 'なし'}</div>
                <div className="font-semibold">基本休憩時間</div>
                <div>{activeContract.basicBreakDuration ? `${activeContract.basicBreakDuration.toString()}分` : 'なし'}</div>
                <div className="font-semibold">締め日</div>
                <div>{activeContract.closingDay ? `${activeContract.closingDay.toString()}日` : '末日'}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setActiveDialog("edit"); }}>編集</Button>
              <Button variant="destructive" onClick={() => { setActiveDialog("delete"); }}>削除</Button>
              <Button onClick={() => { handleNavigateToWorkReports(activeContract.id); }}>
                作業報告書を表示
              </Button>
              <Button variant="outline" onClick={closeDialog}>閉じる</Button>
            </div>
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
          defaultValues={activeContract ? convertContractToFormValues(activeContract) : undefined}
          onSubmit={onEditContract}
          onCancel={closeDialog}
          submitButtonText="更新"
        />
      </ContractDialog>

      <ContractDialog
        type="delete"
        isOpen={activeDialog === "delete"}
        onClose={closeDialog}
      >
        <div>
          <p>本当に契約 &quot;{activeContract?.name}&quot; を削除しますか？</p>
          <p className="mt-2 text-sm text-gray-500">この操作は元に戻すことができません。</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={closeDialog}>キャンセル</Button>
          <Button variant="destructive" onClick={onDeleteContract}>削除</Button>
        </div>
      </ContractDialog>
    </div>
  );
}