import type { Prisma } from "@prisma/client";

import type { TemplateFieldMapping } from "@/features/work-report/types/work-report-template-config";
import { db } from "@/repositories/db";

/**
 * ユーザーのテンプレート設定一覧を取得
 */
export async function getTemplateConfigsByUserId(userId: string) {
  const configs = await db.workReportTemplateConfig.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      templateFileName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return configs;
}

/**
 * テンプレート設定を取得（ID指定）
 */
export async function getTemplateConfigById(id: string) {
  const config = await db.workReportTemplateConfig.findUnique({
    where: { id },
  });

  return config;
}

/**
 * テンプレート設定を取得（ID指定、ユーザーID確認付き）
 */
export async function getTemplateConfigByIdAndUserId(
  id: string,
  userId: string,
) {
  const config = await db.workReportTemplateConfig.findFirst({
    where: { id, userId },
  });

  return config;
}

/**
 * フィールドマッピングをPrismaの入力形式に変換
 */
function fieldMappingToPrismaInput(
  fieldMapping: TemplateFieldMapping,
): Prisma.WorkReportTemplateConfigCreateInput {
  return {
    // ヘッダー系
    titleRangeName: fieldMapping.title,
    userNameRangeName: fieldMapping.userName,
    basicStartTimeRangeName: fieldMapping.basicStartTime,
    basicEndTimeRangeName: fieldMapping.basicEndTime,
    basicBreakDurationRangeName: fieldMapping.basicBreakDuration,
    dailyWorkMinutesRangeName: fieldMapping.dailyWorkMinutes,
    monthlyWorkMinutesRangeName: fieldMapping.monthlyWorkMinutes,
    remarksRangeName: fieldMapping.remarks,
    totalWorkTimeRangeName: fieldMapping.totalWorkTime,
    basicWorkTimeRangeName: fieldMapping.basicWorkTime,
    workingDaysRangeName: fieldMapping.workingDays,

    // フォームデータ系
    dateRangeName: fieldMapping.date,
    dayOfWeekRangeName: fieldMapping.dayOfWeek,
    startTimeRangeName: fieldMapping.startTime,
    endTimeRangeName: fieldMapping.endTime,
    breakDurationRangeName: fieldMapping.breakDuration,
    workDurationRangeName: fieldMapping.workDuration,
    memoRangeName: fieldMapping.memo,
  } as Prisma.WorkReportTemplateConfigCreateInput;
}

/**
 * Prismaのデータからフィールドマッピングを抽出
 */
export function extractFieldMappingFromConfig(config: {
  titleRangeName: string | null;
  userNameRangeName: string | null;
  basicStartTimeRangeName: string | null;
  basicEndTimeRangeName: string | null;
  basicBreakDurationRangeName: string | null;
  dailyWorkMinutesRangeName: string | null;
  monthlyWorkMinutesRangeName: string | null;
  remarksRangeName: string | null;
  totalWorkTimeRangeName: string | null;
  basicWorkTimeRangeName: string | null;
  workingDaysRangeName: string | null;
  dateRangeName: string | null;
  dayOfWeekRangeName: string | null;
  startTimeRangeName: string | null;
  endTimeRangeName: string | null;
  breakDurationRangeName: string | null;
  workDurationRangeName: string | null;
  memoRangeName: string | null;
}): TemplateFieldMapping {
  return {
    title: config.titleRangeName,
    userName: config.userNameRangeName,
    basicStartTime: config.basicStartTimeRangeName,
    basicEndTime: config.basicEndTimeRangeName,
    basicBreakDuration: config.basicBreakDurationRangeName,
    dailyWorkMinutes: config.dailyWorkMinutesRangeName,
    monthlyWorkMinutes: config.monthlyWorkMinutesRangeName,
    remarks: config.remarksRangeName,
    totalWorkTime: config.totalWorkTimeRangeName,
    basicWorkTime: config.basicWorkTimeRangeName,
    workingDays: config.workingDaysRangeName,
    date: config.dateRangeName,
    dayOfWeek: config.dayOfWeekRangeName,
    startTime: config.startTimeRangeName,
    endTime: config.endTimeRangeName,
    breakDuration: config.breakDurationRangeName,
    workDuration: config.workDurationRangeName,
    memo: config.memoRangeName,
  };
}

