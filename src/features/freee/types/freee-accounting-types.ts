/**
 * freee 会計API関連の型定義
 */

/**
 * freee 取引先情報
 */
export interface FreeePartner {
  id: number;
  code: string | null;
  company_id: number;
  name: string;
  update_date: string; // YYYY-MM-DD
  available: boolean;
  shortcut1: string | null;
  shortcut2: string | null;
  org_code: number | null;
  country_code: string | null;
  long_name: string | null;
  name_kana: string | null;
  default_title: string | null;
  phone: string | null;
  contact_name: string | null;
  email: string | null;
  payer_walletable_id: number | null;
  transfer_fee_handling_side: string | null;
  address_attributes?: {
    zipcode: string | null;
    prefecture_code: number | null;
    street_name1: string | null;
    street_name2: string | null;
  };
  partner_doc_setting_attributes?: {
    sending_method: "posting" | "email" | "email_with_posting" | null;
  };
  partner_bank_account_attributes?: {
    bank_name: string | null;
    bank_name_kana: string | null;
    bank_code: string | null;
    branch_name: string | null;
    branch_kana: string | null;
    branch_code: string | null;
    account_type: "ordinary" | "checking" | "savings" | null;
    account_number: string | null;
    account_name: string | null;
    long_account_name: string | null;
  };
}

/**
 * freee 取引先一覧レスポンス
 */
export interface FreeePartnersResponse {
  partners: FreeePartner[];
}
