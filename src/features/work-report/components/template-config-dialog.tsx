"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Edit2, FileSpreadsheet, Plus, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTemplateConfigAction,
  deleteTemplateConfigAction,
  getTemplateConfigAction,
  getTemplateConfigsAction,
  updateTemplateConfigAction,
} from "@/features/work-report/actions/work-report-template-config";
import {
  DEFAULT_FIELD_MAPPING,
  TEMPLATE_FIELD_DEFINITIONS,
  type TemplateConfigListItem,
  type TemplateFieldMapping,
} from "@/features/work-report/types/work-report-template-config";

interface TemplateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogMode = "list" | "create" | "edit";

export function TemplateConfigDialog({
  open,
  onOpenChange,
}: TemplateConfigDialogProps) {
  const [mode, setMode] = useState<DialogMode>("list");
  const [configs, setConfigs] = useState<TemplateConfigListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Edit form state
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFileName, setFormFileName] = useState("");
  const [formFieldMapping, setFormFieldMapping] =
    useState<TemplateFieldMapping>({ ...DEFAULT_FIELD_MAPPING });
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getTemplateConfigsAction();
      setConfigs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "設定の読み込みに失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadConfigs();
      setMode("list");
    }
  }, [open, loadConfigs]);

  const handleCreate = () => {
    setEditingConfigId(null);
    setFormName("");
    setFormFile(null);
    setFormFileName("");
    setFormFieldMapping({ ...DEFAULT_FIELD_MAPPING });
    setMode("create");
  };

  const handleEdit = async (configId: string) => {
    try {
      setIsLoading(true);
      setError("");
      const config = await getTemplateConfigAction(configId);
      if (!config) {
        setError("設定が見つかりません");
        return;
      }

      setEditingConfigId(configId);
      setFormName(config.name);
      setFormFile(null);
      setFormFileName(config.templateFileName);
      setFormFieldMapping(config.fieldMapping);
      setMode("edit");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "設定の読み込みに失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!window.confirm("このテンプレート設定を削除しますか？")) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await deleteTemplateConfigAction(configId);
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) {
      setFormFile(null);
      return;
    }

    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setError(
        "ファイル形式が正しくありません。.xlsxファイルを選択してください。",
      );
      setFormFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。",
      );
      setFormFile(null);
      return;
    }

    setFormFile(file);
    setFormFileName(file.name);
  };

  const handleFieldMappingChange = (
    key: keyof TemplateFieldMapping,
    value: string,
  ) => {
    setFormFieldMapping((prev) => ({
      ...prev,
      [key]: value || null,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      if (!formName.trim()) {
        setError("テンプレート名を入力してください");
        return;
      }

      if (mode === "create" && !formFile) {
        setError("テンプレートファイルをアップロードしてください");
        return;
      }

      let templateFileBase64: string | undefined;

      if (formFile) {
        const buffer = await formFile.arrayBuffer();
        templateFileBase64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );
      }

      if (mode === "create") {
        await createTemplateConfigAction({
          name: formName.trim(),
          templateFile: templateFileBase64!,
          templateFileName: formFileName,
          fieldMapping: formFieldMapping,
        });
      } else if (editingConfigId) {
        const updateData: {
          name?: string;
          templateFile?: string;
          templateFileName?: string;
          fieldMapping?: Partial<TemplateFieldMapping>;
        } = {
          name: formName.trim(),
          fieldMapping: formFieldMapping,
        };

        if (templateFileBase64) {
          updateData.templateFile = templateFileBase64;
          updateData.templateFileName = formFileName;
        }

        await updateTemplateConfigAction(editingConfigId, updateData);
      }

      await loadConfigs();
      setMode("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setMode("list");
    setError("");
  };

  const renderListMode = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          カスタムテンプレート設定
        </DialogTitle>
        <DialogDescription>
          作業報告書のカスタムテンプレートを管理します。名前付き範囲のマッピングを設定できます。
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">読み込み中...</div>
        ) : configs.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            カスタムテンプレート設定がありません
          </div>
        ) : (
          <div className="space-y-2">
            {configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-gray-500">
                      {config.templateFileName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(config.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(config.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          閉じる
        </Button>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </DialogFooter>
    </>
  );

  const renderEditMode = () => (
    <>
      <DialogHeader>
        <DialogTitle>
          {mode === "create"
            ? "新しいテンプレート設定"
            : "テンプレート設定の編集"}
        </DialogTitle>
        <DialogDescription>
          テンプレートファイルと名前付き範囲のマッピングを設定します。
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] space-y-6 overflow-y-auto py-4">
        {/* 基本情報 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">テンプレート名 *</Label>
            <Input
              id="template-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="例: 会社A向けテンプレート"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-file">
              テンプレートファイル (.xlsx){" "}
              {mode === "create" ? "*" : "(変更する場合のみ)"}
            </Label>
            {mode === "edit" && formFileName && !formFile && (
              <div className="mb-2 flex items-center gap-2 rounded-md bg-gray-50 p-2 text-sm text-gray-600">
                <FileSpreadsheet className="h-4 w-4" />
                現在のファイル: {formFileName}
              </div>
            )}
            <Input
              id="template-file"
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {formFile && (
              <p className="text-sm text-green-600">選択: {formFile.name}</p>
            )}
          </div>
        </div>

        {/* ヘッダー系フィールドマッピング */}
        <div className="space-y-3">
          <h3 className="font-medium">ヘッダー項目の名前付き範囲</h3>
          <p className="text-sm text-gray-500">
            Excelテンプレートで定義した名前付き範囲名を入力してください。空欄の場合はその項目が出力されません。
          </p>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATE_FIELD_DEFINITIONS.header.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`field-${field.key}`} className="text-sm">
                  {field.label}
                </Label>
                <Input
                  id={`field-${field.key}`}
                  value={
                    formFieldMapping[field.key as keyof TemplateFieldMapping] ??
                    ""
                  }
                  onChange={(e) =>
                    handleFieldMappingChange(
                      field.key as keyof TemplateFieldMapping,
                      e.target.value,
                    )
                  }
                  placeholder={field.defaultValue}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </div>

        {/* フォームデータ系フィールドマッピング */}
        <div className="space-y-3">
          <h3 className="font-medium">勤怠データの名前付き範囲（31行分）</h3>
          <p className="text-sm text-gray-500">
            日々の勤怠データを入力する範囲です。縦に31セル分の範囲を指定してください。
          </p>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATE_FIELD_DEFINITIONS.form.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`field-${field.key}`} className="text-sm">
                  {field.label}
                </Label>
                <Input
                  id={`field-${field.key}`}
                  value={
                    formFieldMapping[field.key as keyof TemplateFieldMapping] ??
                    ""
                  }
                  onChange={(e) =>
                    handleFieldMappingChange(
                      field.key as keyof TemplateFieldMapping,
                      e.target.value,
                    )
                  }
                  placeholder={field.defaultValue}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleBack} disabled={isSaving}>
          戻る
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {mode === "list" ? renderListMode() : renderEditMode()}
      </DialogContent>
    </Dialog>
  );
}
