"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { isProduction } from "@utils/get-app-url";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // グローバルエラーをコンソールに記録
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-6xl font-bold text-red-600">500</h1>
            <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
              予期しないエラーが発生しました
            </h2>
            <p className="mb-8 text-muted-foreground">
              申し訳ございません。システムエラーが発生しました。
              <br />
              問題が解決されない場合は、管理者にお問い合わせください。
            </p>

            {!isProduction() && (
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
              <Button onClick={reset} variant="default">
                リトライ
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
              >
                ホームに戻る
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
