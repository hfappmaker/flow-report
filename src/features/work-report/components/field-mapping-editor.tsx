"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceholderHelp } from "@/features/work-report/components/placeholder-help";
import type { FieldMappingFormValues } from "@/features/work-report/schemas/work-report-template-form-schema";

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
    onChange([...fieldMappings, { namedRange: "", valueTemplate: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(fieldMappings.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: keyof FieldMappingFormValues,
    value: string,
  ) => {
    onChange(
      fieldMappings.map((mapping, i) =>
        i === index ? { ...mapping, [field]: value } : mapping,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <Label>フィールドマッピング</Label>

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
                <div className="flex gap-2">
                  <Input
                    id={`valueTemplate-${String(index)}`}
                    value={mapping.valueTemplate}
                    onChange={(e) => {
                      handleChange(index, "valueTemplate", e.target.value);
                    }}
                    placeholder="例: ${作業者名}様"
                    className={
                      errors?.[index]?.valueTemplate ? "border-red-500" : ""
                    }
                  />
                  <PlaceholderHelp
                    onInsert={(placeholder) => {
                      handleChange(
                        index,
                        "valueTemplate",
                        mapping.valueTemplate + placeholder,
                      );
                    }}
                  />
                </div>
                {errors?.[index]?.valueTemplate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[index].valueTemplate}
                  </p>
                )}
              </div>
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
