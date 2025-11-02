"use client";

import { Button } from "@/components/ui/button";
import type { WorkReportStatus } from "@/features/work-report/types/work-report";

interface WorkReportActionsProps {
  status: WorkReportStatus;
  onStatusChange: () => void;
  onBulkEdit: () => void;
  onCreateReport: () => void;
  onFreeeConnect: () => void;
  onCreateInvoice: () => void;
  onSendEmail: () => void;
  isTransitioning?: boolean;
}

export function WorkReportActions({
  status,
  onStatusChange,
  onBulkEdit,
  onCreateReport,
  onFreeeConnect,
  onCreateInvoice,
  onSendEmail,
  isTransitioning,
}: WorkReportActionsProps) {
  const isSubmitted = status === "SUBMITTED";

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 flex justify-end">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onStatusChange}
          >
            {isSubmitted ? "月締め解除" : "月締め"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitted}
            onClick={onBulkEdit}
          >
            一括入力
          </Button>
        </div>
      </div>
      <div className="mb-4 flex justify-end">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!isSubmitted || isTransitioning}
            onClick={onCreateReport}
          >
            作業報告書を作成
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isSubmitted}
            onClick={onFreeeConnect}
          >
            freee連携
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isSubmitted}
            onClick={onCreateInvoice}
          >
            請求書作成
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isSubmitted}
            onClick={onSendEmail}
          >
            メール送信
          </Button>
        </div>
      </div>
    </div>
  );
}