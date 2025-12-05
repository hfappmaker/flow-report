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
export const DEFAULT_TEMPLATE_FILE_NAME = "work-report-default-template.xlsx";

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
      numFmt: null,
    },
    {
      id: "default-field-2",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "名前",
      valueTemplate: "${名前}",
      numFmt: null,
    },
    {
      id: "default-field-3",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本開始時刻",
      valueTemplate: "${基本開始時刻}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-4",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本終了時刻",
      valueTemplate: "${基本終了時刻}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-5",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本休憩時間",
      valueTemplate: "${基本休憩時間}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-6",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "基本稼働時間",
      valueTemplate: "${基本稼働時間}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-7",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "_1日あたりの作業単位",
      valueTemplate: "${1日あたりの作業単位}分",
      numFmt: "null",
    },
    {
      id: "default-field-8",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "_1ヶ月あたりの作業単位",
      valueTemplate: "${1ヶ月あたりの作業単位}分",
      numFmt: "null",
    },
    {
      id: "default-field-9",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "稼働日数",
      valueTemplate: "${稼働日数}日",
      numFmt: null,
    },
    {
      id: "default-field-10",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "総稼働時間",
      valueTemplate: "${総稼働時間}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-11",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "日付列",
      valueTemplate: "${日付列}",
      numFmt: null,
    },
    {
      id: "default-field-12",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "曜日列",
      valueTemplate: "${曜日列}",
      numFmt: null,
    },
    {
      id: "default-field-13",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "開始時刻列",
      valueTemplate: "${開始時刻列}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-14",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "終了時刻列",
      valueTemplate: "${終了時刻列}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-15",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "休憩時間列",
      valueTemplate: "${休憩時間列}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-16",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "稼働時間列",
      valueTemplate: "${稼働時間列}",
      numFmt: "[h]:mm",
    },
    {
      id: "default-field-17",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "作業内容列",
      valueTemplate: "${作業内容列}",
      numFmt: null,
    },
    {
      id: "default-field-18",
      templateId: DEFAULT_TEMPLATE_ID,
      namedRange: "備考",
      valueTemplate: "${備考}",
      numFmt: null,
    },
  ];

/**
 * 指定されたテンプレートIDがシステムデフォルトかどうかを判定
 */
export const isDefaultTemplate = (templateId: string): boolean =>
  templateId === DEFAULT_TEMPLATE_ID;
