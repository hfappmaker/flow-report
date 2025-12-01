"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AVAILABLE_PLACEHOLDERS } from "@/features/work-report/utils/placeholder-utils";

interface PlaceholderHelpProps {
  onInsert: (placeholder: string) => void;
}

export function PlaceholderHelp({ onInsert }: PlaceholderHelpProps) {
  const [open, setOpen] = useState(false);

  const handleInsert = (key: string) => {
    const placeholder = `\${${key}}`;
    onInsert(placeholder);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          type="button"
          className="shrink-0"
        >
          <HelpCircle className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96" align="start">
        <div className="space-y-2">
          <h4 className="font-medium">利用可能なプレースホルダー</h4>
          <p className="text-sm text-muted-foreground">
            クリックして挿入。値に挿入すると動的に置換されます。
          </p>
          <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
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
                        onClick={() => { handleInsert(placeholder.key); }}
                        className="rounded bg-muted px-2 py-1 font-mono text-xs hover:bg-muted/80"
                      >
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
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground">
              例: <code className="bg-muted px-1">{`\${作業者名}様`}</code> →
              &quot;山田太郎様&quot;
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
