"use client";

import { formatAmount } from "@/features/contract/utils/contract-calculation-utils";

interface WorkReportSummaryProps {
  workTimeText: string;
  amountCalculation: {
    baseAmount: number;
    taxAmount: number;
  } | null;
}

export function WorkReportSummary({
  workTimeText,
  amountCalculation,
}: WorkReportSummaryProps) {
  return (
    <div className="mb-6 rounded-lg border bg-muted/30 p-4">
      <h2 className="mb-3 text-lg font-semibold">稼働時間・金額サマリー</h2>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">稼働時間:</span>
          <div className="text-base font-semibold">{workTimeText}</div>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">税抜金額:</span>
          <div className="text-base font-semibold">
            {amountCalculation
              ? formatAmount(amountCalculation.baseAmount)
              : "¥---,---"}
          </div>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">税込金額:</span>
          <div className="text-base font-semibold">
            {amountCalculation
              ? formatAmount(
                  amountCalculation.baseAmount + amountCalculation.taxAmount,
                )
              : "¥---,---"}
          </div>
        </div>
      </div>
    </div>
  );
}