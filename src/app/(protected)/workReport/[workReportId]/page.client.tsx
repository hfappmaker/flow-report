"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ExcelJS from "exceljs";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import FormError from "@/components/ui/feedback/error-alert";
import FormSuccess from "@/components/ui/feedback/success-alert";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  TimePickerFieldForDate,
  TimePickerFieldForNumber,
} from "@/components/ui/time-picker";
import { useTransitionContext } from "@/contexts/transition-context";
import { updateWorkReportAttendanceAction } from "@/features/work-report/actions/attendance";
import {
  updateWorkReportAttendancesAction,
  updateWorkReportStatusAction,
} from "@/features/work-report/actions/work-report";
import {
  type EditFormValues,
  type BulkEditFormValues,
  editFormSchema,
  bulkEditFormSchema,
} from "@/features/work-report/schemas/work-report-form-schemas";
import { type AttendanceData } from "@/features/work-report/types/attendance";
import {
  type WorkReportClientProps,
  type WorkReportStatus,
} from "@/features/work-report/types/work-report";
import {
  generateDefaultAttendances,
  mergeAttendances,
  parseRangeReference,
  parseExcelRange,
  formatMonthDay,
  shouldUpdateDate,
  getBulkEditFormDefaults,
} from "@/features/work-report/utils/attendance-utils";
import { useMessageState } from "@/hooks/use-message-state";
import { formatDateAsUTC } from "@/utils/date-utils";
import {
  fetchHolidays,
  getDateColorClass,
  Holiday,
} from "@/utils/holiday-utils";

