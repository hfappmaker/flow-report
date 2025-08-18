"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="mb-4 text-6xl font-bold text-red-600">500</h1>
            <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
              予期しないエラーが発生しました
            </h2>
            <p className="mb-8 text-muted-foreground">
              申し訳ございません。システムエラーが発生しました。
              <br />
              問題が解決されない場合は、管理者にお問い合わせください。
            </p>
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
