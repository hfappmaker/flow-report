import ExcelJS from "exceljs";

import {
  calculateBasicWorkMinutes,
  calculateTotalWorkMinutes,
  calculateWorkingDays,
} from "@/features/contract/utils/contract-calculation-utils";
import { WORK_REPORT_DAYS } from "@/features/work-report/constants/work-report-constants";
import type { AttendanceData } from "@/features/work-report/types/attendance";
import {
  parseExcelRange,
  parseRangeReference,
} from "@/features/work-report/utils/attendance-utils";
import { formatWorkReportMonth } from "@/features/work-report/utils/date-formatting";
import {
  FIELD_NAMES,
  setCellValueForField,
} from "@/features/work-report/utils/excel-field-mappers";
import { msToSerial } from "@/features/work-report/utils/excel-utils";

/**
 * Excel名前付き範囲のセル値の型定義
 */
interface NamedRangeCellValue {
  value: string | number;
  numFmt?: string;
}

/**
 * 作業報告書Excel生成に必要なデータ
 */
export interface WorkReportExcelData {
  attendances: AttendanceData[];
  targetDate: Date;
  userName: string;
  basicStartTime: Date | null;
  basicEndTime: Date | null;
  basicBreakDuration: number | null;
  dailyWorkMinutes: number | null;
  monthlyWorkMinutes: number | null;
  remarks?: string | null;
}

/**
 * テンプレートから作業報告書のExcelファイルを生成
 *
 * @param templateWorkbook テンプレートワークブック
 * @param data 作業報告書データ
 * @returns 生成されたExcelファイルのBlob
 */
export async function generateWorkReportExcel(
  templateWorkbook: ExcelJS.Workbook,
  data: WorkReportExcelData,
): Promise<Blob> {
  const {
    attendances,
    targetDate,
    userName,
    basicStartTime,
    basicEndTime,
    basicBreakDuration,
    dailyWorkMinutes,
    monthlyWorkMinutes,
    remarks,
  } = data;

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

    // セルのスタイルと値をコピー
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const newRow = newSheet.getRow(rowNumber);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const newCell = newRow.getCell(colNumber);
        newCell.style = { ...cell.style };
        newCell.value = cell.value;
      });
    });
  }

  // コピー元のテンプレートに定義された名前付き範囲を新しいワークブックに追加する
  for (const definedName of templateWorkbook.definedNames.model) {
    // Get the named ranges for "name"
    const ranges = templateWorkbook.definedNames.getRanges(definedName.name);
    if (ranges.ranges.length > 0) {
      for (const range of ranges.ranges) {
        workbook.definedNames.add(range, definedName.name);
      }
    }
  }

  // 名前付き範囲に値を設定するヘルパー関数
  const setNamedRangeValue = (
    rangeName: string,
    getCellValue: () => NamedRangeCellValue | null,
  ) => {
    const ranges = workbook.definedNames.getRanges(rangeName);
    if (ranges.ranges.length === 0) return;

    const cellValue = getCellValue();
    if (!cellValue) return;

    const [sheetName, rangeAddress] = parseRangeReference(ranges.ranges[0]);
    if (!sheetName || !rangeAddress) return;

    const sheet = workbook.getWorksheet(sheetName);
    if (!sheet) return;

    const cell = sheet.getCell(rangeAddress);
    cell.value = cellValue.value;
    if (cellValue.numFmt) {
      cell.numFmt = cellValue.numFmt;
    }
  };

  // 各名前付き範囲に値を設定
  setNamedRangeValue("タイトル", () => ({
    value: formatWorkReportMonth(targetDate),
  }));

  setNamedRangeValue("作業者名", () => ({ value: userName }));

  setNamedRangeValue("基本開始時刻", () =>
    basicStartTime
      ? { value: msToSerial(basicStartTime.getTime()), numFmt: "[h]:mm" }
      : null,
  );

  setNamedRangeValue("基本終了時刻", () =>
    basicEndTime
      ? { value: msToSerial(basicEndTime.getTime()), numFmt: "[h]:mm" }
      : null,
  );

  setNamedRangeValue("基本休憩時間", () =>
    basicBreakDuration
      ? {
          value: msToSerial(basicBreakDuration * 60000),
          numFmt: "[h]:mm",
        }
      : null,
  );

  setNamedRangeValue("_１日あたりの作業単位", () =>
    dailyWorkMinutes ? { value: `${String(dailyWorkMinutes)}分` } : null,
  );

  setNamedRangeValue("_１ヶ月あたりの作業単位", () =>
    monthlyWorkMinutes ? { value: `${String(monthlyWorkMinutes)}分` } : null,
  );

  // 備考
  setNamedRangeValue("備考", () => (remarks ? { value: remarks } : null));

  // 総稼働時間
  const totalWorkMinutes = calculateTotalWorkMinutes(attendances);
  setNamedRangeValue("総稼働時間", () => ({
    value: msToSerial(totalWorkMinutes * 60 * 1000),
    numFmt: "[h]:mm",
  }));

  // 基本稼働時間
  const basicWorkMinutes = calculateBasicWorkMinutes(
    basicStartTime,
    basicEndTime,
    basicBreakDuration,
  );
  setNamedRangeValue("基本稼働時間", () =>
    basicWorkMinutes !== null
      ? {
          value: msToSerial(basicWorkMinutes * 60 * 1000),
          numFmt: "[h]:mm",
        }
      : null,
  );

  // 稼働日数
  const workingDays = calculateWorkingDays(attendances);
  setNamedRangeValue("稼働日数", () => ({
    value: workingDays,
  }));

  // フォームデータを名前付き範囲に入力
  // 各名前付き範囲（'日付', '開始時刻', '終了時刻', '休憩時間'）は31セルが縦に並んでいると仮定
  const sortedFormData = [...attendances].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  FIELD_NAMES.forEach((fieldName) => {
    const fieldRanges = workbook.definedNames.getRanges(fieldName);
    if (fieldRanges.ranges.length > 0) {
      const [sheetName, rangeAddress] = parseRangeReference(
        fieldRanges.ranges[0],
      );
      if (sheetName && rangeAddress) {
        const { startRow, startCol, endRow } = parseExcelRange(rangeAddress);
        const sheet = workbook.getWorksheet(sheetName);
        if (sheet) {
          const maxRows = Math.min(endRow - startRow + 1, WORK_REPORT_DAYS);
          for (let i = 0; i < maxRows; i++) {
            const currentRow = startRow + i;
            const entry =
              i < sortedFormData.length ? sortedFormData[i] : undefined;
            setCellValueForField(fieldName, entry, sheet, currentRow, startCol);
          }
        }
      }
    }
  });

  // Excelファイルをバッファとして書き出し
  const buffer = await workbook.xlsx.writeBuffer();

  // Blobオブジェクトを作成して返す
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return blob;
}
