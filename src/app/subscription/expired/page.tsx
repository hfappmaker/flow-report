import { SubscriptionPromptButton } from "@/app/subscription/expired/subscription-prompt-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionExpiredPage() {

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">プレミアムプランが期限切れになりました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-2 font-semibold">プレミアムプランの特徴</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ 全機能への無制限アクセス</li>
              <li>✓ 月額500円（税込）</li>
              <li>✓ いつでもキャンセル可能</li>
              <li>✓ 安心の決済システム</li>
            </ul>
          </div>
          <CardDescription>
            プレミアムプランの利用期限が切れています。サービスを継続してご利用いただくには、プランを再開してください。
          </CardDescription>
        </CardContent>
        <CardFooter>
          <SubscriptionPromptButton />
        </CardFooter>
      </Card>
    </div>
  );
} 