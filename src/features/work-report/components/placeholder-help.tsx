"use client";

import { Check, Copy, HelpCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <HelpCircle className="mr-1 size-4" />
          プレースホルダー一覧
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>利用可能なプレースホルダー</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          クリックでコピーできます。値に貼り付けると動的に置換されます。
        </p>
        <div className="max-h-[60vh] touch-pan-y overflow-y-auto overscroll-contain">
          <table className="w-full text-sm">
            <thead>
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
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => {
                        void handleCopy(placeholder.key);
                      }}
                      className="flex items-center gap-1 rounded bg-muted px-2 py-1 font-mono text-xs hover:bg-muted/80"
                    >
                      {copiedKey === placeholder.key ? (
                        <Check className="size-3 text-green-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      {`\${${placeholder.key}}`}
                    </button>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {placeholder.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DialogFooter className="flex-col gap-2 border-t pt-4 sm:flex-col">
          <p className="text-xs text-muted-foreground">
            例: <code className="bg-muted px-1">{`\${作業者名}様`}</code> →
            &quot;山田太郎様&quot;
          </p>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              閉じる
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
