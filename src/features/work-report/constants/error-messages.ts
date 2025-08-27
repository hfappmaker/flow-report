export const ERROR_MESSAGES = {
  CONTRACT_NOT_FOUND: "契約が見つかりません",
  WORK_REPORT_CREATION_BEFORE_CONTRACT_START: (
    contractStartYear: number,
    contractStartMonth: number,
  ) =>
    `契約開始日より前の作業報告書は作成できません。契約開始: ${contractStartYear}年${contractStartMonth}月`,
  WORK_REPORT_CREATION_AFTER_CONTRACT_END: (
    contractEndYear: number,
    contractEndMonth: number,
  ) =>
    `契約終了日より後の作業報告書は作成できません。契約終了: ${contractEndYear}年${contractEndMonth}月`,
  WORK_REPORT_ALREADY_EXISTS: (targetYear: number, targetMonth: number) =>
    `${targetYear}年${targetMonth}月の作業報告書は既に存在します`,
  FETCH_WORK_REPORTS_FAILED: "Failed to fetch work reports",
};
