import { z } from "zod";

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

// dailyWorkMinutesを受け取って動的にバリデーションを追加するスキーマビルダー
export const createEditFormSchema = (dailyWorkMinutes: number) =>
  editFormSchema
    .refine(
      (data) => {
        if (dailyWorkMinutes === 0 || data.startTime === null) {
          return true;
        }
        const totalMinutes =
          data.startTime.getUTCHours() * 60 + data.startTime.getUTCMinutes();
        return totalMinutes % dailyWorkMinutes === 0;
      },
      {
        message: "出勤時間の分は作業単位の倍数である必要があります",
        path: ["startTime"],
      },
    )
    .refine(
      (data) => {
        if (dailyWorkMinutes === 0 || data.endTime === null) {
          return true;
        }
        const totalMinutes =
          data.endTime.getUTCHours() * 60 + data.endTime.getUTCMinutes();
        return totalMinutes % dailyWorkMinutes === 0;
      },
      {
        message: "退勤時間の分は作業単位の倍数である必要があります",
        path: ["endTime"],
      },
    )
    .refine(
      (data) => {
        if (dailyWorkMinutes === 0 || data.breakDuration === null) {
          return true;
        }
        return data.breakDuration % dailyWorkMinutes === 0;
      },
      {
        message: "休憩時間は作業単位の倍数である必要があります",
        path: ["breakDuration"],
      },
    );

export const bulkEditFormSchema = z.object({
  startDate: z
    .date()
    .nullable()
    .refine((val) => val !== null, {
      message: "開始日を入力してください",
    }),
  endDate: z
    .date()
    .nullable()
    .refine((val) => val !== null, {
      message: "終了日を入力してください",
    }),
  selectedDays: z.number().array().nullable(),
  excludeHolidays: z.boolean().default(true).nullable(),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  breakDuration: z.number().nullable(),
  memo: z.string().nullable(),
  prompt: z.string().nullable(),
});

// dailyWorkMinutesを受け取って動的にバリデーションを追加するスキーマビルダー
export const createBulkEditFormSchema = (dailyWorkMinutes: number) =>
  bulkEditFormSchema
    .refine(
      (data) => {
        if (dailyWorkMinutes === 0 || data.startTime === null) {
          return true;
        }
        const totalMinutes =
          data.startTime.getUTCHours() * 60 + data.startTime.getUTCMinutes();
        return totalMinutes % dailyWorkMinutes === 0;
      },
      {
        message: "出勤時間の分は作業単位の倍数である必要があります",
        path: ["startTime"],
      },
    )
    .refine(
      (data) => {
        if (dailyWorkMinutes === 0 || data.endTime === null) {
          return true;
        }
        const totalMinutes =
          data.endTime.getUTCHours() * 60 + data.endTime.getUTCMinutes();
        return totalMinutes % dailyWorkMinutes === 0;
      },
      {
        message: "退勤時間の分は作業単位の倍数である必要があります",
        path: ["endTime"],
      },
    )
    .refine(
      (data) => {
        if (dailyWorkMinutes === 0 || data.breakDuration === null) {
          return true;
        }
        return data.breakDuration % dailyWorkMinutes === 0;
      },
      {
        message: "休憩時間は作業単位の倍数である必要があります",
        path: ["breakDuration"],
      },
    );

export const templateUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "ファイルサイズは5MB以下にしてください",
    })
    .refine(
      (file) =>
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      {
        message: ".xlsx形式のファイルを選択してください",
      },
    ),
});

export type CreateWorkReportFormValues = z.infer<
  typeof createWorkReportFormSchema
>;
export type SearchFormValues = z.infer<typeof searchFormSchema>;
export type EditFormValues = z.infer<typeof editFormSchema>;
export type BulkEditFormValues = z.infer<typeof bulkEditFormSchema>;
export type TemplateUploadValues = z.infer<typeof templateUploadSchema>;
