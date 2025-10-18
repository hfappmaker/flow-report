"use server";

import { revalidatePath } from "next/cache";
import { StrictOmit } from "ts-essentials";

import {
  EmailTemplateRepository,
  EmailTemplateError,
} from "@/features/email/repositories/email-template-repository";
import { EmailTemplate } from "@/features/email/types/email-template";

const repository = new EmailTemplateRepository();

export const getEmailTemplatesByCreateUserIdAction = async (
  createUserId: string,
): Promise<EmailTemplate[]> => {
  try {
    const templates = await repository.getByCreateUserId(createUserId);
    return templates;
  } catch (error) {
    console.error("Error fetching email templates:", error);
    throw new Error("メールテンプレートの取得に失敗しました");
  }
};

export const createEmailTemplateAction = async (
  values: StrictOmit<EmailTemplate, "id">,
) => {
  try {
    const template = await repository.create(values);
    revalidatePath("/emailTemplate");
    return template;
  } catch (error) {
    console.error("Error creating email template:", error);
    if (error instanceof EmailTemplateError) {
      throw error;
    }
    throw new Error("メールテンプレートの作成に失敗しました");
  }
};

export const updateEmailTemplateAction = async (
  id: string,
  values: StrictOmit<EmailTemplate, "id">,
) => {
  try {
    const template = await repository.update(id, values);
    revalidatePath("/emailTemplate");
    return template;
  } catch (error) {
    console.error("Error updating email template:", error);
    if (error instanceof EmailTemplateError) {
      throw error;
    }
    throw new Error("メールテンプレートの更新に失敗しました");
  }
};

export const deleteEmailTemplateAction = async (id: string) => {
  try {
    await repository.delete(id);
    revalidatePath("/emailTemplate");
  } catch (error) {
    console.error("Error deleting email template:", error);
    throw new Error("メールテンプレートの削除に失敗しました");
  }
};
