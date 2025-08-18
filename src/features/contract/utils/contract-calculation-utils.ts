/**
 * 作業時間（分）から契約に基づく金額を計算する
 */
export function calculateWorkAmount(
  workMinutes: number,
  params: {
    unitPrice?: number | null;
    settlementMin?: number | null;
    settlementMax?: number | null;
    upperRate?: number | null;
    lowerRate?: number | null;
    middleRate?: number | null;
    taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
    taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
    rateType?: "middle" | "upperLower";
  },
): {
  baseAmount: number;
  taxAmount: number;
  displayAmount: number;
  displayLabel: string;
} | null {
  // 単価が設定されていない場合、または精算上限・下限の両方が設定されていない場合はnullを返す（ハイフン表示用）
  if (!params.unitPrice || !(params.settlementMin && params.settlementMax)) {
    return null;
  }

  const workHours = workMinutes / 60;

  // 契約の単価が税込か税抜かによって基準金額を決定
  let contractAmount = params.unitPrice; // 契約上の月単価

  // 精算処理（この時点で両方の値が設定されていることが保証されている）
  const settlementMin = params.settlementMin;
  const settlementMax = params.settlementMax;

  if (workHours < settlementMin) {
    if(params.rateType === "upperLower" && !params.lowerRate){
      return null;
    }
    if(params.rateType === "middle" && !params.middleRate){
      return null;
    }
    // 稼働時間が精算下限を下回る場合：控除処理
    const shortfallHours = settlementMin - workHours;
    const deductionRate =
      params.rateType === "middle"
        ? params.middleRate ?? 0
        : params.lowerRate ?? 0;

    contractAmount = contractAmount - shortfallHours * deductionRate;
  } else if (workHours > settlementMax) {
    if(params.rateType === "upperLower" && !params.upperRate){
      return null;
    }
    if(params.rateType === "middle" && !params.middleRate){
      return null;
    }
    // 稼働時間が精算上限を上回る場合：超過処理
    const excessHours = workHours - settlementMax;
    const excessRate =
      params.rateType === "middle"
        ? params.middleRate ?? 0
        : params.upperRate ?? 0;

    contractAmount = contractAmount + excessHours * excessRate;
  }
  // 精算範囲内の場合はunitPriceのまま

  // マイナス金額を防ぐ
  contractAmount = Math.max(0, Math.round(contractAmount));

  let baseAmount: number;
  let taxAmount: number;
  let displayAmount: number;
  let displayLabel: string;

  if (params.taxInclusiveType === "INCLUSIVE") {
    // 契約上の単価が税込の場合
    displayAmount = contractAmount;
    displayLabel = "税込";

    // 税抜金額を逆算（税込金額から消費税を差し引く）
    // 税込金額 = 税抜金額 + 消費税
    // 消費税 = 税抜金額 × 0.1
    // 税込金額 = 税抜金額 × 1.1
    // 税抜金額 = 税込金額 ÷ 1.1
    let calculatedBaseAmount = contractAmount / 1.1;

    // 税抜金額の端数処理（消費税端数処理設定に基づく）
    switch (params.taxRoundingType) {
      case "ROUND_UP":
        calculatedBaseAmount = Math.floor(calculatedBaseAmount); // 税抜を切り下げることで消費税を切り上げ
        break;
      case "ROUND_DOWN":
        calculatedBaseAmount = Math.ceil(calculatedBaseAmount); // 税抜を切り上げることで消費税を切り下げ
        break;
      case "ROUND":
        calculatedBaseAmount = Math.round(calculatedBaseAmount);
        break;
      default:
        calculatedBaseAmount = Math.ceil(calculatedBaseAmount); // デフォルトは消費税切り捨て（税抜切り上げ）
    }

    baseAmount = Math.round(calculatedBaseAmount);
    taxAmount = contractAmount - baseAmount;
  } else {
    // 契約上の単価が税抜の場合
    baseAmount = contractAmount;
    displayLabel = "税抜";

    // 消費税計算（10%）
    const taxRate = 0.1;
    let calculatedTaxAmount = baseAmount * taxRate;

    // 消費税端数処理
    switch (params.taxRoundingType) {
      case "ROUND_UP":
        calculatedTaxAmount = Math.ceil(calculatedTaxAmount);
        break;
      case "ROUND_DOWN":
        calculatedTaxAmount = Math.floor(calculatedTaxAmount);
        break;
      case "ROUND":
        calculatedTaxAmount = Math.round(calculatedTaxAmount);
        break;
      default:
        calculatedTaxAmount = Math.floor(calculatedTaxAmount); // デフォルトは切り捨て
    }

    taxAmount = calculatedTaxAmount;
    displayAmount = baseAmount; // 税抜表示
  }

  return {
    baseAmount,
    taxAmount,
    displayAmount,
    displayLabel,
  };
}

/**
 * 作業報告書から総稼働時間（分）を計算する
 */
export function calculateTotalWorkMinutes(
  attendances: {
    startTime?: string | Date | null;
    endTime?: string | Date | null;
    breakDuration?: number | null;
  }[],
): number {
  return attendances.reduce((total, attendance) => {
    if (!attendance.startTime || !attendance.endTime) {
      return total;
    }

    try {
      // 時刻のみの文字列を今日の日付と組み合わせて時間計算
      const startTime = new Date(attendance.startTime);
      const endTime = new Date(attendance.endTime);

      // 開始時刻と終了時刻から作業時間を計算（分）
      const workMinutes =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60);

      // 休憩時間を差し引く
      const breakMinutes = attendance.breakDuration ?? 0;

      return total + Math.max(0, workMinutes - breakMinutes);
    } catch (error) {
      console.error("Error calculating work minutes:", error);
      return total;
    }
  }, 0);
}

/**
 * 時間を「○時間○分」形式でフォーマットする
 */
export function formatWorkTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}分`;
  } else if (remainingMinutes === 0) {
    return `${hours}時間`;
  } else {
    return `${hours}時間${remainingMinutes}分`;
  }
}

/**
 * 金額を「¥○○○,○○○」形式でフォーマットする
 */
export function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}
