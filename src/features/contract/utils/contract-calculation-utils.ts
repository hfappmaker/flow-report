/**
 * 作業時間（分）から契約に基づく金額の詳細を計算する（明細分割用）
 */
export function calculateWorkAmountDetailed(
  workMinutes: number,
  params: {
    unitPrice?: number | null;
    settlementMin?: number | null;
    settlementMax?: number | null;
    upperRate?: number | null;
    lowerRate?: number | null;
    middleRate?: number | null;
    hourlyRate?: number | null;
    taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
    taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
    rateType?: "middle" | "upperLower" | "fixed" | "hourlyRate";
  },
): {
  baseAmount: number;
  excessInfo: {
    hours: number;
    rate: number;
    amount: number;
  };
  deductionInfo: {
    hours: number;
    rate: number;
    amount: number;
  };
  taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
  taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
} | null {
  // 固定精算の場合
  if (params.rateType === "fixed") {
    if (!params.unitPrice) {
      return null;
    }
    return {
      baseAmount: params.unitPrice,
      excessInfo: { hours: 0, rate: 0, amount: 0 },
      deductionInfo: { hours: 0, rate: 0, amount: 0 },
      taxInclusiveType: params.taxInclusiveType,
      taxRoundingType: params.taxRoundingType,
    };
  }

  // 時間単価の場合
  if (params.rateType === "hourlyRate") {
    if (!params.hourlyRate) {
      return null;
    }
    const workHours = workMinutes / 60;
    const totalAmount = workHours * params.hourlyRate;
    return {
      baseAmount: totalAmount,
      excessInfo: { hours: 0, rate: 0, amount: 0 },
      deductionInfo: { hours: 0, rate: 0, amount: 0 },
      taxInclusiveType: params.taxInclusiveType,
      taxRoundingType: params.taxRoundingType,
    };
  }

  // 上下割・中間割の場合（従来の処理）
  // 単価が設定されていない場合、または精算上限・下限の両方が設定されていない場合はnullを返す
  if (!params.unitPrice || !(params.settlementMin && params.settlementMax)) {
    return null;
  }

  const workHours = workMinutes / 60;
  const settlementMin = params.settlementMin;
  const settlementMax = params.settlementMax;

  const baseAmount = params.unitPrice; // 基本単価

  // 超過単価と控除単価を取得（設定されていない場合は0）
  const excessRate =
    params.rateType === "upperLower"
      ? (params.upperRate ?? 0)
      : (params.middleRate ?? 0);
  const deductionRate =
    params.rateType === "upperLower"
      ? (params.lowerRate ?? 0)
      : (params.middleRate ?? 0);

  // 超過・控除時間を計算
  let excessHours = 0;
  let deductionHours = 0;

  if (workHours < settlementMin) {
    // 控除処理
    if (params.rateType === "upperLower" && !params.lowerRate) {
      return null;
    }
    if (params.rateType === "middle" && !params.middleRate) {
      return null;
    }
    deductionHours = settlementMin - workHours;
  } else if (workHours > settlementMax) {
    // 超過処理
    if (params.rateType === "upperLower" && !params.upperRate) {
      return null;
    }
    if (params.rateType === "middle" && !params.middleRate) {
      return null;
    }
    excessHours = workHours - settlementMax;
  }

  // 超過情報（常に設定）
  const excessInfo = {
    hours: excessHours,
    rate: excessRate,
    amount: excessHours * excessRate,
  };

  // 控除情報（常に設定）
  const deductionInfo = {
    hours: deductionHours,
    rate: deductionRate,
    amount: deductionHours * deductionRate,
  };

  return {
    baseAmount,
    excessInfo,
    deductionInfo,
    taxInclusiveType: params.taxInclusiveType,
    taxRoundingType: params.taxRoundingType,
  };
}

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
    hourlyRate?: number | null;
    taxInclusiveType: "INCLUSIVE" | "EXCLUSIVE";
    taxRoundingType: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
    rateType?: "middle" | "upperLower" | "fixed" | "hourlyRate";
  },
): {
  baseAmount: number;
  taxAmount: number;
  displayAmount: number;
  displayLabel: string;
} | null {
  const workHours = workMinutes / 60;
  let contractAmount: number;

  // 固定精算の場合
  if (params.rateType === "fixed") {
    if (!params.unitPrice) {
      return null;
    }
    contractAmount = params.unitPrice;
  }
  // 時間単価の場合
  else if (params.rateType === "hourlyRate") {
    if (!params.hourlyRate) {
      return null;
    }
    contractAmount = workHours * params.hourlyRate;
  }
  // 上下割・中間割の場合（従来の処理）
  else {
    // 単価が設定されていない場合、または精算上限・下限の両方が設定されていない場合はnullを返す（ハイフン表示用）
    if (!params.unitPrice || !(params.settlementMin && params.settlementMax)) {
      return null;
    }

    // 契約の単価が税込か税抜かによって基準金額を決定
    contractAmount = params.unitPrice; // 契約上の月単価

    // 精算処理（この時点で両方の値が設定されていることが保証されている）
    const settlementMin = params.settlementMin;
    const settlementMax = params.settlementMax;

    if (workHours < settlementMin) {
      if (params.rateType === "upperLower" && !params.lowerRate) {
        return null;
      }
      if (params.rateType === "middle" && !params.middleRate) {
        return null;
      }
      // 稼働時間が精算下限を下回る場合：控除処理
      const shortfallHours = settlementMin - workHours;
      const deductionRate =
        params.rateType === "middle"
          ? (params.middleRate ?? 0)
          : (params.lowerRate ?? 0);

      contractAmount = contractAmount - shortfallHours * deductionRate;
    } else if (workHours > settlementMax) {
      if (params.rateType === "upperLower" && !params.upperRate) {
        return null;
      }
      if (params.rateType === "middle" && !params.middleRate) {
        return null;
      }
      // 稼働時間が精算上限を上回る場合：超過処理
      const excessHours = workHours - settlementMax;
      const excessRate =
        params.rateType === "middle"
          ? (params.middleRate ?? 0)
          : (params.upperRate ?? 0);

      contractAmount = contractAmount + excessHours * excessRate;
    }
    // 精算範囲内の場合はunitPriceのまま
  }

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
 * 稼働日数を計算する（startTimeとendTimeの両方がnullでない日数をカウント）
 */
export function calculateWorkingDays(
  attendances: {
    startTime?: string | Date | null;
    endTime?: string | Date | null;
  }[],
): number {
  return attendances.filter((attendance) => {
    return attendance.startTime != null && attendance.endTime != null;
  }).length;
}

/**
 * 基本稼働時間（分）を計算する
 * (基本終了時刻 - 基本開始時刻) - 基本休憩時間
 */
export function calculateBasicWorkMinutes(
  basicStartTime: Date | null,
  basicEndTime: Date | null,
  basicBreakDuration: number | null,
): number | null {
  if (!basicStartTime || !basicEndTime) {
    return null;
  }

  try {
    // 開始時刻と終了時刻から作業時間を計算（分）
    const workMinutes =
      (basicEndTime.getTime() - basicStartTime.getTime()) / (1000 * 60);

    // 休憩時間を差し引く
    const breakMinutes = basicBreakDuration ?? 0;

    return Math.max(0, workMinutes - breakMinutes);
  } catch (error) {
    console.error("Error calculating basic work minutes:", error);
    return null;
  }
}

/**
 * 時間を「○時間○分」形式でフォーマットする
 */
export function formatWorkTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${String(remainingMinutes)}分`;
  } else if (remainingMinutes === 0) {
    return `${String(hours)}時間`;
  } else {
    return `${String(hours)}時間${String(remainingMinutes)}分`;
  }
}

/**
 * 金額を「¥○○○,○○○」形式でフォーマットする
 */
export function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}
