"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { createCheckoutSession } from "@/features/subscription/actions/create-checkout-session";
import { SubscriptionInfo } from "@/features/subscription/types/subscription";

type SubscriptionPromptProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscriptionInfo: SubscriptionInfo;
    forceOpen?: boolean;
};

export function SubscriptionPrompt({
    open,
    onOpenChange,
    subscriptionInfo,
    forceOpen = false
}: SubscriptionPromptProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await createCheckoutSession();

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.url) {
                window.location.href = result.url;
            }
        } catch (error) {
            console.error("Subscription error:", error);
            setError("エラーが発生しました。もう一度お試しください。");
        } finally {
            setIsLoading(false);
        }
    };

    const getDialogContent = () => {
        if (!subscriptionInfo.hasUsedTrial) {
            return {
                title: "プレミアムプランを始めましょう",
                description: "30日間の無料トライアルをお試しください。クレジットカードの登録が必要ですが、トライアル期間中は課金されません。いつでもキャンセル可能です。",
                buttonText: "無料トライアルを開始",
            };
        } else {
            return {
                title: "プレミアムプランに登録",
                description: "月額500円で全ての機能をご利用いただけます。クレジットカードの登録が必要です。",
                buttonText: "プレミアムプランに登録",
            };
        }
    };

    const { title, description, buttonText } = getDialogContent();

    return (
        <Dialog open={open} onOpenChange={forceOpen ? undefined : onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                        <h4 className="mb-2 font-semibold">プレミアムプランに含まれる機能:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>✓ 全ての機能への無制限アクセス</li>
                            <li>✓ 優先サポート</li>
                            <li>✓ データの自動バックアップ</li>
                            <li>✓ 高度なレポート機能</li>
                        </ul>
                    </div>

                    {!subscriptionInfo.hasUsedTrial && (
                        <div className="rounded-lg bg-blue-50 p-3 text-sm">
                            <p className="text-blue-900">
                                <strong>特別オファー:</strong> 今なら30日間無料でお試しいただけます。
                                クレジットカードの登録は必要ですが、トライアル期間中はいつでもキャンセル可能です。
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm">
                            <p className="text-red-900">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "処理中..." : buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 