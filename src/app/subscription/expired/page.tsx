import { SubscriptionPromptButton } from "@/app/subscription/expired/subscription-prompt-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";


export default async function SubscriptionExpiredPage() {
  const subscriptionInfo = await getSubscriptionInfo();

  if (!subscriptionInfo) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">トライアル期間が終了しました</CardTitle>
          <CardDescription>
            30日間の無料トライアル期間が終了しました。
            引き続きサービスをご利用いただくには、プレミアムプランへの登録が必要です。
          </CardDescription>
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
        </CardContent>
        <CardFooter>
          <SubscriptionPromptButton subscriptionInfo={subscriptionInfo} />
        </CardFooter>
      </Card>
    </div>
  );
} 