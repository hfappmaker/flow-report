"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldMappingEditor } from "@/features/work-report/components/field-mapping-editor";
import {
  type FieldMappingFormValues,
  findDuplicateNamedRanges,
  validateExcelFile,
  validateNamedRange,
} from "@/features/work-report/schemas/work-report-template-form-schema";

export interface ExcelTemplateFormValues {
  name: string;
  file: File | null;
  sheetName: string | null;
  fieldMappings: FieldMappingFormValues[];
}

interface ExcelTemplateFormProps {
  defaultValues?: {
    name: string;
    fileName?: string;
    sheetName?: string | null;
    fieldMappings: FieldMappingFormValues[];
  };
  onSubmit: (values: ExcelTemplateFormValues) => void;
  submitButtonText: string;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ExcelTemplateForm({
  defaultValues,
  onSubmit,
  submitButtonText,
  onCancel,
  isSubmitting = false,
}: ExcelTemplateFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState(defaultValues?.sheetName ?? "");
  const [fieldMappings, setFieldMappings] = useState<FieldMappingFormValues[]>(
    defaultValues?.fieldMappings ?? [],
  );
  const [errors, setErrors] = useState<{
    name?: string;
    file?: string;
    fieldMappings?: Record<
      number,
      { namedRange?: string; valueTemplate?: string }
    >;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!defaultValues;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrors((prev) => ({ ...prev, file: undefined }));

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = validateExcelFile(selectedFile);
    if (validationError) {
      setErrors((prev) => ({ ...prev, file: validationError }));
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "テンプレート名は必須です";
    }

    if (!isEditMode && !file) {
      newErrors.file = "Excelファイルは必須です";
    }

    const fieldMappingErrors: Record<
      number,
      { namedRange?: string; valueTemplate?: string }
    > = {};

    // 重複チェック
    const duplicateIndices = findDuplicateNamedRanges(fieldMappings);

    fieldMappings.forEach((mapping, index) => {
      const fieldErrors: { namedRange?: string; valueTemplate?: string } = {};
      const namedRangeError = validateNamedRange(mapping.namedRange);
      if (namedRangeError) {
        fieldErrors.namedRange = namedRangeError;
      } else if (duplicateIndices.has(index)) {
        fieldErrors.namedRange = "同じ名前付き範囲が重複しています";
      }
      if (!mapping.valueTemplate.trim()) {
        fieldErrors.valueTemplate = "値は必須です";
      }
      if (Object.keys(fieldErrors).length > 0) {
        fieldMappingErrors[index] = fieldErrors;
      }
    });

    if (Object.keys(fieldMappingErrors).length > 0) {
      newErrors.fieldMappings = fieldMappingErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFieldMapping = (
    index: number,
    field: keyof FieldMappingFormValues,
  ) => {
    const mapping = fieldMappings[index];
    if (!mapping) return;

    // 重複チェック
    const duplicateIndices = findDuplicateNamedRanges(fieldMappings);

    setErrors((prev) => {
      const currentFieldMappingErrors = prev.fieldMappings ?? {};

      // 現在のインデックスのエラーを計算
      const fieldErrors: { namedRange?: string; valueTemplate?: string } = {};

      if (field === "namedRange") {
        const namedRangeError = validateNamedRange(mapping.namedRange);
        if (namedRangeError) {
          fieldErrors.namedRange = namedRangeError;
        } else if (duplicateIndices.has(index)) {
          fieldErrors.namedRange = "同じ名前付き範囲が重複しています";
        }
      } else if (field === "valueTemplate") {
        if (!mapping.valueTemplate.trim()) {
          fieldErrors.valueTemplate = "値は必須です";
        }
      }

      // 他のフィールドマッピングの重複エラーも更新
      const updatedFieldMappingErrors = { ...currentFieldMappingErrors };

      // すべてのフィールドマッピングの重複エラーをリセットし再計算
      fieldMappings.forEach((_, i) => {
        const currentErrors = updatedFieldMappingErrors[i] ?? {};

        if (duplicateIndices.has(i)) {
          updatedFieldMappingErrors[i] = {
            ...currentErrors,
            namedRange: "同じ名前付き範囲が重複しています",
          };
        } else if (currentErrors.namedRange === "同じ名前付き範囲が重複しています") {
          // 重複エラーのみを削除し、他のエラーは保持
          const { namedRange: _, ...restErrors } = currentErrors;
          if (Object.keys(restErrors).length > 0) {
            updatedFieldMappingErrors[i] = restErrors;
          } else {
            delete updatedFieldMappingErrors[i];
          }
        }
      });

      // 現在のインデックスのエラーを更新
      const currentFieldErrors = updatedFieldMappingErrors[index] ?? {};
      const updatedFieldErrors = {
        ...currentFieldErrors,
        [field]: fieldErrors[field],
      };

      // エラーがない場合はそのフィールドのエラーを削除
      if (!updatedFieldErrors.namedRange) {
        delete updatedFieldErrors.namedRange;
      }
      if (!updatedFieldErrors.valueTemplate) {
        delete updatedFieldErrors.valueTemplate;
      }

      if (Object.keys(updatedFieldErrors).length > 0) {
        updatedFieldMappingErrors[index] = updatedFieldErrors;
      } else {
        delete updatedFieldMappingErrors[index];
      }

      return {
        ...prev,
        fieldMappings:
          Object.keys(updatedFieldMappingErrors).length > 0
            ? updatedFieldMappingErrors
            : undefined,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      file,
      sheetName: sheetName.trim() || null,
      fieldMappings,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-1">
      <div className="space-y-2">
        <Label htmlFor="name">テンプレート名</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          placeholder="例: 株式会社〇〇向けテンプレート"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">
          Excelテンプレートファイル (.xlsx, .xltx)
          {isEditMode && " - 変更する場合のみ選択"}
        </Label>
        {isEditMode && defaultValues?.fileName && !file && (
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            <FileSpreadsheet className="size-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {defaultValues.fileName}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            accept=".xlsx,.xltx"
            ref={fileInputRef}
            onChange={handleFileChange}
            className={`cursor-pointer ${errors.file ? "border-red-500" : ""}`}
          />
        </div>
        {file && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Upload className="size-4" />
            選択: {file.name}
          </div>
        )}
        {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
        <p className="text-xs text-muted-foreground">最大ファイルサイズ: 5MB</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sheetName">出力シート名（オプション）</Label>
        <Input
          id="sheetName"
          value={sheetName}
          onChange={(e) => {
            setSheetName(e.target.value);
          }}
          placeholder="空欄の場合は最初のシートを使用"
        />
        <p className="text-xs text-muted-foreground">
          Excelファイル内のシート名を指定します。空欄の場合は最初のシートが使用されます。
        </p>
      </div>

      <div className="border-t pt-4">
        <FieldMappingEditor
          fieldMappings={fieldMappings}
          onChange={setFieldMappings}
          onBlur={validateFieldMapping}
          errors={errors.fieldMappings}
        />
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "処理中..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
