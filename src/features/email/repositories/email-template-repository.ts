import type { EmailTemplate } from "@prisma/client";

import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";
import { isValidTemplateString } from "@/utils/string/template-parser";

export class EmailTemplateRepository {
  /**
   * ユーザーIDに紐づくメールテンプレート一覧を取得
   */
  async getByCreateUserId(
    createUserId: string,
  ): Promise<Result<EmailTemplate[]>> {
    try {
      const templates = await db.emailTemplate.findMany({
        where: { createUserId },
      });
      return ok(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      return err("メールテンプレート一覧の取得に失敗しました");
    }
  }

  /**
   * IDでメールテンプレートを取得
   */
  async getById(id: string): Promise<Result<EmailTemplate | null>> {
    try {
      const template = await db.emailTemplate.findUnique({
        where: { id },
      });
      return ok(template);
    } catch (error) {
      console.error("Error fetching email template by id:", error);
      return err("メールテンプレートの取得に失敗しました");
    }
  }

  /**
   * メールテンプレートを作成
   */
  async create(data: {
    name: string;
    subject: string;
    body: string;
    toAddresses: string[];
    ccAddresses: string[];
    createUserId: string;
  }): Promise<Result<EmailTemplate>> {
    // テンプレートの検証
    if (!isValidTemplateString(data.subject)) {
      return err("件名のテンプレート形式が不正です");
    }
    if (!isValidTemplateString(data.body)) {
      return err("本文のテンプレート形式が不正です");
    }

    try {
      const template = await db.emailTemplate.create({
        data,
      });
      return ok(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      return err("メールテンプレートの作成に失敗しました");
    }
  }

  /**
   * メールテンプレートを更新
   */
  async update(
    id: string,
    data: {
      name?: string;
      subject?: string;
      body?: string;
      toAddresses?: string[];
      ccAddresses?: string[];
    },
  ): Promise<Result<EmailTemplate>> {
    // テンプレートの検証
    if (data.subject && !isValidTemplateString(data.subject)) {
      return err("件名のテンプレート形式が不正です");
    }
    if (data.body && !isValidTemplateString(data.body)) {
      return err("本文のテンプレート形式が不正です");
    }

    try {
      const template = await db.emailTemplate.update({
        where: { id },
        data,
      });
      return ok(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      return err("メールテンプレートの更新に失敗しました");
    }
  }

  /**
   * メールテンプレートを削除
   */
  async delete(id: string): Promise<Result<EmailTemplate>> {
    try {
      const template = await db.emailTemplate.delete({
        where: { id },
      });
      return ok(template);
    } catch (error) {
      console.error("Error deleting email template:", error);
      return err("メールテンプレートの削除に失敗しました");
    }
  }
}
