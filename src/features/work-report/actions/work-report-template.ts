"use server";

import type { TemplateType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { MAX_TEMPLATES_PER_TYPE } from "@/features/work-report/constants/work-report-constants";
import { ExcelTemplateRepository } from "@/features/work-report/repositories/work-report-template-repository";
import type {
  CreateExcelTemplateInput,
  UpdateExcelTemplateInput,
  ExcelTemplateWithFields,
} from "@/features/work-report/types/work-report-template";

const repository = new ExcelTemplateRepository();

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * ユーザーIDに紐づくテンプレート一覧を取得
 */
export const getExcelTemplatesByUserIdAction = async (
  createUserId: string,
): Promise<ActionResult<ExcelTemplateWithFields[]>> => {
  const result = await repository.getByCreateUserId(createUserId);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};

/**
 * ユーザーIDとタイプに紐づくテンプレート一覧を取得
 */
export const getExcelTemplatesByUserIdAndTypeAction = async (
  createUserId: string,
  type: TemplateType,
): Promise<ActionResult<ExcelTemplateWithFields[]>> => {
  const result = await repository.getByCreateUserIdAndType(createUserId, type);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};

/**
 * IDでExcelテンプレートを取得
 */
export const getExcelTemplateByIdAction = async (
  id: string,
): Promise<ActionResult<ExcelTemplateWithFields | null>> => {
  const result = await repository.getById(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
};

/**
 * テンプレートを作成
 */
export const createExcelTemplateAction = async (
  values: CreateExcelTemplateInput,
): Promise<ActionResult<ExcelTemplateWithFields>> => {
  // テンプレート数チェック
  const existingResult = await repository.getByCreateUserIdAndType(
    values.createUserId,
    values.type,
  );
  if (!existingResult.success) {
    return { success: false, error: existingResult.error };
  }
  if (existingResult.data.length >= MAX_TEMPLATES_PER_TYPE) {
    return {
      success: false,
      error: `テンプレートは最大${MAX_TEMPLATES_PER_TYPE}個までしか登録できません`,
    };
  }

  // 同名チェック（タイプ含む）
  const existsResult = await repository.existsByNameAndUserIdAndType(
    values.name,
    values.createUserId,
    values.type,
  );
  if (!existsResult.success) {
    return { success: false, error: existsResult.error };
  }
  if (existsResult.data) {
    return { success: false, error: "同じ名前のテンプレートが既に存在します" };
  }

  const createResult = await repository.create(values);
  if (!createResult.success) {
    return { success: false, error: createResult.error };
  }
  revalidatePath("/templates");
  return { success: true, data: createResult.data };
};

/**
 * テンプレートを更新
 */
export const updateExcelTemplateAction = async (
  id: string,
  values: UpdateExcelTemplateInput,
): Promise<ActionResult<ExcelTemplateWithFields>> => {
  // 名前が変更される場合は同名チェック
  if (values.name) {
    const existingResult = await repository.getById(id);
    if (!existingResult.success) {
      return { success: false, error: existingResult.error };
    }
    if (existingResult.data) {
      const existsResult = await repository.existsByNameAndUserIdAndType(
        values.name,
        existingResult.data.createUserId,
        existingResult.data.type,
        id,
      );
      if (!existsResult.success) {
        return { success: false, error: existsResult.error };
      }
      if (existsResult.data) {
        return {
          success: false,
          error: "同じ名前のテンプレートが既に存在します",
        };
      }
    }
  }

  const updateResult = await repository.update(id, values);
  if (!updateResult.success) {
    return { success: false, error: updateResult.error };
  }
  revalidatePath("/templates");
  return { success: true, data: updateResult.data };
};

/**
 * テンプレートを削除
 */
export const deleteExcelTemplateAction = async (
  id: string,
): Promise<ActionResult<void>> => {
  const deleteResult = await repository.delete(id);
  if (!deleteResult.success) {
    return { success: false, error: deleteResult.error };
  }
  revalidatePath("/templates");
  return { success: true, data: undefined };
};
