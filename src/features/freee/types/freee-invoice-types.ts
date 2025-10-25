/**
 * freee 請求書API関連の型定義
 */

/**
 * freee 請求書 作成リクエスト（freee請求書API仕様）
 */
export interface FreeeInvoiceCreateRequest {
  company_id: number; // 必須: 事業所ID
  template_id: number; // 必須: 帳票テンプレートID
  invoice_number?: string; // 請求書番号（自動採番の場合は不要）
  branch_no?: number; // 枝番
  billing_date: string; // 必須: 請求日 YYYY-MM-DD
  issue_date: string; // 必須: 発行日 YYYY-MM-DD
  payment_date?: string; // 支払期限 YYYY-MM-DD
  payment_type?: "transfer" | "direct_debit" | "credit_card"; // 支払方法
  subject?: string; // 件名
  tax_entry_method: "in" | "out"; // 必須: 税込/税抜（in=税込、out=税抜）
  tax_fraction: "omit" | "roundoff" | "cut_up"; // 必須: 消費税端数処理
  line_amount_fraction: "omit" | "roundoff" | "round_up" | "cut_up"; // 必須: 明細金額端数処理
  withholding_tax_entry_method?: "in" | "out"; // 源泉徴収税処理方法
  include_amount_brought_forward?: boolean; // 繰越金額を含むか
  amount_brought_forward?: number; // 繰越金額
  invoice_note?: string; // 備考
  memo?: string; // 社内メモ

  // 取引先情報
  partner_id?: number;
  partner_code?: string;
  partner_title?: string; // 敬称（御中、様など）
  partner_address_zipcode?: string;
  partner_address_prefecture_code?: number;
  partner_address_street_name1?: string;
  partner_address_street_name2?: string;
  partner_contact_department?: string;
  partner_contact_email_cc?: string;
  partner_contact_email_to?: string;
  partner_contact_name?: string;
  partner_display_name?: string; // 取引先表示名
  partner_sending_method?: "posting" | "email" | "email_with_posting"; // 送付方法
  partner_bank_account?: string;

  // 自社情報
  company_contact_name?: string;
  company_name?: string;
  company_description?: string;
  bank_account_to_transfer?: string;

  // 明細
  lines: FreeeInvoiceLine[]; // 必須
}

/**
 * freee 請求書明細（freee請求書API仕様）
 */
export interface FreeeInvoiceLine {
  type: "item" | "text"; // 必須: 明細タイプ
  description?: string; // 内容
  sales_date?: string; // 売上日 YYYY-MM-DD
  unit?: string; // 単位
  quantity: number; // 必須: 数量（数値型）
  unit_price: string; // 必須: 単価（文字列、小数点対応）
  tax_rate?: number; // 税率（8 or 10）
  reduced_tax_rate?: boolean; // 軽減税率適用フラグ
  withholding?: boolean; // 源泉徴収対象
  account_item_id?: number; // 勘定科目ID
  tax_code?: number; // 税区分コード
  item_id?: number; // 品目ID
  section_id?: number; // 部門ID
  tag_ids?: number[]; // タグID配列
  segment_1_tag_id?: number;
  segment_2_tag_id?: number;
  segment_3_tag_id?: number;
}

/**
 * freee 請求書 作成レスポンス
 */
export interface FreeeInvoiceCreateResponse {
  invoice: {
    id: number;
    company_id: number;
    issue_date: string;
    partner_id: number;
    partner_display_name: string;
    partner_title: string;
    partner_zipcode: string;
    partner_prefecture_code: number;
    partner_prefecture_name: string;
    partner_address1: string;
    partner_address2: string;
    partner_contact_info: string;
    invoice_number: string;
    title: string;
    payment_status: "unsettled" | "settled";
    payment_date: string;
    web_published_at: string | null;
    web_downloaded_at: string | null;
    web_confirmed_at: string | null;
    mail_sent_at: string | null;
    invoice_status:
      | "draft"
      | "applying"
      | "remanded"
      | "rejected"
      | "approved"
      | "submitted";
    total_amount: number;
    total_vat: number;
    total_amount_per_vat_rate: {
      rate: number;
      amount: number;
    }[];
    invoice_contents: FreeeInvoiceContent[];
    invoice_layout: string;
    tax_entry_method: "inclusive" | "exclusive";
    notes: string;
    payment_bank_info: string;
  };
}

/**
 * freee 請求書明細コンテンツ（レスポンス用）
 */
export interface FreeeInvoiceContent {
  id: number;
  order: number;
  type: "normal" | "discount" | "text";
  qty: string;
  unit: string;
  unit_price: string;
  amount: number;
  vat: number;
  reduced_vat: boolean;
  description: string;
  account_item_id: number;
  account_item_name: string;
  tax_code: number;
  item_id: number;
  item_name: string;
  section_id: number;
  section_name: string;
  tag_ids: number[];
  tag_names: string[];
  segment_1_tag_id: number;
  segment_1_tag_name: string;
  segment_2_tag_id: number;
  segment_2_tag_name: string;
  segment_3_tag_id: number;
  segment_3_tag_name: string;
}
