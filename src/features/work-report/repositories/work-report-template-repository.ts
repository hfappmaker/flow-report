import type { TemplateType } from "@prisma/client";

import type {
  CreateExcelTemplateInput,
  UpdateExcelTemplateInput,
} from "@/features/work-report/types/work-report-template";
import { db } from "@/repositories/db";

export class ExcelTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExcelTemplateError";
  }
}

export class ExcelTemplateRepository {
  /**
   * ユーザーIDに紐づくテンプレート一覧を取得
   */
  async getByCreateUserId(createUserId: string) {
    return await db.excelTemplate.findMany({
      where: { createUserId },
      include: {
        fieldMappings: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * ユーザーIDとタイプに紐づくテンプレート一覧を取得
   */
  async getByCreateUserIdAndType(createUserId: string, type: TemplateType) {
    return await db.excelTemplate.findMany({
      where: { createUserId, type },
      include: {
        fieldMappings: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * IDでExcelテンプレートを取得（フィールドマッピング含む）
   */
  async getById(id: string) {
    return await db.excelTemplate.findUnique({
      where: { id },
      include: {
        fieldMappings: true,
      },
    });
  }

  /**
   * Excelテンプレートを作成
   */
  async create(data: CreateExcelTemplateInput) {
    const { fieldMappings, ...templateData } = data;

    return await db.excelTemplate.create({
      data: {
        ...templateData,
        fieldMappings: {
          create: fieldMappings,
        },
      },
      include: {
        fieldMappings: true,
      },
    });
  }

  /**
   * Excelテンプレートを更新
   */
  async update(id: string, data: UpdateExcelTemplateInput) {
    const { fieldMappings, ...templateData } = data;

    // フィールドマッピングが指定されている場合は、既存のものを全削除して再作成
    if (fieldMappings !== undefined) {
      await db.excelTemplateField.deleteMany({
        where: { templateId: id },
      });

      return await db.excelTemplate.update({
        where: { id },
        data: {
          ...templateData,
          fieldMappings: {
            create: fieldMappings,
          },
        },
        include: {
          fieldMappings: true,
        },
      });
    }

    return await db.excelTemplate.update({
      where: { id },
      data: templateData,
      include: {
        fieldMappings: true,
      },
    });
  }

  /**
   * Excelテンプレートを削除
   */
  async delete(id: string) {
    return await db.excelTemplate.delete({
      where: { id },
    });
  }

  /**
   * 同じユーザーで同じ名前のテンプレートが存在するか確認
   */
  async existsByNameAndUserId(
    name: string,
    createUserId: string,
    excludeId?: string,
  ) {
    const template = await db.excelTemplate.findFirst({
      where: {
        name,
        createUserId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return template !== null;
  }

  /**
   * 同じユーザー・タイプで同じ名前のテンプレートが存在するか確認
   */
  async existsByNameAndUserIdAndType(
    name: string,
    createUserId: string,
    type: TemplateType,
    excludeId?: string,
  ) {
    const template = await db.excelTemplate.findFirst({
      where: {
        name,
        createUserId,
        type,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return template !== null;
  }
}
