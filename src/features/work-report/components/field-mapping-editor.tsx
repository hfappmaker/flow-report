"use client";

import { Plus, Trash2 } from "lucide-react";
import { ValueType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceholderHelp } from "@/features/work-report/components/placeholder-help";
import {
  EXCEL_FORMAT_PRESETS,
  type FieldMappingFormValues,
} from "@/features/work-report/schemas/work-report-template-form-schema";

interface FieldMappingEditorProps {
  fieldMappings: FieldMappingFormValues[];
  onChange: (fieldMappings: FieldMappingFormValues[]) => void;
  errors?: Record<number, { namedRange?: string; valueTemplate?: string }>;
}

export function FieldMappingEditor({
  fieldMappings,
  onChange,
  errors,
}: FieldMappingEditorProps) {
  const handleAdd = () => {
    onChange([
      ...fieldMappings,
      {
        namedRange: "",
        valueTemplate: "",
        valueType: ValueType.STRING,
        numFmt: null,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(fieldMappings.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof FieldMappingFormValues,
    value: string | ValueType,
  ) => {
    onChange(
      fieldMappings.map((mapping, i) => {
        if (i !== index) return mapping;

        const updated = { ...mapping, [field]: value };

        // valueType が変更された場合、適切なデフォルト書式を設定
        if (field === "valueType") {
          if (value === ValueType.NUMBER) {
            updated.numFmt = "#,##0"; // 金額(カンマ区切り)がデフォルト
          } else {
            updated.numFmt = null;
          }
        }

        return updated;
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>フィールドマッピング</Label>
        <PlaceholderHelp />
      </div>

      <div className="space-y-3">
        {fieldMappings.map((mapping, index) => (
          <div
            key={index}
            className="flex items-start gap-2 rounded-md border p-3"
          >
            <div className="flex-1 space-y-2">
              <div>
                <Label
                  htmlFor={`namedRange-${String(index)}`}
                  className="text-xs"
                >
                  名前付き範囲
                </Label>
                <Input
                  id={`namedRange-${String(index)}`}
                  value={mapping.namedRange}
                  onChange={(e) => {
                    handleChange(index, "namedRange", e.target.value);
                  }}
                  placeholder="例: 会社名"
                  className={
                    errors?.[index]?.namedRange ? "border-red-500" : ""
                  }
                />
                {errors?.[index]?.namedRange && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[index].namedRange}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor={`valueTemplate-${String(index)}`}
                  className="text-xs"
                >
                  値（プレースホルダー使用可）
                </Label>
                <Input
                  id={`valueTemplate-${String(index)}`}
                  value={mapping.valueTemplate}
                  onChange={(e) => {
                    handleChange(index, "valueTemplate", e.target.value);
                  }}
                  placeholder="例: ${クライアント名}様"
                  className={
                    errors?.[index]?.valueTemplate ? "border-red-500" : ""
                  }
                />
                {errors?.[index]?.valueTemplate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[index].valueTemplate}
                  </p>
                )}
              </div>

              {/* 新規: 値の型選択 */}
              <div>
                <Label className="text-xs">値の型</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`valueType-${index}`}
                      checked={mapping.valueType === ValueType.NUMBER}
                      onChange={() => {
                        handleChange(index, "valueType", ValueType.NUMBER);
                      }}
                    />
                    <span className="text-sm">数値</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`valueType-${index}`}
                      checked={mapping.valueType === ValueType.STRING}
                      onChange={() => {
                        handleChange(index, "valueType", ValueType.STRING);
                      }}
                    />
                    <span className="text-sm">文字列</span>
                  </label>
                </div>
              </div>

              {/* 新規: Excel書式プリセット選択 */}
              <div>
                <Label htmlFor={`numFmt-${String(index)}`} className="text-xs">
                  Excel書式
                </Label>
                <select
                  id={`numFmt-${String(index)}`}
                  value={mapping.numFmt ?? ""}
                  onChange={(e) => {
                    handleChange(index, "numFmt", e.target.value);
                  }}
                  className="w-full rounded-md border p-2"
                >
                  {EXCEL_FORMAT_PRESETS.filter(
                    (p) => p.valueType === mapping.valueType || p.value === "",
                  ).map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 新規: カスタム書式入力 */}
              {mapping.numFmt === "" && (
                <div>
                  <Label
                    htmlFor={`customNumFmt-${String(index)}`}
                    className="text-xs"
                  >
                    カスタム書式
                  </Label>
                  <Input
                    id={`customNumFmt-${String(index)}`}
                    placeholder="例: #,##0.00"
                    value={mapping.numFmt ?? ""}
                    onChange={(e) => {
                      handleChange(index, "numFmt", e.target.value);
                    }}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Excel書式コードを入力してください
                  </p>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                handleRemove(index);
              }}
              className="mt-6 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full"
      >
        <Plus className="mr-1 size-4" />
        フィールドを追加
      </Button>

      {fieldMappings.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          フィールドマッピングがありません。追加ボタンをクリックして設定してください。
        </p>
      )}
    </div>
  );
}
