"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileSpreadsheet, Upload } from "lucide-react";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldMappingEditor } from "@/features/work-report/components/field-mapping-editor";
import {
  type ExcelTemplateCreateFormValues,
  type ExcelTemplateEditFormValues,
  type FieldMappingFormValues,
  excelTemplateCreateFormSchema,
  excelTemplateEditFormSchema,
  findDuplicateNamedRanges,
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

type FormValues = ExcelTemplateCreateFormValues | ExcelTemplateEditFormValues;

export function ExcelTemplateForm({
  defaultValues,
  onSubmit,
  submitButtonText,
  onCancel,
  isSubmitting = false,
}: ExcelTemplateFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!defaultValues;

  const schema = useMemo(
    () =>
      isEditMode ? excelTemplateEditFormSchema : excelTemplateCreateFormSchema,
    [isEditMode],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      file: null,
      sheetName: defaultValues?.sheetName ?? "",
      fieldMappings: defaultValues?.fieldMappings ?? [],
    },
  });

  const file = form.watch("file");
  const fieldMappings = form.watch("fieldMappings");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    form.clearErrors("file");

    if (!selectedFile) {
      form.setValue("file", null);
      return;
    }

    form.setValue("file", selectedFile);
    void form.trigger("file");
  };

  const validateFieldMapping = (
    index: number,
    field: keyof FieldMappingFormValues,
  ) => {
    const mapping = fieldMappings[index];
    if (!mapping) return;

    // 重複チェック
    const duplicateIndices = findDuplicateNamedRanges(fieldMappings);

    if (field === "namedRange") {
      const namedRangeError = validateNamedRange(mapping.namedRange);
      if (namedRangeError) {
        form.setError(`fieldMappings.${index}.namedRange`, {
          message: namedRangeError,
        });
      } else if (duplicateIndices.has(index)) {
        form.setError(`fieldMappings.${index}.namedRange`, {
          message: "同じ名前付き範囲が重複しています",
        });
      } else {
        form.clearErrors(`fieldMappings.${index}.namedRange`);
      }

      // 他のフィールドマッピングの重複エラーも更新
      fieldMappings.forEach((_, i) => {
        if (i === index) return;
        if (duplicateIndices.has(i)) {
          form.setError(`fieldMappings.${i}.namedRange`, {
            message: "同じ名前付き範囲が重複しています",
          });
        } else {
          // 重複エラーのみをクリア（他のバリデーションエラーは保持）
          const currentError =
            form.formState.errors.fieldMappings?.[i]?.namedRange?.message;
          if (currentError === "同じ名前付き範囲が重複しています") {
            form.clearErrors(`fieldMappings.${i}.namedRange`);
          }
        }
      });
    } else if (field === "valueTemplate") {
      if (!mapping.valueTemplate.trim()) {
        form.setError(`fieldMappings.${index}.valueTemplate`, {
          message: "値は必須です",
        });
      } else {
        form.clearErrors(`fieldMappings.${index}.valueTemplate`);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = form.getValues();

    // フィールドマッピングの詳細バリデーション
    const fieldMappingErrors: Record<
      number,
      { namedRange?: string; valueTemplate?: string }
    > = {};

    // 重複チェック
    const duplicateIndices = findDuplicateNamedRanges(values.fieldMappings);

    values.fieldMappings.forEach((mapping, index) => {
      const fieldErrors: { namedRange?: string; valueTemplate?: string } = {};
      const namedRangeError = validateNamedRange(mapping.namedRange);
      if (namedRangeError) {
        fieldErrors.namedRange = namedRangeError;
        form.setError(`fieldMappings.${index}.namedRange`, {
          message: namedRangeError,
        });
      } else if (duplicateIndices.has(index)) {
        fieldErrors.namedRange = "同じ名前付き範囲が重複しています";
        form.setError(`fieldMappings.${index}.namedRange`, {
          message: "同じ名前付き範囲が重複しています",
        });
      }
      if (!mapping.valueTemplate.trim()) {
        fieldErrors.valueTemplate = "値は必須です";
        form.setError(`fieldMappings.${index}.valueTemplate`, {
          message: "値は必須です",
        });
      }
      if (Object.keys(fieldErrors).length > 0) {
        fieldMappingErrors[index] = fieldErrors;
      }
    });

    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".") as keyof FormValues;
        form.setError(path, { message: issue.message });
      });
      return;
    }

    if (Object.keys(fieldMappingErrors).length > 0) {
      return;
    }

    onSubmit({
      name: values.name.trim(),
      file: values.file ?? null,
      sheetName:
        typeof values.sheetName === "string" && values.sheetName.trim()
          ? values.sheetName.trim()
          : null,
      fieldMappings: values.fieldMappings,
    });
  };

  // FieldMappingEditor用のエラー形式に変換
  const fieldMappingErrors = useMemo(() => {
    const errors = form.formState.errors.fieldMappings;
    if (!errors || !Array.isArray(errors)) return undefined;

    const result: Record<
      number,
      { namedRange?: string; valueTemplate?: string }
    > = {};
    errors.forEach((error, index) => {
      if (error) {
        const fieldError: { namedRange?: string; valueTemplate?: string } = {};
        if (error.namedRange?.message) {
          fieldError.namedRange = error.namedRange.message;
        }
        if (error.valueTemplate?.message) {
          fieldError.valueTemplate = error.valueTemplate.message;
        }
        if (Object.keys(fieldError).length > 0) {
          result[index] = fieldError;
        }
      }
    });
    return Object.keys(result).length > 0 ? result : undefined;
  }, [form.formState.errors.fieldMappings]);

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
        <div className="space-y-6 px-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>テンプレート名</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="例: 株式会社〇〇向けテンプレート"
                    onBlur={() => {
                      field.onBlur();
                      void form.trigger("name");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem>
                <FormLabel>
                  Excelテンプレートファイル (.xlsx, .xltx)
                  {isEditMode && " - 変更する場合のみ選択"}
                </FormLabel>
                {isEditMode && defaultValues?.fileName && !file && (
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                    <FileSpreadsheet className="size-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {defaultValues.fileName}
                    </span>
                  </div>
                )}
                <FormControl>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xltx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </FormControl>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Upload className="size-4" />
                    選択: {file.name}
                  </div>
                )}
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  最大ファイルサイズ: 5MB
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sheetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>出力シート名（オプション）</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="空欄の場合は最初のシートを使用"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Excelファイル内のシート名を指定します。空欄の場合は最初のシートが使用されます。
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t pt-4">
            <FieldMappingEditor
              fieldMappings={fieldMappings}
              onChange={(newMappings) =>
                form.setValue("fieldMappings", newMappings)
              }
              onBlur={validateFieldMapping}
              errors={fieldMappingErrors}
            />
          </div>
        </div>

        <DialogFooter sticky className="p-6">
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
        </DialogFooter>
      </form>
    </Form>
  );
}
