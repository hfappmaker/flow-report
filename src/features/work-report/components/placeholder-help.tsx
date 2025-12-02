"use client";

import { Check, Copy, HelpCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AVAILABLE_PLACEHOLDERS } from "@/features/work-report/utils/placeholder-utils";

export function PlaceholderHelp() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string) => {
    const placeholder = `\${${key}}`;
    await navigator.clipboard.writeText(placeholder);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <HelpCircle className="mr-1 size-4" />
          プレースホルダー
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 pb-2">
          <h4 className="font-medium leading-none">
            利用可能なプレースホルダー
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            クリックでコピーできます
          </p>
        </div>
        <div
          className="max-h-[300px] overflow-y-auto overscroll-contain px-4"
          onWheel={(e) => e.stopPropagation()}
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-popover">
              <tr className="border-b">
                <th className="pb-2 text-left font-medium">
                  プレースホルダー
                </th>
                <th className="pb-2 text-left font-medium">説明</th>
              </tr>
            </thead>
            <tbody>
              {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
                <tr
                  key={placeholder.key}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleCopy(placeholder.key);
                      }}
                      className="flex items-center gap-1 rounded bg-muted px-2 py-1 font-mono text-xs hover:bg-muted/80"
                    >
                      {`\${${placeholder.key}}`}
                      {copiedKey === placeholder.key ? (
                        <Check className="size-3 text-green-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {placeholder.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t p-4 pt-2">
          <p className="text-xs text-muted-foreground">
            例: <code className="bg-muted px-1">{`\${作業者名}様`}</code> →
            &quot;山田太郎様&quot;
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