/**
 * テンプレート設定を作成
 */
export async function createTemplateConfig(
  userId: string,
  data: {
    name: string;
    templateFile: string;
    templateFileName: string;
    fieldMapping: TemplateFieldMapping;
  },
) {
  const prismaInput = fieldMappingToPrismaInput(data.fieldMapping);

  const config = await db.workReportTemplateConfig.create({
    data: {
      name: data.name,
      templateFile: data.templateFile,
      templateFileName: data.templateFileName,
      userId,
      ...prismaInput,
    },
  });

  return config;
}

/**
 * テンプレート設定を更新
 */
export async function updateTemplateConfig(
  id: string,
  userId: string,
  data: {
    name?: string;
    templateFile?: string;
    templateFileName?: string;
    fieldMapping?: Partial<TemplateFieldMapping>;
  },
) {
  // まず、対象のレコードがユーザーのものか確認
  const existing = await getTemplateConfigByIdAndUserId(id, userId);
  if (!existing) {
    return null;
  }

  const updateData: Prisma.WorkReportTemplateConfigUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.templateFile !== undefined) {
    updateData.templateFile = data.templateFile;
  }

  if (data.templateFileName !== undefined) {
    updateData.templateFileName = data.templateFileName;
  }

  if (data.fieldMapping) {
    const fm = data.fieldMapping;
    if (fm.title !== undefined) updateData.titleRangeName = fm.title;
    if (fm.userName !== undefined) updateData.userNameRangeName = fm.userName;
    if (fm.basicStartTime !== undefined)
      updateData.basicStartTimeRangeName = fm.basicStartTime;
    if (fm.basicEndTime !== undefined)
      updateData.basicEndTimeRangeName = fm.basicEndTime;
    if (fm.basicBreakDuration !== undefined)
      updateData.basicBreakDurationRangeName = fm.basicBreakDuration;
    if (fm.dailyWorkMinutes !== undefined)
      updateData.dailyWorkMinutesRangeName = fm.dailyWorkMinutes;
    if (fm.monthlyWorkMinutes !== undefined)
      updateData.monthlyWorkMinutesRangeName = fm.monthlyWorkMinutes;
    if (fm.remarks !== undefined) updateData.remarksRangeName = fm.remarks;
    if (fm.totalWorkTime !== undefined)
      updateData.totalWorkTimeRangeName = fm.totalWorkTime;
    if (fm.basicWorkTime !== undefined)
      updateData.basicWorkTimeRangeName = fm.basicWorkTime;
    if (fm.workingDays !== undefined)
      updateData.workingDaysRangeName = fm.workingDays;
    if (fm.date !== undefined) updateData.dateRangeName = fm.date;
    if (fm.dayOfWeek !== undefined) updateData.dayOfWeekRangeName = fm.dayOfWeek;
    if (fm.startTime !== undefined) updateData.startTimeRangeName = fm.startTime;
    if (fm.endTime !== undefined) updateData.endTimeRangeName = fm.endTime;
    if (fm.breakDuration !== undefined)
      updateData.breakDurationRangeName = fm.breakDuration;
    if (fm.workDuration !== undefined)
      updateData.workDurationRangeName = fm.workDuration;
    if (fm.memo !== undefined) updateData.memoRangeName = fm.memo;
  }

  const config = await db.workReportTemplateConfig.update({
    where: { id },
    data: updateData,
  });

  return config;
}

/**
 * テンプレート設定を削除
 */
export async function deleteTemplateConfig(id: string, userId: string) {
  // まず、対象のレコードがユーザーのものか確認
  const existing = await getTemplateConfigByIdAndUserId(id, userId);
  if (!existing) {
    return null;
  }

  const config = await db.workReportTemplateConfig.delete({
    where: { id },
  });

  return config;
}
