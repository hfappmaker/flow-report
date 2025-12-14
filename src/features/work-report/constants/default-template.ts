import type { ExcelTemplateWithFields } from "@/features/work-report/types/work-report-template";

/**
 * システムデフォルトテンプレートの定数定義
 */

/**
 * デフォルトテンプレートのID（システム識別用）
 */
export const DEFAULT_TEMPLATE_ID = "system-default-work-report";

/**
 * デフォルトテンプレートの表示名
 */
export const DEFAULT_TEMPLATE_NAME = "デフォルトテンプレート";

/**
 * デフォルトテンプレートのファイル名
 */
export const DEFAULT_TEMPLATE_FILE_NAME =
  "作業報告書デフォルトテンプレート.xlsx";

/**
 * デフォルトテンプレートのシート名
 */
export const DEFAULT_TEMPLATE_SHEET_NAME = "作業報告書";

/**
 * デフォルトテンプレートのフィールドマッピング
 * 作業報告書で利用可能な主要なプレースホルダーを設定
 */
export const DEFAULT_TEMPLATE_FIELD_MAPPINGS: ExcelTemplateWithFields["fieldMappings"] =
  [
    {
      id: "default-field-1",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "タイトル",
      valueTemplate: "${対象年}年${対象月}月度作業報告書",
    },
    {
      id: "default-field-2",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "名前",
      valueTemplate: "${名前}",
    },
    {
      id: "default-field-3",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本開始時刻",
      valueTemplate: "${基本開始時刻}",
    },
    {
      id: "default-field-4",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本終了時刻",
      valueTemplate: "${基本終了時刻}",
    },
    {
      id: "default-field-5",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本休憩時間",
      valueTemplate: "${基本休憩時間}",
    },
    {
      id: "default-field-6",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本稼働時間",
      valueTemplate: "${基本稼働時間}",
    },
    {
      id: "default-field-7",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "_1日あたりの作業単位",
      valueTemplate: "${1日あたりの作業単位}分",
    },
    {
      id: "default-field-8",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "_1ヶ月あたりの作業単位",
      valueTemplate: "${1ヶ月あたりの作業単位}分",
    },
    {
      id: "default-field-9",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "稼働日数",
      valueTemplate: "${稼働日数}日",
    },
    {
      id: "default-field-10",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "総稼働時間",
      valueTemplate: "${総稼働時間}",
    },
    {
      id: "default-field-11",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "日付列",
      valueTemplate: "${日付列}",
    },
    {
      id: "default-field-12",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "曜日列",
      valueTemplate: "${曜日列}",
    },
    {
      id: "default-field-13",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "開始時刻列",
      valueTemplate: "${開始時刻列}",
    },
    {
      id: "default-field-14",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "終了時刻列",
      valueTemplate: "${終了時刻列}",
    },
    {
      id: "default-field-15",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "休憩時間列",
      valueTemplate: "${休憩時間列}",
    },
    {
      id: "default-field-16",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "稼働時間列",
      valueTemplate: "${稼働時間列}",
    },
    {
      id: "default-field-17",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "作業内容列",
      valueTemplate: "${作業内容列}",
    },
    {
      id: "default-field-18",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "備考",
      valueTemplate: "${備考}",
    },
  ];

/**
 * 指定されたテンプレートIDがシステムデフォルトかどうかを判定
 */
export const isDefaultTemplate = (templateId: string): boolean =>
  templateId === DEFAULT_TEMPLATE_ID;

/**
 * 請求書デフォルトテンプレートの定数定義
 */

/**
 * 請求書デフォルトテンプレート（上下割・税込）のID
 */
export const DEFAULT_INVOICE_TAX_INCLUSIVE_ID =
  "system-default-invoice-tax-inclusive";

/**
 * 請求書デフォルトテンプレート（上下割・税抜）のID
 */
export const DEFAULT_INVOICE_TAX_EXCLUSIVE_ID =
  "system-default-invoice-tax-exclusive";

/**
 * 請求書デフォルトテンプレートのファイル名
 */
