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
    excessTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
    deductionTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
    rateType?: "middle" | "upperLower" | "fixed" | "hourlyRate";
    monthlyWorkMinutes?: number | null;
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
  excessTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
  deductionTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
} | null {
  // monthlyWorkMinutes単位で切り捨て
  const roundedWorkMinutes =
    params.monthlyWorkMinutes && params.monthlyWorkMinutes > 0
      ? Math.floor(workMinutes / params.monthlyWorkMinutes) *
        params.monthlyWorkMinutes
      : workMinutes;

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
      excessTaxRoundingType: params.excessTaxRoundingType,
      deductionTaxRoundingType: params.deductionTaxRoundingType,
    };
  }

  // 時間単価の場合
  if (params.rateType === "hourlyRate") {
    if (!params.hourlyRate) {
      return null;
    }
    const workHours = roundedWorkMinutes / 60;
    const totalAmount = workHours * params.hourlyRate;
    return {
      baseAmount: totalAmount,
      excessInfo: { hours: 0, rate: 0, amount: 0 },
      deductionInfo: { hours: 0, rate: 0, amount: 0 },
      taxInclusiveType: params.taxInclusiveType,
      taxRoundingType: params.taxRoundingType,
      excessTaxRoundingType: params.excessTaxRoundingType,
      deductionTaxRoundingType: params.deductionTaxRoundingType,
    };
  }

  // 上下割・中間割の場合（従来の処理）
  // 単価が設定されていない場合、または精算上限・下限の両方が設定されていない場合はnullを返す
  if (!params.unitPrice || !(params.settlementMin && params.settlementMax)) {
    return null;
  }

  const workHours = roundedWorkMinutes / 60;
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
  const excessHours =
    workHours > settlementMax
      ? (() => {
          // 超過処理のバリデーション
          if (params.rateType === "upperLower" && !params.upperRate) {
            return null;
          }
          if (params.rateType === "middle" && !params.middleRate) {
            return null;
          }
          return workHours - settlementMax;
        })()
      : 0;

  const deductionHours =
    workHours < settlementMin
      ? (() => {
          // 控除処理のバリデーション
          if (params.rateType === "upperLower" && !params.lowerRate) {
            return null;
          }
          if (params.rateType === "middle" && !params.middleRate) {
            return null;
          }
          return settlementMin - workHours;
        })()
      : 0;

  // バリデーションエラーの場合はnullを返す
  if (excessHours === null || deductionHours === null) {
    return null;
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
    excessTaxRoundingType: params.excessTaxRoundingType,
    deductionTaxRoundingType: params.deductionTaxRoundingType,
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
    excessTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
    deductionTaxRoundingType?: "ROUND_DOWN" | "ROUND_UP" | "ROUND";
    rateType?: "middle" | "upperLower" | "fixed" | "hourlyRate";
    monthlyWorkMinutes?: number | null;
  },
): {
  baseAmount: number;
  taxAmount: number;
  displayAmount: number;
  displayLabel: string;
} | null {
  // 作業時間の丸め処理（monthlyWorkMinutes単位で切り捨て）
  const roundedWorkMinutes =
    params.monthlyWorkMinutes && params.monthlyWorkMinutes > 0
      ? Math.floor(workMinutes / params.monthlyWorkMinutes) *
        params.monthlyWorkMinutes
      : workMinutes;

  const workHours = roundedWorkMinutes / 60;

  // 契約金額と精算状態を計算
  const contractCalc = (() => {
    // 固定精算の場合
    if (params.rateType === "fixed") {
      if (!params.unitPrice) {
        return null;
      }
      return { amount: params.unitPrice, settlementType: "normal" as const };
    }

    // 時間単価の場合
    if (params.rateType === "hourlyRate") {
      if (!params.hourlyRate) {
        return null;
      }
      return {
        amount: workHours * params.hourlyRate,
        settlementType: "normal" as const,
      };
    }

    // 上下割・中間割の場合（従来の処理）
    // 単価が設定されていない場合、または精算上限・下限の両方が設定されていない場合はnullを返す（ハイフン表示用）
    if (!params.unitPrice || !(params.settlementMin && params.settlementMax)) {
      return null;
    }

    // 契約の単価が税込か税抜かによって基準金額を決定
    const baseUnitPrice = params.unitPrice; // 契約上の月単価

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

      return {
        amount: baseUnitPrice - shortfallHours * deductionRate,
        settlementType: "deduction" as const,
      };
    }

    if (workHours > settlementMax) {
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

      return {
        amount: baseUnitPrice + excessHours * excessRate,
        settlementType: "excess" as const,
      };
    }

    // 精算範囲内の場合はunitPriceのまま
    return { amount: baseUnitPrice, settlementType: "normal" as const };
  })();

  // contractCalcがnullの場合は早期リターン
  if (contractCalc === null) {
    return null;
  }

  const contractAmount = contractCalc.amount;

  // 使用する端数処理を決定
  const effectiveTaxRoundingType = (() => {
    if (contractCalc.settlementType === "excess") {
      return params.excessTaxRoundingType ?? params.taxRoundingType;
    }
    if (contractCalc.settlementType === "deduction") {
      return params.deductionTaxRoundingType ?? params.taxRoundingType;
    }
    return params.taxRoundingType;
  })();

  // マイナス金額を防ぐ
  const finalContractAmount = Math.max(0, Math.round(contractAmount));

  // 税込・税抜の計算
  const taxCalculation =
    params.taxInclusiveType === "INCLUSIVE"
      ? (() => {
          // 契約上の単価が税込の場合
          // 税抜金額を逆算（税込金額から消費税を差し引く）
          // 税込金額 = 税抜金額 + 消費税
          // 消費税 = 税抜金額 × 0.1
          // 税込金額 = 税抜金額 × 1.1
          // 税抜金額 = 税込金額 ÷ 1.1
          const rawBaseAmount = finalContractAmount / 1.1;

          // 税抜金額の端数処理（消費税端数処理設定に基づく）
          const calculatedBaseAmount = (() => {
            switch (effectiveTaxRoundingType) {
              case "ROUND_UP":
                return Math.floor(rawBaseAmount); // 税抜を切り下げることで消費税を切り上げ
              case "ROUND_DOWN":
                return Math.ceil(rawBaseAmount); // 税抜を切り上げることで消費税を切り下げ
              case "ROUND":
                return Math.round(rawBaseAmount);
              default:
                return Math.ceil(rawBaseAmount); // デフォルトは消費税切り捨て（税抜切り上げ）
            }
          })();

          const baseAmount = Math.round(calculatedBaseAmount);
          const taxAmount = finalContractAmount - baseAmount;

          return {
            baseAmount,
            taxAmount,
            displayAmount: finalContractAmount,
            displayLabel: "税込" as const,
          };
        })()
      : (() => {
          // 契約上の単価が税抜の場合
          const baseAmount = finalContractAmount;

          // 消費税計算（10%）
          const taxRate = 0.1;
          const rawTaxAmount = baseAmount * taxRate;

          // 消費税端数処理
          const calculatedTaxAmount = (() => {
            switch (effectiveTaxRoundingType) {
              case "ROUND_UP":
                return Math.ceil(rawTaxAmount);
              case "ROUND_DOWN":
                return Math.floor(rawTaxAmount);
              case "ROUND":
                return Math.round(rawTaxAmount);
              default:
                return Math.floor(rawTaxAmount); // デフォルトは切り捨て
            }
          })();

          return {
            baseAmount,
            taxAmount: calculatedTaxAmount,
            displayAmount: baseAmount, // 税抜表示
            displayLabel: "税抜" as const,
          };
        })();

  return taxCalculation;
}

