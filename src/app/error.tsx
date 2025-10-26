"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをコンソールに記録
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-red-600">Error</h1>
        <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
          エラーが発生しました
        </h2>
        <p className="mb-8 text-muted-foreground">
          申し訳ございません。予期しないエラーが発生しました。
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 rounded-lg bg-muted p-4 text-left">
            <p className="mb-2 text-sm font-semibold">エラー詳細:</p>
            <p className="text-xs text-muted-foreground">
              {error.message || "Unknown error"}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-x-4">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