export const DEFAULT_INVOICE_TEMPLATE_FILE_NAME =
  "請求書デフォルトテンプレート.xlsx";

/**
 * 請求書デフォルトテンプレート（上下割・税込）のシート名
 */
export const DEFAULT_INVOICE_TAX_INCLUSIVE_SHEET_NAME =
  "請求書（上下割　税込）";

/**
 * 請求書デフォルトテンプレート（上下割・税抜）のシート名
 */
export const DEFAULT_INVOICE_TAX_EXCLUSIVE_SHEET_NAME =
  "請求書（上下割　税抜）";

/**
 * 請求書デフォルトテンプレート（上下割・税込）のフィールドマッピング
 */
export const DEFAULT_INVOICE_TAX_INCLUSIVE_FIELD_MAPPINGS: ExcelTemplateWithFields["fieldMappings"] =
  [
    {
      id: "default-invoice-inclusive-1",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "請求日",
      valueTemplate: "${請求日}",
    },
    {
      id: "default-invoice-inclusive-2",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "名前",
      valueTemplate: "${名前}",
    },
    {
      id: "default-invoice-inclusive-3",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "郵便番号",
      valueTemplate: "${郵便番号}",
    },
    {
      id: "default-invoice-inclusive-4",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "住所",
      valueTemplate: "${住所}",
    },
    {
      id: "default-invoice-inclusive-4-1",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "適格請求書発行事業者登録番号",
      valueTemplate: "登録番号:${登録番号}",
    },
    {
      id: "default-invoice-inclusive-5",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "クライアント名",
      valueTemplate: "${クライアント名}　御中",
    },
    {
      id: "default-invoice-inclusive-6",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "基本単価項目",
      valueTemplate: "基本月単価",
    },
    {
      id: "default-invoice-inclusive-7",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "基本単価数量",
      valueTemplate: "1",
    },
    {
      id: "default-invoice-inclusive-8",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "基本単価単位",
      valueTemplate: "人月",
    },
    {
      id: "default-invoice-inclusive-9",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "基本単価",
      valueTemplate: "${月単価}",
    },
    {
      id: "default-invoice-inclusive-10",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "基本金額",
      valueTemplate: "${基本金額}",
    },
    {
      id: "default-invoice-inclusive-11",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "超過単価項目",
      valueTemplate: "超過単価",
    },
    {
      id: "default-invoice-inclusive-12",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "超過単価数量",
      valueTemplate: "${超過時間}",
    },
    {
      id: "default-invoice-inclusive-13",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "超過単価単位",
      valueTemplate: "時間",
    },
    {
      id: "default-invoice-inclusive-14",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "超過単価",
      valueTemplate: "${超過時間単価}",
    },
    {
      id: "default-invoice-inclusive-15",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "超過金額",
      valueTemplate: "${超過金額}",
    },
    {
      id: "default-invoice-inclusive-16",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "控除単価項目",
      valueTemplate: "控除単価",
    },
    {
      id: "default-invoice-inclusive-17",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "控除単価数量",
      valueTemplate: "${控除時間}",
    },
    {
      id: "default-invoice-inclusive-18",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "控除単価単位",
      valueTemplate: "時間",
    },
    {
      id: "default-invoice-inclusive-19",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "控除単価",
      valueTemplate: "${控除時間単価}",
    },
    {
      id: "default-invoice-inclusive-20",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "控除金額",
      valueTemplate: "${控除金額}",
    },
    {
      id: "default-invoice-inclusive-21",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "振込期日",
      valueTemplate: "${支払期限}",
    },
    {
      id: "default-invoice-inclusive-22",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "振込口座",
      valueTemplate: "${銀行名} ${支店名}\n${口座種別} ${口座番号} ${口座名義}",
    },
    {
      id: "default-invoice-inclusive-23",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "対象額",
      valueTemplate: "${請求金額（税込）}",
    },
    {
      id: "default-invoice-inclusive-24",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "内税",
      valueTemplate: "${消費税額}",
    },
    {
      id: "default-invoice-inclusive-25",
      templateId: DEFAULT_INVOICE_TAX_INCLUSIVE_ID,
      namedRange: "税込合計",
      valueTemplate: "${請求金額（税込）}",
    },
  ];