/**
 * 作業報告書から総稼働時間（分）を計算する
 * @param attendances 勤怠データの配列
 * @param monthlyWorkMinutes 月次作業時間の単位（分）- 指定された場合、この単位で切り捨て
 */
export function calculateTotalWorkMinutes(
  attendances: {
    startTime?: string | Date | null;
    endTime?: string | Date | null;
    breakDuration?: number | null;
  }[],
  monthlyWorkMinutes?: number | null,
): number {
  const totalMinutes = attendances.reduce((total, attendance) => {
    if (!attendance.startTime || !attendance.endTime) {
      return total;
    }

    try {
      // 時刻のみの文字列を今日の日付と組み合わせて時間計算
      const startTime = new Date(attendance.startTime);
      const endTime = new Date(attendance.endTime);

      // 開始時刻と終了時刻から作業時間を計算（分）
      const endTimeMs =
        startTime.getTime() > endTime.getTime()
          ? endTime.getTime() + 24 * 60 * 60 * 1000 // 日付をまたぐ場合、24時間を加算
          : endTime.getTime();
      const workMinutes = (endTimeMs - startTime.getTime()) / (1000 * 60);

      // 休憩時間を差し引く
      const breakMinutes = attendance.breakDuration ?? 0;

      return total + Math.max(0, workMinutes - breakMinutes);
    } catch (error) {
      console.error("Error calculating work minutes:", error);
      return total;
    }
  }, 0);

  // monthlyWorkMinutes単位で切り捨て
  if (monthlyWorkMinutes && monthlyWorkMinutes > 0) {
    const units = Math.floor(totalMinutes / monthlyWorkMinutes);
    return units * monthlyWorkMinutes;
  }

  return totalMinutes;
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
    // 開始時刻が終了時刻よりあとの場合（日付をまたぐ）、終了時刻に24時間を加算
    const endTimeMs =
      basicStartTime.getTime() > basicEndTime.getTime()
        ? basicEndTime.getTime() + 24 * 60 * 60 * 1000
        : basicEndTime.getTime();
    const workMinutes = (endTimeMs - basicStartTime.getTime()) / (1000 * 60);

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
