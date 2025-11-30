import type {
  CreateWorkReportTemplateInput,
  UpdateWorkReportTemplateInput,
} from "@/features/work-report/types/work-report-template";
import { db } from "@/repositories/db";

export class WorkReportTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkReportTemplateError";
  }
}

export class WorkReportTemplateRepository {
  /**
   * ユーザーIDに紐づく作業報告書テンプレート一覧を取得
   */
  async getByCreateUserId(createUserId: string) {
    return await db.workReportTemplate.findMany({
      where: { createUserId },
      include: {
        fieldMappings: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * IDで作業報告書テンプレートを取得（フィールドマッピング含む）
   */
  async getById(id: string) {
    return await db.workReportTemplate.findUnique({
      where: { id },
      include: {
        fieldMappings: true,
      },
    });
  }

  /**
   * 作業報告書テンプレートを作成
   */
  async create(data: CreateWorkReportTemplateInput) {
    const { fieldMappings, ...templateData } = data;

    return await db.workReportTemplate.create({
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
   * 作業報告書テンプレートを更新
   */
  async update(id: string, data: UpdateWorkReportTemplateInput) {
    const { fieldMappings, ...templateData } = data;

    // フィールドマッピングが指定されている場合は、既存のものを全削除して再作成
    if (fieldMappings !== undefined) {
      await db.workReportTemplateField.deleteMany({
        where: { templateId: id },
      });

      return await db.workReportTemplate.update({
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

    return await db.workReportTemplate.update({
      where: { id },
      data: templateData,
      include: {
        fieldMappings: true,
      },
    });
  }

  /**
   * 作業報告書テンプレートを削除
   */
  async delete(id: string) {
    return await db.workReportTemplate.delete({
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
    const template = await db.workReportTemplate.findFirst({
      where: {
        name,
        createUserId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return template !== null;
  }
}
