import { describe, expect, it } from "vitest";

import { getTargetYearMonth, getBillingPeriod } from "./date-utils";

describe("date-utils", () => {
  describe("getTargetYearMonth", () => {
    describe("締め日が2日の場合", () => {
      it("12月3日は2026年1月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 3)); // 2025年12月3日
        const result = getTargetYearMonth(date, 2);
        expect(result).toEqual({ year: 2026, month: 1 });
      });

      it("12月2日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 2)); // 2025年12月2日
        const result = getTargetYearMonth(date, 2);
        expect(result).toEqual({ year: 2025, month: 12 });
      });

      it("11月3日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 10, 3)); // 2025年11月3日
        const result = getTargetYearMonth(date, 2);
        expect(result).toEqual({ year: 2025, month: 12 });
      });

      it("11月2日は2025年11月に属する", () => {
        const date = new Date(Date.UTC(2025, 10, 2)); // 2025年11月2日
        const result = getTargetYearMonth(date, 2);
        expect(result).toEqual({ year: 2025, month: 11 });
      });

      it("1月3日は2026年2月に属する", () => {
        const date = new Date(Date.UTC(2026, 0, 3)); // 2026年1月3日
        const result = getTargetYearMonth(date, 2);
        expect(result).toEqual({ year: 2026, month: 2 });
      });
    });

    describe("締め日が15日の場合", () => {
      it("12月16日は2026年1月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 16)); // 2025年12月16日
        const result = getTargetYearMonth(date, 15);
        expect(result).toEqual({ year: 2026, month: 1 });
      });

      it("12月15日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 15)); // 2025年12月15日
        const result = getTargetYearMonth(date, 15);
        expect(result).toEqual({ year: 2025, month: 12 });
      });

      it("12月1日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 1)); // 2025年12月1日
        const result = getTargetYearMonth(date, 15);
        expect(result).toEqual({ year: 2025, month: 12 });
      });
    });

    describe("締め日が31日の場合", () => {
      it("12月31日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 31)); // 2025年12月31日
        const result = getTargetYearMonth(date, 31);
        expect(result).toEqual({ year: 2025, month: 12 });
      });

      it("1月1日は2026年1月に属する", () => {
        const date = new Date(Date.UTC(2026, 0, 1)); // 2026年1月1日
        const result = getTargetYearMonth(date, 31);
        expect(result).toEqual({ year: 2026, month: 1 });
      });
    });

    describe("締め日がnull（月末締め）の場合", () => {
      it("12月15日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 15)); // 2025年12月15日
        const result = getTargetYearMonth(date, null);
        expect(result).toEqual({ year: 2025, month: 12 });
      });

      it("12月31日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 31)); // 2025年12月31日
        const result = getTargetYearMonth(date, null);
        expect(result).toEqual({ year: 2025, month: 12 });
      });

      it("1月1日は2026年1月に属する", () => {
        const date = new Date(Date.UTC(2026, 0, 1)); // 2026年1月1日
        const result = getTargetYearMonth(date, null);
        expect(result).toEqual({ year: 2026, month: 1 });
      });
    });

    describe("年跨ぎのケース", () => {
      it("締め日25日で12月26日は2026年1月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 26)); // 2025年12月26日
        const result = getTargetYearMonth(date, 25);
        expect(result).toEqual({ year: 2026, month: 1 });
      });

      it("締め日25日で12月25日は2025年12月に属する", () => {
        const date = new Date(Date.UTC(2025, 11, 25)); // 2025年12月25日
        const result = getTargetYearMonth(date, 25);
        expect(result).toEqual({ year: 2025, month: 12 });
      });
    });
  });

  describe("getTargetYearMonth と getBillingPeriod の整合性", () => {
    it("締め日2日：getTargetYearMonthの結果とgetBillingPeriodの期間が一致する", () => {
      const date = new Date(Date.UTC(2025, 11, 3)); // 2025年12月3日
      const closingDay = 2;

      const targetYearMonth = getTargetYearMonth(date, closingDay);
      const billingPeriod = getBillingPeriod(
        targetYearMonth.year,
        targetYearMonth.month,
        closingDay,
      );

      // dateが期間内に含まれることを確認
      expect(date >= billingPeriod.startDate).toBe(true);
      expect(date <= billingPeriod.endDate).toBe(true);
    });

    it("締め日15日：getTargetYearMonthの結果とgetBillingPeriodの期間が一致する", () => {
      const date = new Date(Date.UTC(2025, 11, 16)); // 2025年12月16日
      const closingDay = 15;

      const targetYearMonth = getTargetYearMonth(date, closingDay);
      const billingPeriod = getBillingPeriod(
        targetYearMonth.year,
        targetYearMonth.month,
        closingDay,
      );

      // dateが期間内に含まれることを確認
      expect(date >= billingPeriod.startDate).toBe(true);
      expect(date <= billingPeriod.endDate).toBe(true);
    });

    it("境界値テスト：締め日ちょうどの日付", () => {
      const date = new Date(Date.UTC(2025, 11, 2)); // 2025年12月2日（締め日）
      const closingDay = 2;

      const targetYearMonth = getTargetYearMonth(date, closingDay);
      const billingPeriod = getBillingPeriod(
        targetYearMonth.year,
        targetYearMonth.month,
        closingDay,
      );

      // dateが期間の終了日と一致することを確認
      expect(date.getTime()).toBe(billingPeriod.endDate.getTime());
    });
  });
});
