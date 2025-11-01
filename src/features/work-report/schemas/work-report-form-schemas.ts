import { z } from "zod";

export const dateRangeModes = ["all", "weekday", "custom"] as const;
export type DateRangeMode = (typeof dateRangeModes)[number];

export interface ExcelRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export const createWorkReportFormSchema = z.object({
  yearMonth: z.date(),
});

export const searchFormSchema = z.object({
  from: z.date().nullable(),
  to: z.date().nullable(),
});

export const editFormSchema = z.object({
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  breakDuration: z.number().nullable(),
  memo: z.string().nullable(),
});

export const bulkEditFormSchema = z.object({
  dateRangeMode: z.enum(dateRangeModes),
  selectedDays: z.number().array().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  excludeHolidays: z.boolean().default(true).nullable(),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  breakDuration: z.number().nullable(),
  memo: z.string().nullable(),
  prompt: z.string().nullable(),
});

export type CreateWorkReportFormValues = z.infer<
  typeof createWorkReportFormSchema
>;
export type SearchFormValues = z.infer<typeof searchFormSchema>;
export type EditFormValues = z.infer<typeof editFormSchema>;
export type BulkEditFormValues = z.infer<typeof bulkEditFormSchema>;
