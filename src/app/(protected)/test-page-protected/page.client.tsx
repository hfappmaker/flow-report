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

  const handleollamaGenerate = () => {
    startTransition(async () => {
      try {
        const payload = {
          method: "create-work-time",
          prompt: "9:00 AM to 6:00 PM on weekdays",
        };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.error ?? "Ollama API error");
          return;
        }

        const content =
          data?.message?.content ?? JSON.stringify(data, null, 2) ?? "No content";
        toast.info(typeof content === "string" ? content : JSON.stringify(content));
        console.log("Ollama response:", content);
      } catch (error: unknown) {
        console.log("Ollama API call failed:" + (error instanceof Error ? error.message : String(error)));
        toast.error("Ollama API call failed: " + (error instanceof Error ? error.message : String(error)));
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
          onClick={handleollamaGenerate}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? "生成中..." : "Ollamaにリクエスト"}
        </Button>
      </div>
    </div>
  );
};

export default TestPageClient; 