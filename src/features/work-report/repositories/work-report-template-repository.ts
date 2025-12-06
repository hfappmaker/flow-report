import type {
  ExcelTemplate,
  ExcelTemplateField,
  TemplateType,
} from "@prisma/client";

import type {
  CreateExcelTemplateInput,
  UpdateExcelTemplateInput,
} from "@/features/work-report/types/work-report-template";
import { db } from "@/repositories/db";
import { type Result, err, ok } from "@/types/result";

type ExcelTemplateWithFields = ExcelTemplate & {
  fieldMappings: ExcelTemplateField[];
};

export class ExcelTemplateRepository {
  /**
   * ユーザーIDに紐づくテンプレート一覧を取得
   */
  async getByCreateUserId(
    createUserId: string,
  ): Promise<Result<ExcelTemplateWithFields[]>> {
    try {
      const templates = await db.excelTemplate.findMany({
        where: { createUserId },
        include: {
          fieldMappings: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return ok(templates);
    } catch (error) {
      console.error("Error fetching excel templates:", error);
      return err("Excelテンプレート一覧の取得に失敗しました");
    }
  }

  /**
   * ユーザーIDとタイプに紐づくテンプレート一覧を取得
   */
  async getByCreateUserIdAndType(
    createUserId: string,
    type: TemplateType,
  ): Promise<Result<ExcelTemplateWithFields[]>> {
    try {
      const templates = await db.excelTemplate.findMany({
        where: { createUserId, type },
        include: {
          fieldMappings: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return ok(templates);
    } catch (error) {
      console.error("Error fetching excel templates by type:", error);
      return err("Excelテンプレート一覧の取得に失敗しました");
    }
  }

  /**
   * IDでExcelテンプレートを取得（フィールドマッピング含む）
   */
  async getById(id: string): Promise<Result<ExcelTemplateWithFields | null>> {
    try {
      const template = await db.excelTemplate.findUnique({
        where: { id },
        include: {
          fieldMappings: true,
        },
      });
      return ok(template);
    } catch (error) {
      console.error("Error fetching excel template by id:", error);
      return err("Excelテンプレートの取得に失敗しました");
    }
  }

  /**
   * Excelテンプレートを作成
   */
  async create(
    data: CreateExcelTemplateInput,
  ): Promise<Result<ExcelTemplateWithFields>> {
    try {
      const { fieldMappings, ...templateData } = data;

      const template = await db.excelTemplate.create({
        data: {
          ...templateData,
          fieldMappings: {
            create: fieldMappings.map((fm) => ({
              namedRange: fm.namedRange,
              valueTemplate: fm.valueTemplate,
              valueType: fm.valueType,
              numFmt: fm.numFmt,
            })),
          },
        },
        include: {
          fieldMappings: true,
        },
      });
      return ok(template);
    } catch (error) {
      console.error("Error creating excel template:", error);
      return err("Excelテンプレートの作成に失敗しました");
    }
  }

  /**
   * Excelテンプレートを更新
   */
  async update(
    id: string,
    data: UpdateExcelTemplateInput,
  ): Promise<Result<ExcelTemplateWithFields>> {
    try {
      const { fieldMappings, ...templateData } = data;

      // フィールドマッピングが指定されている場合は、既存のものを全削除して再作成
      if (fieldMappings !== undefined) {
        await db.excelTemplateField.deleteMany({
          where: { templateId: id },
        });

        const template = await db.excelTemplate.update({
          where: { id },
          data: {
            ...templateData,
            fieldMappings: {
              create: fieldMappings.map((fm) => ({
                namedRange: fm.namedRange,
                valueTemplate: fm.valueTemplate,
                valueType: fm.valueType,
                numFmt: fm.numFmt,
              })),
            },
          },
          include: {
            fieldMappings: true,
          },
        });
        return ok(template);
      }

      const template = await db.excelTemplate.update({
        where: { id },
        data: templateData,
        include: {
          fieldMappings: true,
        },
      });
      return ok(template);
    } catch (error) {
      console.error("Error updating excel template:", error);
      return err("Excelテンプレートの更新に失敗しました");
    }
  }

  /**
   * Excelテンプレートを削除
   */
  async delete(id: string): Promise<Result<ExcelTemplate>> {
    try {
      const template = await db.excelTemplate.delete({
        where: { id },
      });
      return ok(template);
    } catch (error) {
      console.error("Error deleting excel template:", error);
      return err("Excelテンプレートの削除に失敗しました");
    }
  }

  /**
   * 同じユーザーで同じ名前のテンプレートが存在するか確認
   */
  async existsByNameAndUserId(
    name: string,
    createUserId: string,
    excludeId?: string,
  ): Promise<Result<boolean>> {
    try {
      const template = await db.excelTemplate.findFirst({
        where: {
          name,
          createUserId,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      return ok(template !== null);
    } catch (error) {
      console.error("Error checking excel template exists:", error);
      return err("Excelテンプレートの存在確認に失敗しました");
    }
  }

  /**
   * 同じユーザー・タイプで同じ名前のテンプレートが存在するか確認
   */
  async existsByNameAndUserIdAndType(
    name: string,
    createUserId: string,
    type: TemplateType,
    excludeId?: string,
  ): Promise<Result<boolean>> {
    try {
      const template = await db.excelTemplate.findFirst({
        where: {
          name,
          createUserId,
          type,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      return ok(template !== null);
    } catch (error) {
      console.error("Error checking excel template exists:", error);
      return err("Excelテンプレートの存在確認に失敗しました");
    }
  }
}
