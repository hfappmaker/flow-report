import type { WorkReportTemplateConfig as PrismaWorkReportTemplateConfig } from "@prisma/client";

import type { SerializedType } from "@/utils/serialization/serialization-utils";

export type WorkReportTemplateConfig =
  SerializedType<PrismaWorkReportTemplateConfig>;

/**
 * テンプレート設定の名前付き範囲マッピング
 * システム定義のフィールド名と、ユーザーがExcelテンプレートで定義した名前付き範囲名のマッピング
 */
export interface TemplateFieldMapping {
  // ヘッダー系フィールド
  title: string | null; // タイトル（月度）
  userName: string | null; // 作業者名
  basicStartTime: string | null; // 基本開始時刻
  basicEndTime: string | null; // 基本終了時刻
  basicBreakDuration: string | null; // 基本休憩時間
  dailyWorkMinutes: string | null; // 1日あたりの作業単位
  monthlyWorkMinutes: string | null; // 1ヶ月あたりの作業単位
  remarks: string | null; // 備考
  totalWorkTime: string | null; // 総稼働時間
  basicWorkTime: string | null; // 基本稼働時間
  workingDays: string | null; // 稼働日数

  // フォームデータ系フィールド（31行分の縦範囲）
  date: string | null; // 日付
  dayOfWeek: string | null; // 曜日
  startTime: string | null; // 開始時刻
  endTime: string | null; // 終了時刻
  breakDuration: string | null; // 休憩時間
  workDuration: string | null; // 稼働時間
  memo: string | null; // 作業内容
}

/**
 * テンプレート設定作成時の入力データ
 */
export interface CreateTemplateConfigInput {
  name: string;
  templateFile: string; // Base64
  templateFileName: string;
  fieldMapping: TemplateFieldMapping;
}

/**
 * テンプレート設定更新時の入力データ
 */
export interface UpdateTemplateConfigInput {
  name?: string;
  templateFile?: string; // Base64
  templateFileName?: string;
  fieldMapping?: Partial<TemplateFieldMapping>;
}

/**
 * テンプレート設定一覧表示用のDTO
 */
export interface TemplateConfigListItem {
  id: string;
  name: string;
  templateFileName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * デフォルトの名前付き範囲名（システム標準）
 */
export const DEFAULT_FIELD_MAPPING: TemplateFieldMapping = {
  // ヘッダー系
  title: "タイトル",
  userName: "作業者名",
  basicStartTime: "基本開始時刻",
  basicEndTime: "基本終了時刻",
  basicBreakDuration: "基本休憩時間",
  dailyWorkMinutes: "_１日あたりの作業単位",
  monthlyWorkMinutes: "_１ヶ月あたりの作業単位",
  remarks: "備考",
  totalWorkTime: "総稼働時間",
  basicWorkTime: "基本稼働時間",
  workingDays: "稼働日数",

  // フォームデータ系
  date: "日付",
  dayOfWeek: "曜日",
  startTime: "開始時刻",
  endTime: "終了時刻",
  breakDuration: "休憩時間",
  workDuration: "稼働時間",
  memo: "作業内容",
};

/**
 * フィールド定義（UIで表示用）
 */
export const TEMPLATE_FIELD_DEFINITIONS = {
  header: [
    { key: "title", label: "タイトル（月度）", defaultValue: "タイトル" },
    { key: "userName", label: "作業者名", defaultValue: "作業者名" },
    {
      key: "basicStartTime",
      label: "基本開始時刻",
      defaultValue: "基本開始時刻",
    },
    { key: "basicEndTime", label: "基本終了時刻", defaultValue: "基本終了時刻" },
    {
      key: "basicBreakDuration",
      label: "基本休憩時間",
      defaultValue: "基本休憩時間",
    },
    {
      key: "dailyWorkMinutes",
      label: "1日あたりの作業単位",
      defaultValue: "_１日あたりの作業単位",
    },
    {
      key: "monthlyWorkMinutes",
      label: "1ヶ月あたりの作業単位",
      defaultValue: "_１ヶ月あたりの作業単位",
    },
    { key: "remarks", label: "備考", defaultValue: "備考" },
    { key: "totalWorkTime", label: "総稼働時間", defaultValue: "総稼働時間" },
    { key: "basicWorkTime", label: "基本稼働時間", defaultValue: "基本稼働時間" },
    { key: "workingDays", label: "稼働日数", defaultValue: "稼働日数" },
  ],
  form: [
    { key: "date", label: "日付", defaultValue: "日付" },
    { key: "dayOfWeek", label: "曜日", defaultValue: "曜日" },
    { key: "startTime", label: "開始時刻", defaultValue: "開始時刻" },
    { key: "endTime", label: "終了時刻", defaultValue: "終了時刻" },
    { key: "breakDuration", label: "休憩時間", defaultValue: "休憩時間" },
    { key: "workDuration", label: "稼働時間", defaultValue: "稼働時間" },
    { key: "memo", label: "作業内容", defaultValue: "作業内容" },
  ],
} as const;
