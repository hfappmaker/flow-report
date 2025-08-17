"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fixCanceledSubscription } from "@/features/subscription/actions/fix-canceled-subscription";

const TestPageClient = () => {
  const [isPending, startTransition] = useTransition();

  const handleFixSubscription = () => {
    startTransition(async () => {
      await fixCanceledSubscription().then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.success) {
          toast.success(data.success);
          // ページをリロードして最新の状態を反映
          window.location.reload();
        }
      });
    });
  };

  const handleAIGenerate = () => {
    startTransition(async () => {
      try {
        const { generateWithAI } = await import("@/features/ai/lib/ai");

        const payload = {
          method: "create-work-time",
          prompt: "9:00 AM to 6:00 PM on weekdays",
        };

        const result = await generateWithAI(payload);

        if (!result.success) {
          toast.error(result.error ?? "AI generation error");
          return;
        }

        const content = result.data
          ? JSON.stringify(result.data, null, 2)
          : "No content";
        toast.success("AI generation completed");
        console.log("AI response:", content);
      } catch (error: unknown) {
        console.log(
          "AI generation failed:" +
            (error instanceof Error ? error.message : String(error)),
        );
        toast.error(
          "AI generation failed: " +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">サブスクリプション修正テスト</h1>

      <div className="space-y-4">
        <p className="text-gray-600">
          キャンセル済みサブスクリプションの期間終了日を修正します。
        </p>

        <Button
          onClick={handleFixSubscription}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? "修正中..." : "サブスクリプション期間を修正"}
        </Button>

        <Button
          onClick={handleAIGenerate}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {isPending ? "生成中..." : "AIで勤務時間生成"}
        </Button>
      </div>
    </div>
  );
};

export default TestPageClient;
