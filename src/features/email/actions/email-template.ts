"use server";

import { revalidatePath } from "next/cache";
import { StrictOmit } from "ts-essentials";

import { EmailTemplateRepository } from "@/features/email/repositories/email-template-repository";
import { EmailTemplate } from "@/features/email/types/email-template";
import { MAX_TEMPLATES_PER_TYPE } from "@/features/work-report/constants/work-report-constants";

const repository = new EmailTemplateRepository();

export const getEmailTemplatesByCreateUserIdAction = async (
  createUserId: string,
): Promise<
  { success: true; data: EmailTemplate[] } | { success: false; error: string }
> => {
  const result = await repository.getByCreateUserId(createUserId);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};

export const createEmailTemplateAction = async (
  values: StrictOmit<EmailTemplate, "id">,
): Promise<
  { success: true; data: EmailTemplate } | { success: false; error: string }
> => {
  // テンプレート数チェック
  const existingResult = await repository.getByCreateUserId(values.createUserId);
  if (!existingResult.success) {
    return { success: false, error: existingResult.error };
  }
  if (existingResult.data.length >= MAX_TEMPLATES_PER_TYPE) {
    return {
      success: false,
      error: `テンプレートは最大${MAX_TEMPLATES_PER_TYPE}個までしか登録できません`,
    };
  }

  const result = await repository.create(values);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath("/emailTemplate");
  return { success: true, data: result.data };
};

export const updateEmailTemplateAction = async (
  id: string,
  values: StrictOmit<EmailTemplate, "id">,
): Promise<
  { success: true; data: EmailTemplate } | { success: false; error: string }
> => {
  const result = await repository.update(id, values);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath("/emailTemplate");
  return { success: true, data: result.data };
};

export const deleteEmailTemplateAction = async (
  id: string,
): Promise<{ success: true } | { success: false; error: string }> => {
  const result = await repository.delete(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  revalidatePath("/emailTemplate");
  return { success: true };
};
