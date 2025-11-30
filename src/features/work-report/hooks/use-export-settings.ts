"use client";

import { useCallback, useEffect, useState } from "react";

import {
  EXPORT_SETTINGS_KEY,
  type ExportSettings,
} from "@/features/work-report/types/export-types";

const DEFAULT_SETTINGS: ExportSettings = {
  workReportTemplateId: null,
  invoiceTemplateId: null,
};

/**
 * エクスポート設定のlocalStorage保存・読み込みフック
 */
export function useExportSettings() {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorageから設定を読み込む
  useEffect(() => {
    try {
      const stored = localStorage.getItem(EXPORT_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ExportSettings>;
        setSettings({
          workReportTemplateId: parsed.workReportTemplateId ?? null,
          invoiceTemplateId: parsed.invoiceTemplateId ?? null,
        });
      }
    } catch (error) {
      console.error("Failed to load export settings from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // 設定を更新してlocalStorageに保存
  const updateSettings = useCallback(
    (newSettings: Partial<ExportSettings>) => {
      const updated: ExportSettings = {
        ...settings,
        ...newSettings,
      };
      setSettings(updated);
      try {
        localStorage.setItem(EXPORT_SETTINGS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save export settings to localStorage:", error);
      }
    },
    [settings],
  );

  // 作業報告書テンプレートIDを更新
  const setWorkReportTemplateId = useCallback(
    (templateId: string | null) => {
      updateSettings({ workReportTemplateId: templateId });
    },
    [updateSettings],
  );

  // 請求書テンプレートIDを更新
  const setInvoiceTemplateId = useCallback(
    (templateId: string | null) => {
      updateSettings({ invoiceTemplateId: templateId });
    },
    [updateSettings],
  );

  return {
    settings,
    isLoaded,
    setWorkReportTemplateId,
    setInvoiceTemplateId,
  };
}
