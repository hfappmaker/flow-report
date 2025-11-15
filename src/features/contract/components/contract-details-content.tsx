import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { type ContractOutput } from "@/features/contract/types/contract";
import { formatDateAsUTC } from "@/utils/date-utils";

interface ContractDetailsContentProps {
  contract: ContractOutput;
  onNavigateToWorkReports?: (contractId: string) => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  showWorkReportsButton?: boolean;
  showEditButton?: boolean;
  showCopyButton?: boolean;
  showDeleteButton?: boolean;
}

export const ContractDetailsContent = ({
  contract,
  onNavigateToWorkReports,
  onEdit,
  onCopy,
  onDelete,
  onClose,
  showWorkReportsButton = true,
  showEditButton = false,
  showCopyButton = false,
  showDeleteButton = false,
}: ContractDetailsContentProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-medium">基本情報</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              契約名
            </label>
            <p className="mt-1 whitespace-pre-line">{contract.name}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              クライアント名
            </label>
            <p className="mt-1">{contract.clientName}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              担当者
            </label>
            <p className="mt-1">{contract.clientContactName}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              メールアドレス
            </label>
            <p className="mt-1">{contract.clientEmail}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              開始日
            </label>
            <p className="mt-1">{formatDateAsUTC(contract.startDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              終了日
            </label>
            <p className="mt-1">{formatDateAsUTC(contract.endDate)}</p>
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
              {contract.taxInclusiveType === "INCLUSIVE" ? "税込" : "税抜"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              消費税端数処理
            </label>
            <p className="mt-1">
              {contract.taxRoundingType === "ROUND_DOWN" && "切り捨て"}
              {contract.taxRoundingType === "ROUND_UP" && "切り上げ"}
              {contract.taxRoundingType === "ROUND" && "四捨五入"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">精算情報</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3">
            <label className="text-sm font-medium text-muted-foreground">
              精算方式
            </label>
            <p className="mt-1">
              {contract.rateType === "upperLower" && "上下割"}
              {contract.rateType === "middle" && "中間割"}
              {contract.rateType === "fixed" && "固定精算"}
              {contract.rateType === "hourlyRate" && "時間単価"}
            </p>
          </div>
          {contract.rateType !== "hourlyRate" && (
            <div className="col-span-3">
              <label className="text-sm font-medium text-muted-foreground">
                月単価
                {contract.taxInclusiveType === "INCLUSIVE"
                  ? "（税込）"
                  : "（税抜）"}
              </label>
              <p className="mt-1">
                {contract.unitPrice ? `${contract.unitPrice}円` : "なし"}
              </p>
            </div>
          )}
          {contract.rateType === "upperLower" && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  超過単価
                  {contract.taxInclusiveType === "INCLUSIVE"
                    ? "（税込）"
                    : "（税抜）"}
                </label>
                <p className="mt-1">
                  {contract.upperRate ? `${contract.upperRate}円` : "なし"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  控除単価
                  {contract.taxInclusiveType === "INCLUSIVE"
                    ? "（税込）"
                    : "（税抜）"}
                </label>
                <p className="mt-1">
                  {contract.lowerRate ? `${contract.lowerRate}円` : "なし"}
                </p>
              </div>
            </>
          )}
          {contract.rateType === "middle" && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                中間単価
                {contract.taxInclusiveType === "INCLUSIVE"
                  ? "（税込）"
                  : "（税抜）"}
              </label>
              <p className="mt-1">
                {contract.middleRate ? `${contract.middleRate}円` : "なし"}
              </p>
            </div>
          )}
          {contract.rateType === "hourlyRate" && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                時間単価
                {contract.taxInclusiveType === "INCLUSIVE"
                  ? "（税込）"
                  : "（税抜）"}
              </label>
              <p className="mt-1">
                {contract.hourlyRate ? `${contract.hourlyRate}円` : "なし"}
              </p>
            </div>
          )}
          {contract.rateType !== "hourlyRate" &&
            contract.rateType !== "fixed" && (
              <>
                <div className="col-start-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    精算下限
                  </label>
                  <p className="mt-1">
                    {contract.settlementMin
                      ? `${contract.settlementMin}時間`
                      : "なし"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    精算上限
                  </label>
                  <p className="mt-1">
                    {contract.settlementMax
                      ? `${contract.settlementMax}時間`
                      : "なし"}
                  </p>
                </div>
              </>
            )}
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
              {contract.dailyWorkMinutes
                ? `${contract.dailyWorkMinutes.toString()}分`
                : "なし"}
            </p>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              1ヶ月あたりの作業単位
            </label>
            <p className="mt-1">
              {contract.monthlyWorkMinutes
                ? `${contract.monthlyWorkMinutes.toString()}分`
                : "なし"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              基本開始時刻
            </label>
            <p className="mt-1">
              {contract.basicStartTime
                ? new Date(contract.basicStartTime).toLocaleTimeString(
                    "en-US",
                    {
                      timeZone: "UTC",
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )
                : "なし"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              基本終了時刻
            </label>
            <p className="mt-1">
              {contract.basicEndTime
                ? new Date(contract.basicEndTime).toLocaleTimeString("en-US", {
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
              {contract.basicBreakDuration
                ? `${contract.basicBreakDuration.toString()}分`
                : "なし"}
            </p>
          </div>
          <div className="col-span-3">
            <label className="text-sm font-medium text-muted-foreground">
              基本作業内容
            </label>
            <p className="mt-1 whitespace-pre-line">
              {contract.basicMemo || "なし"}
            </p>
          </div>
          <div className="col-span-3">
            <label className="text-sm font-medium text-muted-foreground">
              締め日
            </label>
            <p className="mt-1">
              {contract.closingDay
                ? `${contract.closingDay.toString()}日`
                : "末日"}
            </p>
          </div>
        </div>
      </div>

      <DialogFooter sticky className="p-6">
        {showWorkReportsButton && onNavigateToWorkReports && (
          <Button
            variant="outline"
            onClick={() => {
              onNavigateToWorkReports(contract.id);
            }}
          >
            作業報告書一覧
          </Button>
        )}
        {showEditButton && onEdit && (
          <Button variant="outline" onClick={onEdit}>
            編集
          </Button>
        )}
        {showCopyButton && onCopy && (
          <Button variant="outline" onClick={onCopy}>
            コピー
          </Button>
        )}
        {showDeleteButton && onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            削除
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          閉じる
        </Button>
      </DialogFooter>
    </div>
  );
};
