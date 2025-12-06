import ExcelJS from "exceljs";

import { WORK_REPORT_DAYS } from "@/features/work-report/constants/work-report-constants";
import type { AttendanceData } from "@/features/work-report/types/attendance";
import {
  parseExcelRange,
  parseRangeReference,
  replaceSheetNameInReference,
} from "@/features/work-report/utils/attendance-utils";
import {
  FIELD_NAMES,
  setCellValueForField,
} from "@/features/work-report/utils/excel-field-mappers";
import { msToSerial } from "@/features/work-report/utils/excel-utils";
import {
  generatePlaceholderValues,
  replacePlaceholders,
  resolvePlaceholderValue,
  type InvoiceContractData,
} from "@/features/work-report/utils/placeholder-utils";

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
  email?: string | null;
  basicStartTime: Date | null;
  basicEndTime: Date | null;
  basicBreakDuration: number | null;
  dailyWorkMinutes: number | null;
  monthlyWorkMinutes: number | null;
  remarks?: string | null;
  // ユーザー情報（請求書用）- 将来の変更のため一時的にコメントアウト
  postalCode?: string | null;
  address?: string | null;
  bankName?: string | null;
  bankBranchName?: string | null;
  bankAccountType?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
}

/**
 * カスタムフィールドマッピングの型定義（オプショナル）
 */
export interface CustomFieldMapping {
  namedRange: string;
  valueTemplate: string;
  valueType: "NUMBER" | "STRING";
  numFmt?: string | null;
}

/**
 * テンプレートから作業報告書のExcelファイルを生成
 *
 * @param templateWorkbook テンプレートワークブック
 * @param data 作業報告書データ
 * @param customFieldMappings カスタムフィールドマッピング（オプション）
 * @param targetSheetName 出力するシート名（オプション、指定がない場合は最初のシート）
 * @param contractData 請求書用契約データ（オプション）
 * @returns 生成されたExcelファイルのBlob
 */
export async function generateWorkReportExcel(
  templateWorkbook: ExcelJS.Workbook,
  data: WorkReportExcelData,
  customFieldMappings?: CustomFieldMapping[],
  targetSheetName?: string | null,
  contractData?: InvoiceContractData,
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

  // 出力対象のシートを決定
  // targetSheetNameが指定されている場合はそのシート、なければ最初のシート
  const worksheetsToProcess = targetSheetName
    ? templateWorkbook.worksheets.filter((ws) => ws.name === targetSheetName)
    : templateWorkbook.worksheets.slice(0, 1);

  // 指定されたシートが見つからない場合はエラー
  if (targetSheetName && worksheetsToProcess.length === 0) {
    throw new Error(
      `指定されたシート "${targetSheetName}" がテンプレートに存在しません`,
    );
  }

  // テンプレートからシートをコピー
  for (const worksheet of worksheetsToProcess) {
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

    // 行の高さをコピー
    for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (row.height) {
        newSheet.getRow(rowNumber).height = row.height;
      }
    }

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

    // 画像をコピー
    const images = worksheet.getImages();
    for (const imageInfo of images) {
      try {
        // テンプレートワークブックから画像データを取得
        // imageInfo.imageIdは文字列だが、getImageは数値を要求するため変換
        const imageId = parseInt(imageInfo.imageId, 10);

        // 画像IDが有効な数値でない場合はスキップ
        if (isNaN(imageId)) {
          console.warn(
            `シート "${worksheet.name}" の画像ID "${imageInfo.imageId}" が無効です`,
          );
          continue;
        }

        // テンプレートから画像データを取得
        const imageData = templateWorkbook.getImage(imageId);

        // 画像データが存在しない場合はスキップ
        if (!imageData) {
          console.warn(
            `シート "${worksheet.name}" の画像ID ${imageId} のデータが見つかりません`,
          );
          continue;
        }

        // 新しいワークブックに画像を追加（新しいIDが返される）
        const newImageId = workbook.addImage(imageData);

        // 新しいシートに画像を配置（位置情報を保持）
        newSheet.addImage(newImageId, imageInfo.range);
      } catch (error) {
        // 個別の画像コピーが失敗してもエラーをスローせず、警告のみ表示
        console.error(
          `シート "${worksheet.name}" の画像コピー中にエラーが発生しました:`,
          error,
        );
      }
    }
  }

  // コピー元のテンプレートに定義された名前付き範囲を新しいワークブックに追加する
  // targetSheetNameが指定されている場合、シート参照を新しいワークブックのシート名に置き換える
  for (const definedName of templateWorkbook.definedNames.model) {
    // Get the named ranges for "name"
    const ranges = templateWorkbook.definedNames.getRanges(definedName.name);
    if (ranges.ranges.length > 0) {
      for (const range of ranges.ranges) {
        // 新しいワークブックに追加されたシートの名前を取得
        const targetSheetForRange = worksheetsToProcess[0]?.name;
        if (targetSheetForRange) {
          // シート参照を新しいワークブックのシート名に置き換え
          const adjustedRange = replaceSheetNameInReference(
            range,
            targetSheetForRange,
          );
          workbook.definedNames.add(adjustedRange, definedName.name);
        } else {
          // targetSheetNameが指定されていない場合は元の範囲文字列を使用
          workbook.definedNames.add(range, definedName.name);
        }
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
    // テンプレートにnumFmtが設定されていない場合のみ、placeholderのnumFmtを適用
    if (!cell.numFmt && cellValue.numFmt) {
      cell.numFmt = cellValue.numFmt;
    }
  };

  // カスタムフィールドマッピングの処理
  if (customFieldMappings && customFieldMappings.length > 0) {
    // プレースホルダー値を生成
    const placeholderValues = generatePlaceholderValues(data, contractData);

    // 各カスタムフィールドマッピングを処理
    for (const mapping of customFieldMappings) {
      setNamedRangeValue(mapping.namedRange, () => {
        // 新しい置換ロジックを使用
        const resolvedValue = resolvePlaceholderValue(
          mapping.valueTemplate,
          mapping.valueType,
          placeholderValues,
        );
        return {
          value: resolvedValue,
          numFmt: mapping.numFmt ?? undefined,
        };
      });
    }
  }

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
