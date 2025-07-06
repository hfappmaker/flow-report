import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          ページが見つかりません
        </h2>
        <p className="mb-8 text-gray-500">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <Link href="/">
          <Button>ホームに戻る</Button>
        </Link>
      </div>
    </div>
  );
}