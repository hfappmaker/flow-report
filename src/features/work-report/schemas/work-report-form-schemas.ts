import { z } from "zod";

export const dateRangeModes = ["all", "weekday", "custom", "prompt"] as const;
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
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  breakDuration: z.number().optional(),
  memo: z.string().optional(),
});

export const bulkEditFormSchema = z.object({
  dateRangeMode: z.enum(dateRangeModes),
  selectedDays: z.number().array().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  excludeHolidays: z.boolean().default(true),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  breakDuration: z.number().optional(),
  memo: z.string(),
  prompt: z.string().optional(),
});

export type CreateWorkReportFormValues = z.infer<
  typeof createWorkReportFormSchema
>;
export type SearchFormValues = z.infer<typeof searchFormSchema>;
export type EditFormValues = z.infer<typeof editFormSchema>;
export type BulkEditFormValues = z.infer<typeof bulkEditFormSchema>;