/**
 * 請求書デフォルトテンプレート（上下割・税抜）のフィールドマッピング
 */
export const DEFAULT_INVOICE_TAX_EXCLUSIVE_FIELD_MAPPINGS: ExcelTemplateWithFields["fieldMappings"] =
  [
    {
      id: "default-invoice-exclusive-1",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "請求日",
      valueTemplate: "${請求日}",
    },
    {
      id: "default-invoice-exclusive-2",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "名前",
      valueTemplate: "${名前}",
    },
    {
      id: "default-invoice-exclusive-3",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "郵便番号",
      valueTemplate: "${郵便番号}",
    },
    {
      id: "default-invoice-exclusive-4",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "住所",
      valueTemplate: "${住所}",
    },
    {
      id: "default-invoice-exclusive-4-1",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "適格請求書発行事業者登録番号",
      valueTemplate: "登録番号:${登録番号}",
    },
    {
      id: "default-invoice-exclusive-5",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "クライアント名",
      valueTemplate: "${クライアント名}　御中",
    },
    {
      id: "default-invoice-exclusive-6",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "基本単価項目",
      valueTemplate: "基本月単価",
    },
    {
      id: "default-invoice-exclusive-7",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "基本単価数量",
      valueTemplate: "1",
    },
    {
      id: "default-invoice-exclusive-8",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "基本単価単位",
      valueTemplate: "人月",
    },
    {
      id: "default-invoice-exclusive-9",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "基本単価",
      valueTemplate: "${月単価}",
    },
    {
      id: "default-invoice-exclusive-10",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "基本金額",
      valueTemplate: "${基本金額}",
    },
    {
      id: "default-invoice-exclusive-11",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "超過単価項目",
      valueTemplate: "超過単価",
    },
    {
      id: "default-invoice-exclusive-12",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "超過単価数量",
      valueTemplate: "${超過時間}",
    },
    {
      id: "default-invoice-exclusive-13",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "超過単価単位",
      valueTemplate: "時間",
    },
    {
      id: "default-invoice-exclusive-14",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "超過単価",
      valueTemplate: "${超過時間単価}",
    },
    {
      id: "default-invoice-exclusive-15",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "超過金額",
      valueTemplate: "${超過金額}",
    },
    {
      id: "default-invoice-exclusive-16",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "控除単価項目",
      valueTemplate: "控除単価",
    },
    {
      id: "default-invoice-exclusive-17",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "控除単価数量",
      valueTemplate: "${控除時間}",
    },
    {
      id: "default-invoice-exclusive-18",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "控除単価単位",
      valueTemplate: "時間",
    },
    {
      id: "default-invoice-exclusive-19",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "控除単価",
      valueTemplate: "${控除時間単価}",
    },
    {
      id: "default-invoice-exclusive-20",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "控除金額",
      valueTemplate: "${控除金額}",
    },
    {
      id: "default-invoice-exclusive-21",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "振込期日",
      valueTemplate: "${支払期限}",
    },
    {
      id: "default-invoice-exclusive-22",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "振込口座",
      valueTemplate: "${銀行名} ${支店名}\n${口座種別} ${口座番号} ${口座名義}",
    },
    {
      id: "default-invoice-exclusive-23",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "対象額",
      valueTemplate: "${請求金額（税抜）}",
    },
    {
      id: "default-invoice-exclusive-24",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "外税",
      valueTemplate: "${消費税額}",
    },
    {
      id: "default-invoice-exclusive-25",
      templateId: DEFAULT_INVOICE_TAX_EXCLUSIVE_ID,
      namedRange: "税込合計",
      valueTemplate: "${請求金額（税込）}",
    },
  ];

/**
 * 指定されたテンプレートIDが請求書デフォルトかどうかを判定
 */
export const isDefaultInvoiceTemplate = (templateId: string): boolean =>
  templateId === DEFAULT_INVOICE_TAX_INCLUSIVE_ID ||
  templateId === DEFAULT_INVOICE_TAX_EXCLUSIVE_ID;