export default function ClientWorkReportPage({
  contractId,
  workReportId,
  attendances,
  contractName,
  clientName,
  contactName,
  closingDay,
  userName,
  clientEmail,
  targetDate,
  dailyWorkMinutes,
  monthlyWorkMinutes,
  basicStartTime,
  basicEndTime,
  basicBreakDuration,
  status: initialStatus,
}: WorkReportClientProps) {
  const { error, success, showError, showSuccess } = useMessageState();
  const { startTransition } = useTransitionContext();
  // モーダルの状態管理
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  // 祝日データの状態管理
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // 祝日データを取得
  useEffect(() => {
    const loadHolidays = async () => {
      const year = targetDate.getFullYear();
      const holidayData = await fetchHolidays(year);
      setHolidays(holidayData);
    };
    void loadHolidays();
  }, [targetDate]);

  // New state for holding the uploaded template file
  const [uploadedTemplateFile, setUploadedTemplateFile] = useState<File | null>(
    null,
  );
  // New states for Create Report Dialog
  const [isCreateReportDialogOpen, setIsCreateReportDialogOpen] =
    useState(false);
  const [templateOption, setTemplateOption] = useState("default"); // 'default' or 'upload'
  const [extensionOption, setExtensionOption] = useState("excel"); // 'excel' or 'pdf'
  const [status, setStatus] = useState<WorkReportStatus>(initialStatus);
  // 確認ダイアログの状態管理
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "submit" | "unsubmit" | null
  >(null);

  // Compute default attendance values for each day in the range…
  const defaults = generateDefaultAttendances(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    closingDay,
  );

  const initialAttendances = mergeAttendances(defaults, attendances);

  const [currentAttendances, setCurrentAttendances] =
    useState<AttendanceData[]>(initialAttendances);

  // 編集用フォーム
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      startTime: basicStartTime
        ? new Date(basicStartTime.toISOString())
        : undefined,
      endTime: basicEndTime ? new Date(basicEndTime.toISOString()) : undefined,
      breakDuration: basicBreakDuration,
      memo: "",
    },
  });

  // 一括編集用フォーム
  const bulkEditForm = useForm<BulkEditFormValues>({
    resolver: zodResolver(bulkEditFormSchema),
    defaultValues: getBulkEditFormDefaults(
      basicStartTime,
      basicEndTime,
      basicBreakDuration,
    ),
  });

  // 一括編集フォームをリセットする関数を追加
  const resetBulkEditForm = () => {
    bulkEditForm.reset(
      getBulkEditFormDefaults(basicStartTime, basicEndTime, basicBreakDuration),
    );
    setIsBulkEditModalOpen(false);
  };

  // 曜日名の配列
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  // 一括編集を適用する
  const applyBulkEdit = (data: BulkEditFormValues) => {
    const updatedValues = currentAttendances.map((attendance) => {
      const shouldUpdate = shouldUpdateDate(
        attendance.date,
        data.dateRangeMode,
        data.selectedDays,
        data.startDate,
        data.endDate,
        data.excludeHolidays,
        holidays,
      );
      if (shouldUpdate) {
        return {
          ...attendance,
          startTime: data.startTime,
          endTime: data.endTime,
          breakDuration: data.breakDuration,
          memo: data.memo,
        };
      }
      return attendance;
    });

    startTransition(async () => {
      await updateWorkReportAttendancesAction(
        contractId,
        workReportId,
        updatedValues.map((attendance) => ({
          ...attendance,
          workReportId: workReportId,
        })),
      );
      setCurrentAttendances(updatedValues);
      resetBulkEditForm();
      showSuccess("一括編集を適用しました");
    });
  };

  // 編集フォームの送信処理
  const onEditSubmit = (data: EditFormValues) => {
    try {
      startTransition(async () => {
        const updatedValues = currentAttendances.map((attendance) => {
          if (attendance.date.getTime() === editingDate?.getTime()) {
            return {
              ...attendance,
              startTime: data.startTime,
              endTime: data.endTime,
              breakDuration: data.breakDuration,
              memo: data.memo,
            };
          }
          return attendance;
        });
        // フォームの値を更新
        if (editingDate) {
          const attendance = updatedValues.find(
            (attendance) => attendance.date.getTime() === editingDate.getTime(),
          );
          if (attendance) {
            await updateWorkReportAttendanceAction(
              contractId,
              workReportId,
              attendance.date,
              {
                ...attendance,
                workReportId: workReportId,
              },
            );
          }
        }
        setCurrentAttendances(updatedValues);
        setEditingDate(null);
      });
      showSuccess("編集を適用しました");
    } catch (error) {
      console.error("編集の適用に失敗しました", error);
      showError("編集の適用に失敗しました");
    }
  };

  // openEditDialog関数を簡略化
  const openEditDialog = (date: Date) => {
    setEditingDate(date);
  };

  // editingDateの変更を監視してフォームをリセット
  useEffect(() => {
    if (editingDate) {
      const entry = currentAttendances.find(
        (attendance) => attendance.date === editingDate,
      );
      editForm.reset({
        startTime: entry?.startTime
          ? new Date(entry.startTime.toISOString())
          : undefined,
        endTime: entry?.endTime
          ? new Date(entry.endTime.toISOString())
          : undefined,
        breakDuration: entry?.breakDuration,
        memo: entry?.memo,
      });
    }
  }, [editingDate, currentAttendances, editForm]);

  // 編集をキャンセル
  const cancelEdit = () => {
    setEditingDate(null);
  };

  // ミリ秒からシリアル値に変換
  const msToSerial = (ms: number) => ms / (24 * 60 * 60 * 1000);

  // テンプレートからの作業報告書作成
  const createReportFromTemplate = async (
    templateWorkbook: ExcelJS.Workbook,
  ) => {
    try {
      // フォームデータを取得
      const formData = currentAttendances;

      // 新しいワークブックを作成
      const workbook = new ExcelJS.Workbook();

      // テンプレートからシートをコピー
      for (const worksheet of templateWorkbook.worksheets) {
        // 新しいシートを作成
        const newSheet = workbook.addWorksheet(worksheet.name);

        // シートのプロパティをコピー
        newSheet.properties = { ...worksheet.properties };

        // 列の幅をコピー
        worksheet.columns.forEach((col, index) => {
          if (col.width) {
            newSheet.getColumn(index + 1).width = col.width;
          }
        });

        // マージセル情報をコピーする
        worksheet.model.merges.forEach((mergeRange) => {
          newSheet.mergeCells(mergeRange);
        });

        // セルのスタイルをコピー
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const newRow = newSheet.getRow(rowNumber);
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const newCell = newRow.getCell(colNumber);
            newCell.style = { ...cell.style };
          });
        });

        // セルの値をコピー
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const newRow = newSheet.getRow(rowNumber);
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const newCell = newRow.getCell(colNumber);
            newCell.value = cell.value;
          });
        });
      }

      // コピー元のテンプレートに定義された名前付き範囲を新しいワークブックに追加する
      for (const definedName of templateWorkbook.definedNames.model) {
        // Get the named ranges for "name"
        const ranges = templateWorkbook.definedNames.getRanges(
          definedName.name,
        );
        if (ranges.ranges.length > 0) {
          for (const range of ranges.ranges) {
            workbook.definedNames.add(range, definedName.name);
          }
        }
      }

      // 年月の名前付き範囲を処理
      const workReportMonthRanges =
        templateWorkbook.definedNames.getRanges("タイトル");
      const [workReportMonthSheetName, workReportMonthRangeAddress] =
        parseRangeReference(workReportMonthRanges.ranges[0]);
      if (workReportMonthSheetName) {
        const targetWorkReportMonthSheet = workbook.getWorksheet(
          workReportMonthSheetName,
        );
        if (targetWorkReportMonthSheet && workReportMonthRangeAddress) {
          const workReportMonthCell = targetWorkReportMonthSheet.getCell(
            workReportMonthRangeAddress,
          );
          workReportMonthCell.value = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月度作業報告書`;
        }
      }

      // 基本開始時刻の名前付き範囲を処理
      const basicStartTimeRanges =
        workbook.definedNames.getRanges("基本開始時刻");
      if (basicStartTimeRanges.ranges.length > 0 && basicStartTime) {
        const [basicStartTimeSheetName, basicStartTimeRangeAddress] =
          parseRangeReference(basicStartTimeRanges.ranges[0]);
        if (basicStartTimeSheetName && basicStartTimeRangeAddress) {
          const targetBasicStartTimeSheet = workbook.getWorksheet(
            basicStartTimeSheetName,
          );
          if (targetBasicStartTimeSheet) {
            const basicStartTimeCell = targetBasicStartTimeSheet.getCell(
              basicStartTimeRangeAddress,
            );
            basicStartTimeCell.value = msToSerial(basicStartTime.getTime());
            basicStartTimeCell.numFmt = "[h]:mm";
          }
        }
      }

      // 基本終了時刻の名前付き範囲を処理
      const basicEndTimeRanges =
        workbook.definedNames.getRanges("基本終了時刻");
      if (basicEndTimeRanges.ranges.length > 0 && basicEndTime) {
        const [basicEndTimeSheetName, basicEndTimeRangeAddress] =
          parseRangeReference(basicEndTimeRanges.ranges[0]);
        if (basicEndTimeSheetName && basicEndTimeRangeAddress) {
          const targetBasicEndTimeSheet = workbook.getWorksheet(
            basicEndTimeSheetName,
          );
          if (targetBasicEndTimeSheet) {
            const basicEndTimeCell = targetBasicEndTimeSheet.getCell(
              basicEndTimeRangeAddress,
            );
            basicEndTimeCell.value = msToSerial(basicEndTime.getTime());
            basicEndTimeCell.numFmt = "[h]:mm";
          }
        }
      }

      // 基本休憩時間の名前付き範囲を処理
      const basicBreakDurationRanges =
        workbook.definedNames.getRanges("基本休憩時間");
      if (basicBreakDurationRanges.ranges.length > 0 && basicBreakDuration) {
        const [basicBreakDurationSheetName, basicBreakDurationRangeAddress] =
          parseRangeReference(basicBreakDurationRanges.ranges[0]);
        if (basicBreakDurationSheetName && basicBreakDurationRangeAddress) {
          const targetBasicBreakDurationSheet = workbook.getWorksheet(
            basicBreakDurationSheetName,
          );
          if (targetBasicBreakDurationSheet) {
            const basicBreakDurationCell =
              targetBasicBreakDurationSheet.getCell(
                basicBreakDurationRangeAddress,
              );
            basicBreakDurationCell.value = msToSerial(
              basicBreakDuration * 60000,
            );
            basicBreakDurationCell.numFmt = "[h]:mm";
          }
        }
      }

      // 1日あたりの作業単位の名前付き範囲を処理
      const dailyWorkMinutesRanges =
        workbook.definedNames.getRanges("_１日あたりの作業単位");
      if (dailyWorkMinutesRanges.ranges.length > 0 && dailyWorkMinutes) {
        const [dailyWorkMinutesSheetName, dailyWorkMinutesRangeAddress] =
          parseRangeReference(dailyWorkMinutesRanges.ranges[0]);
        if (dailyWorkMinutesSheetName && dailyWorkMinutesRangeAddress) {
          const targetDailyWorkMinutesSheet = workbook.getWorksheet(
            dailyWorkMinutesSheetName,
          );
          if (targetDailyWorkMinutesSheet) {
            const dailyWorkMinutesCell = targetDailyWorkMinutesSheet.getCell(
              dailyWorkMinutesRangeAddress,
            );
            dailyWorkMinutesCell.value = `${dailyWorkMinutes}分`;
          }
        }
      }

      // 1ヶ月あたりの作業単位の名前付き範囲を処理
      const monthlyWorkMinutesRanges =
        workbook.definedNames.getRanges("_１ヶ月あたりの作業単位");
      if (monthlyWorkMinutesRanges.ranges.length > 0 && monthlyWorkMinutes) {
        const [monthlyWorkMinutesSheetName, monthlyWorkMinutesRangeAddress] =
          parseRangeReference(monthlyWorkMinutesRanges.ranges[0]);
        if (monthlyWorkMinutesSheetName && monthlyWorkMinutesRangeAddress) {
          const targetMonthlyWorkMinutesSheet = workbook.getWorksheet(
            monthlyWorkMinutesSheetName,
          );
          if (targetMonthlyWorkMinutesSheet) {
            const monthlyWorkMinutesCell = targetMonthlyWorkMinutesSheet.getCell(
              monthlyWorkMinutesRangeAddress,
            );
            monthlyWorkMinutesCell.value = `${monthlyWorkMinutes}分`;
          }
        }
      }

      // ----- New code: Fill form data into the named ranges -----
      // Assume the named ranges '日付', '開始時刻', '終了時刻', '休憩時間' are each 31 cells vertically arranged
      const sortedFormData = [...formData].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );
      const fieldNames = [
        "日付",
        "開始時刻",
        "終了時刻",
        "休憩時間",
        "稼働時間",
        "作業内容",
      ];
      fieldNames.forEach((fieldName) => {
        const fieldRanges = workbook.definedNames.getRanges(fieldName);
        if (fieldRanges.ranges.length > 0) {
          const [sheetName, rangeAddress] = parseRangeReference(
            fieldRanges.ranges[0],
          );
          if (sheetName && rangeAddress) {
            const { startRow, startCol } = parseExcelRange(rangeAddress);
            const sheet = workbook.getWorksheet(sheetName);
            if (sheet) {
              for (let i = 0; i < 31; i++) {
                const currentRow = startRow + i;
                let value: string | number = "";
                if (i < sortedFormData.length) {
                  const entry = sortedFormData[i];
                  if (fieldName === "日付") {
                    value = formatMonthDay(entry.date.toISOString());
                  } else if (fieldName === "開始時刻") {
                    if (entry.startTime) {
                      value = msToSerial(entry.startTime.getTime());
                      sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                    }
                  } else if (fieldName === "終了時刻") {
                    if (entry.endTime) {
                      value = msToSerial(entry.endTime.getTime());
                      sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                    }
                  } else if (fieldName === "休憩時間") {
                    if (entry.breakDuration) {
                      value = msToSerial(entry.breakDuration * 60000);
                      sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                    }
                  } else if (fieldName === "稼働時間") {
                    if (entry.startTime && entry.endTime) {
                      const startMs = entry.startTime.getTime();
                      const endMs = entry.endTime.getTime();
                      if (entry.breakDuration) {
                        const breakMs = entry.breakDuration * 60000;
                        value = msToSerial(endMs - startMs - breakMs);
                      } else {
                        value = msToSerial(endMs - startMs);
                      }
                      sheet.getCell(currentRow, startCol).numFmt = "[h]:mm";
                    }
                  } else if (fieldName === "作業内容") {
                    if (entry.memo) {
                      value = entry.memo;
                    }
                  }
                }
                sheet.getCell(currentRow, startCol).value = value;
              }
            }
          }
        }
      });
      // ----- End of new code -----

      // ファイルを保存
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月度作業報告書.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      showSuccess("テンプレートからの作業報告書作成が完了しました");
    } catch (err) {
      console.error("Error creating report from template:", err);
      showError("テンプレートからの作業報告書作成に失敗しました");
    }
  };

  // メール送信用の関数を追加
  const createReportAndSendEmail = () => {
    try {
      if (
        !window.confirm(
          "作業報告書は自動で添付されません。\n「作業報告書を作成」でダウンロードしたファイルを手動で添付してください。",
        )
      ) {
        return;
      }
      // メーラーを起動
      const recipient = clientEmail; // 送信先
      const subject = encodeURIComponent(
        `【作業報告書】${targetDate.getUTCFullYear()}年${targetDate.getUTCMonth() + 1}月分_${userName}`,
      );
      const body = encodeURIComponent(`
${contactName ? contactName : clientName}様
   
お世話になっております。${userName}です。

${targetDate.getUTCFullYear()}年${targetDate.getUTCMonth() + 1}月分の作業報告書を送付いたします。
ご確認のほど、よろしくお願いいたします。
`);
      window.open(
        `mailto:${recipient}?subject=${subject}&body=${body}`,
        "_blank",
      );
    } catch (error) {
      console.error("作業報告書の作成に失敗しました", error);
      showError("作業報告書の作成に失敗しました");
    }
  };

  const handleConfirmCreateReport = async () => {
    if (extensionOption === "excel") {
      if (templateOption === "upload") {
        if (!uploadedTemplateFile) {
          showError("テンプレートファイルが選択されていません");
          return;
        }
        try {
          const buffer = await uploadedTemplateFile.arrayBuffer();
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          await createReportFromTemplate(workbook);
        } catch (err) {
          console.error("アップロードテンプレートの処理に失敗しました", err);
          showError("アップロードテンプレートの処理に失敗しました");
          return;
        }
      }
      if (templateOption === "default") {
        try {
          const response = await fetch("/workReportDefaultTemplate.xlsx");
          if (!response.ok) {
            throw new Error("デフォルトテンプレートの取得に失敗しました");
          }
          const buffer = await response.arrayBuffer();
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          await createReportFromTemplate(workbook);
        } catch (err) {
          console.error("デフォルトテンプレートの読み込みに失敗しました:", err);
          showError("デフォルトテンプレートの読み込みに失敗しました");
          return;
        }
      }
    } else if (extensionOption === "pdf") {
      showError("PDF形式での作業報告書作成は未実装です");
      return;
    }
    setIsCreateReportDialogOpen(false);
  };

  // 月締め確認ダイアログを開く
  const handleStatusChangeClick = () => {
    const nextAction = status === "SUBMITTED" ? "unsubmit" : "submit";
    setConfirmAction(nextAction);
    setIsConfirmDialogOpen(true);
  };

  // 月締め処理を実行
  const handleConfirmStatusChange = () => {
    if (!confirmAction) return;

    const nextStatus = confirmAction === "submit" ? "SUBMITTED" : "DRAFT";
    startTransition(async () => {
      try {
        await updateWorkReportStatusAction(workReportId, nextStatus);
        setStatus(nextStatus);
        showSuccess(
          nextStatus === "SUBMITTED" ? "月締めしました" : "月締め解除しました",
        );
      } catch {
        showError("月締めステータスの変更に失敗しました");
      }
    });
    setIsConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  // 確認ダイアログをキャンセル
  const handleCancelConfirm = () => {
    setIsConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold dark:text-white">
        {contractName}の{targetDate.getFullYear()}年{targetDate.getMonth() + 1}
        月度作業報告書
      </h1>
      <FormError message={error.message} resetSignal={error.date.getTime()} />
      <FormSuccess
        message={success.message}
        resetSignal={success.date.getTime()}
      />

      <div className="flex flex-col gap-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">出勤情報を入力</h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleStatusChangeClick}
            >
              {status === "SUBMITTED" ? "月締め解除" : "月締め"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBulkEditModalOpen(true);
              }}
            >
              一括入力
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={status !== "SUBMITTED"}
              onClick={() => {
                setIsCreateReportDialogOpen(true);
              }}
            >
              作業報告書を作成
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={status !== "SUBMITTED"}
              onClick={createReportAndSendEmail}
            >
              メール送信
            </Button>
          </div>
        </div>

        {/* 列ヘッダー */}
        <div className="mb-2 flex items-center space-x-4">
          <span className="w-40"></span>
          <span className="w-16"></span>
          <span className="flex-1 text-center font-medium">出勤時間</span>
          <span className="flex-1 text-center font-medium">退勤時間</span>
          <span className="flex-1 text-center font-medium">休憩時間</span>
          <span className="w-[400px] text-center font-medium">作業内容</span>
        </div>

        {currentAttendances.map((day) => (
          <div
            key={day.date.toISOString()}
            className="mb-2 flex items-center space-x-4"
          >
            <div className="flex w-40 items-center justify-between">
              <span>
                {(() => {
                  const date = day.date;
                  const dayOfWeek = date.getDay();
                  const dateStr = formatDateAsUTC(date);
                  const dayName = dayNames[dayOfWeek];
                  const colorClass = getDateColorClass(date, holidays);

                  return (
                    <>
                      {dateStr} (<span className={colorClass}>{dayName}</span>)
                    </>
                  );
                })()}
              </span>
            </div>
            <div className="flex w-16 items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  openEditDialog(day.date);
                }}
              >
                編集
              </Button>
            </div>
            <div className="flex-1">
              <Input
                type="time"
                id={`start-${day.date.toISOString()}`}
                readOnly
                value={
                  day.startTime
                    ? day.startTime.toISOString().split("T")[1].substring(0, 5)
                    : ""
                }
              />
            </div>
            <div className="flex-1">
              <Input
                type="time"
                id={`end-${day.date.toISOString()}`}
                readOnly
                value={
                  day.endTime
                    ? day.endTime.toISOString().split("T")[1].substring(0, 5)
                    : ""
                }
              />
            </div>
            <div className="flex-1">
              <Input
                type="time"
                id={`break-${day.date.toISOString()}`}
                readOnly
                value={
                  day.breakDuration
                    ? `${Math.floor(day.breakDuration / 60)
                        .toString()
                        .padStart(
                          2,
                          "0",
                        )}:${(day.breakDuration % 60).toString().padStart(2, "0")}`
                    : ""
                }
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                id={`memo-${day.date.toISOString()}`}
                className="w-[400px]"
                readOnly
                value={day.memo ?? ""}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 一括編集用モーダルダイアログ */}
      <Dialog
        open={isBulkEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetBulkEditForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>勤怠情報の一括入力</DialogTitle>
          </DialogHeader>
          <Form {...bulkEditForm}>
            <form
              onSubmit={bulkEditForm.handleSubmit(applyBulkEdit)}
              className="space-y-4"
            >
              <div>
                <h3 className="mb-2 text-sm font-medium">適用範囲</h3>
                <FormField
                  control={bulkEditForm.control}
                  name="dateRangeMode"
                  render={({ field }) => (
                    <FormItem className="flex space-x-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={(
                            value: "all" | "weekday" | "custom",
                          ) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <label htmlFor="all">全日</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekday" id="weekday" />
                            <label htmlFor="weekday">曜日指定</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <label htmlFor="custom">期間指定</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {bulkEditForm.watch("dateRangeMode") === "weekday" && (
                <div className="py-2">
                  <h3 className="mb-2 text-sm font-medium">曜日を選択</h3>
                  <FormField
                    control={bulkEditForm.control}
                    name="selectedDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {dayNames.map((day, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`day-${index}`}
                                  checked={field.value?.includes(index)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value ?? [];
                                    if (checked) {
                                      field.onChange([...currentValue, index]);
                                    } else {
                                      field.onChange(
                                        currentValue.filter((d) => d !== index),
                                      );
                                    }
                                  }}
                                />
                                <Label htmlFor={`day-${index}`}>{day}</Label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {bulkEditForm.watch("dateRangeMode") === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <DatePickerField
                    control={bulkEditForm.control}
                    name="startDate"
                    label="開始日"
                    placeholder="開始日を選択(任意)"
                  />

                  <DatePickerField
                    control={bulkEditForm.control}
                    name="endDate"
                    label="終了日"
                    placeholder="終了日を選択(任意)"
                  />
                </div>
              )}

              {/* 祝日除外チェックボックス */}
              <div className="py-2">
                <FormField
                  control={bulkEditForm.control}
                  name="excludeHolidays"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        祝日は除く
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">勤怠情報</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <TimePickerFieldForDate
                      control={bulkEditForm.control}
                      name="startTime"
                      showClearButton={false}
                      minuteStep={dailyWorkMinutes}
                      label="出勤時間"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <TimePickerFieldForDate
                      control={bulkEditForm.control}
                      name="endTime"
                      showClearButton={false}
                      minuteStep={dailyWorkMinutes}
                      label="退勤時間"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <TimePickerFieldForNumber
                      control={bulkEditForm.control}
                      name="breakDuration"
                      showClearButton={false}
                      minuteStep={dailyWorkMinutes}
                      label="休憩時間"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>作業内容</div>
                    <FormField
                      control={bulkEditForm.control}
                      name="memo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>作業内容</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="w-[400px]"
                              {...field}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetBulkEditForm}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit">適用</Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* テンプレート作成オプションダイアログ */}
      <Dialog
        open={isCreateReportDialogOpen}
        onOpenChange={setIsCreateReportDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>作業報告書作成オプション</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="font-medium">テンプレート選択</legend>
              <div className="flex space-x-4">
                <Label
                  htmlFor="defaultTemplate"
                  className="inline-flex items-center gap-2"
                >
                  <Input
                    type="radio"
                    id="defaultTemplate"
                    name="templateOption"
                    value="default"
                    checked={templateOption === "default"}
                    onChange={() => {
                      setTemplateOption("default");
                    }}
                    className="size-4"
                  />
                  <span>デフォルトテンプレート</span>
                </Label>
                <Label
                  htmlFor="uploadTemplateOption"
                  className="inline-flex items-center gap-2"
                >
                  <Input
                    type="radio"
                    id="uploadTemplateOption"
                    name="templateOption"
                    value="upload"
                    checked={templateOption === "upload"}
                    onChange={() => {
                      setTemplateOption("upload");
                    }}
                    className="size-4"
                  />
                  <span>テンプレートをアップロード</span>
                </Label>
              </div>
              {templateOption === "upload" && (
                <div className="mt-2">
                  <Label htmlFor="templateUpload" className="mb-1 block">
                    テンプレートファイルを選択
                  </Label>
                  <Input
                    type="file"
                    id="templateUpload"
                    accept=".xlsx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadedTemplateFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="font-medium">拡張子</legend>
              <div className="flex space-x-4">
                <Label
                  htmlFor="excelFormat"
                  className="inline-flex items-center gap-2"
                >
                  <Input
                    type="radio"
                    id="excelFormat"
                    name="extensionOption"
                    value="excel"
                    checked={extensionOption === "excel"}
                    onChange={() => {
                      setExtensionOption("excel");
                    }}
                    className="size-4"
                  />
                  <span>エクセル形式</span>
                </Label>
                <Label
                  htmlFor="pdfFormat"
                  className="inline-flex items-center gap-2"
                >
                  <Input
                    type="radio"
                    id="pdfFormat"
                    name="extensionOption"
                    value="pdf"
                    checked={extensionOption === "pdf"}
                    onChange={() => {
                      setExtensionOption("pdf");
                    }}
                    className="size-4"
                  />
                  <span>PDF形式</span>
                </Label>
              </div>
            </fieldset>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateReportDialogOpen(false);
                }}
              >
                キャンセル
              </Button>
              <Button type="button" onClick={handleConfirmCreateReport}>
                作成
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 編集用モーダルダイアログ */}
      <Dialog
        open={editingDate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDate(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>勤怠情報の編集</DialogTitle>
          </DialogHeader>
          {editingDate && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <div>
                  <h3 className="mb-2 text-sm font-medium">
                    {(() => {
                      const date = new Date(editingDate);
                      const dayOfWeek = date.getDay();
                      return `${formatDateAsUTC(editingDate)} (${dayNames[dayOfWeek]})の勤怠情報を編集`;
                    })()}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <TimePickerFieldForDate
                        control={editForm.control}
                        name="startTime"
                        label="出勤時間"
                        minuteStep={dailyWorkMinutes}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <TimePickerFieldForDate
                        control={editForm.control}
                        name="endTime"
                        label="退勤時間"
                        minuteStep={dailyWorkMinutes}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <TimePickerFieldForNumber
                        control={editForm.control}
                        name="breakDuration"
                        label="休憩時間"
                        minuteStep={dailyWorkMinutes}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <FormField
                        control={editForm.control}
                        name="memo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>作業内容</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                className="w-[400px]"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    キャンセル
                  </Button>
                  <Button type="submit">保存</Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* 月締め確認ダイアログ */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "submit" ? "月締め確認" : "月締め解除確認"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {confirmAction === "submit"
                ? "この作業報告書を月締めします。月締め後は内容の変更ができなくなります。よろしいですか？"
                : "この作業報告書の月締めを解除します。解除後は内容の変更が可能になります。よろしいですか？"}
            </p>
          </div>
          <DialogFooter className="p-6">
            <Button variant="outline" onClick={handleCancelConfirm}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmStatusChange}>
              {confirmAction === "submit" ? "月締めする" : "月締め解除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
