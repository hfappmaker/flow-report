/**
 * メール用の基本プレースホルダー値を生成
 * WorkReportExcelDataがなくても使えるシンプルなバージョン
 * @param params メール用パラメータ
 * @returns プレースホルダー値のマップ
 */
export function generateBasicEmailPlaceholderValues(params: {
  clientName: string;
  userName: string;
  targetDate: Date;
}): Record<string, string | number> {
  return {
    クライアント名: params.clientName,
    作業者名: params.userName,
    対象年: params.targetDate.getFullYear(),
    対象月: params.targetDate.getMonth() + 1,
  };
}
