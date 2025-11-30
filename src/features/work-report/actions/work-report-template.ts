"use server";

import type { TemplateType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  WorkReportTemplateRepository,
  WorkReportTemplateError,
} from "@/features/work-report/repositories/work-report-template-repository";
import type {
  CreateWorkReportTemplateInput,
  UpdateWorkReportTemplateInput,
  WorkReportTemplateWithFields,
} from "@/features/work-report/types/work-report-template";

const repository = new WorkReportTemplateRepository();

/**
 * ユーザーIDに紐づくテンプレート一覧を取得
 */
export const getWorkReportTemplatesByUserIdAction = async (
  createUserId: string,
): Promise<WorkReportTemplateWithFields[]> => {
  try {
    const templates = await repository.getByCreateUserId(createUserId);
    return templates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw new Error("テンプレートの取得に失敗しました");
  }
};

/**
 * ユーザーIDとタイプに紐づくテンプレート一覧を取得
 */
export const getWorkReportTemplatesByUserIdAndTypeAction = async (
  createUserId: string,
  type: TemplateType,
): Promise<WorkReportTemplateWithFields[]> => {
  try {
    const templates = await repository.getByCreateUserIdAndType(
      createUserId,
      type,
    );
    return templates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw new Error("テンプレートの取得に失敗しました");
  }
};

/**
 * IDで作業報告書テンプレートを取得
 */
export const getWorkReportTemplateByIdAction = async (
  id: string,
): Promise<WorkReportTemplateWithFields | null> => {
  try {
    const template = await repository.getById(id);
    return template;
  } catch (error) {
    console.error("Error fetching work report template:", error);
    throw new Error("作業報告書テンプレートの取得に失敗しました");
  }
};

/**
 * テンプレートを作成
 */
export const createWorkReportTemplateAction = async (
  values: CreateWorkReportTemplateInput,
): Promise<WorkReportTemplateWithFields> => {
  try {
    // 同名チェック（タイプ含む）
    const exists = await repository.existsByNameAndUserIdAndType(
      values.name,
      values.createUserId,
      values.type,
    );
    if (exists) {
      throw new WorkReportTemplateError(
        "同じ名前のテンプレートが既に存在します",
      );
    }

    const template = await repository.create(values);
    revalidatePath("/templates");
    return template;
  } catch (error) {
    console.error("Error creating template:", error);
    if (error instanceof WorkReportTemplateError) {
      throw error;
    }
    throw new Error("テンプレートの作成に失敗しました");
  }
};

/**
 * テンプレートを更新
 */
export const updateWorkReportTemplateAction = async (
  id: string,
  values: UpdateWorkReportTemplateInput,
): Promise<WorkReportTemplateWithFields> => {
  try {
    // 名前が変更される場合は同名チェック
    if (values.name) {
      const existingTemplate = await repository.getById(id);
      if (existingTemplate) {
        const exists = await repository.existsByNameAndUserIdAndType(
          values.name,
          existingTemplate.createUserId,
          existingTemplate.type,
          id,
        );
        if (exists) {
          throw new WorkReportTemplateError(
            "同じ名前のテンプレートが既に存在します",
          );
        }
      }
    }

    const template = await repository.update(id, values);
    revalidatePath("/templates");
    return template;
  } catch (error) {
    console.error("Error updating template:", error);
    if (error instanceof WorkReportTemplateError) {
      throw error;
    }
    throw new Error("テンプレートの更新に失敗しました");
  }
};

/**
 * テンプレートを削除
 */
export const deleteWorkReportTemplateAction = async (
  id: string,
): Promise<void> => {
  try {
    await repository.delete(id);
    revalidatePath("/templates");
  } catch (error) {
    console.error("Error deleting template:", error);
    throw new Error("テンプレートの削除に失敗しました");
  }
};
