import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">
          ページが見つかりません
        </h2>
        <p className="mb-8 text-muted-foreground">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link href="/">
          <Button>ホームに戻る</Button>
        </Link>
      </div>
    </div>
  );
}
