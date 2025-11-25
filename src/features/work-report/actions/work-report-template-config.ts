"use server";

import { revalidatePath } from "next/cache";

import { currentUser } from "@/features/auth/libs/auth";
import {
  createTemplateConfig,
  deleteTemplateConfig,
  extractFieldMappingFromConfig,
  getTemplateConfigByIdAndUserId,
  getTemplateConfigsByUserId,
  updateTemplateConfig,
} from "@/features/work-report/repositories/work-report-template-config-repository";
import {
  createTemplateConfigSchema,
  updateTemplateConfigSchema,
} from "@/features/work-report/schemas/work-report-form-schemas";
import type {
  TemplateConfigListItem,
  TemplateFieldMapping,
} from "@/features/work-report/types/work-report-template-config";

/**
 * ユーザーのテンプレート設定一覧を取得
 */
export async function getTemplateConfigsAction(): Promise<
  TemplateConfigListItem[]
> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("認証が必要です");
  }

  const configs = await getTemplateConfigsByUserId(user.id);

  return configs.map((config) => ({
    id: config.id,
    name: config.name,
    templateFileName: config.templateFileName,
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString(),
  }));
}

/**
 * テンプレート設定の詳細を取得
 */
export async function getTemplateConfigAction(configId: string): Promise<{
  id: string;
  name: string;
  templateFile: string;
  templateFileName: string;
  fieldMapping: TemplateFieldMapping;
} | null> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("認証が必要です");
  }

  const config = await getTemplateConfigByIdAndUserId(configId, user.id);
  if (!config) {
    return null;
  }

  return {
    id: config.id,
    name: config.name,
    templateFile: config.templateFile,
    templateFileName: config.templateFileName,
    fieldMapping: extractFieldMappingFromConfig(config),
  };
}

/**
 * テンプレート設定を作成
 */
export async function createTemplateConfigAction(data: {
  name: string;
  templateFile: string;
  templateFileName: string;
  fieldMapping: TemplateFieldMapping;
}): Promise<{ id: string }> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("認証が必要です");
  }

  // バリデーション
  const validationResult = createTemplateConfigSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors[0].message);
  }

  const config = await createTemplateConfig(user.id, data);

  revalidatePath("/workReport");

  return { id: config.id };
}

/**
 * テンプレート設定を更新
 */
export async function updateTemplateConfigAction(
  configId: string,
  data: {
    name?: string;
    templateFile?: string;
    templateFileName?: string;
    fieldMapping?: Partial<TemplateFieldMapping>;
  },
): Promise<{ id: string } | null> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("認証が必要です");
  }

  // バリデーション
  const validationResult = updateTemplateConfigSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors[0].message);
  }

  const config = await updateTemplateConfig(configId, user.id, data);
  if (!config) {
    return null;
  }

  revalidatePath("/workReport");

  return { id: config.id };
}

/**
 * テンプレート設定を削除
 */
export async function deleteTemplateConfigAction(
  configId: string,
): Promise<boolean> {
  const user = await currentUser();
  if (!user?.id) {
    throw new Error("認証が必要です");
  }

  const config = await deleteTemplateConfig(configId, user.id);

  if (config) {
    revalidatePath("/workReport");
    return true;
  }

  return false;
}
