"use client";

import { Copy, Check, HelpCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AVAILABLE_PLACEHOLDERS } from "@/features/work-report/utils/placeholder-utils";

interface PlaceholderHelpProps {
  onInsert?: (placeholder: string) => void;
}

export function PlaceholderHelp({ onInsert }: PlaceholderHelpProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleCopy = async (key: string) => {
    const placeholder = `\${${key}}`;
    await navigator.clipboard.writeText(placeholder);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);

    if (onInsert) {
      onInsert(placeholder);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <HelpCircle className="mr-1 size-4" />
          プレースホルダー
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-[95vw] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>利用可能なプレースホルダー</DialogTitle>
          <DialogDescription>
            クリックしてコピー。値に挿入すると動的に置換されます。
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[calc(85vh-8rem)] flex-col overflow-hidden">
          <div className="overflow-y-auto overscroll-contain">
            <div className="space-y-3 pr-2">
              {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
                <button
                  key={placeholder.key}
                  type="button"
                  onClick={() => handleCopy(placeholder.key)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <code className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 font-mono text-xs font-medium">
                          {`\${${placeholder.key}}`}
                          {copiedKey === placeholder.key ? (
                            <Check className="size-3 text-green-500" />
                          ) : (
                            <Copy className="size-3 text-muted-foreground" />
                          )}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {placeholder.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        例: {placeholder.example}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              使用例: <code className="bg-muted px-1">{`\${作業者名}様`}</code> →
              &quot;山田太郎様&quot;
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
