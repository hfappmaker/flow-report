"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GrGoogle } from "react-icons/gr";

import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { useTransitionContext } from "@/contexts/transition-context";

export default function LoginPage() {
  const { startTransition } = useTransitionContext();

  const handleGoogleLogin = () => {
    startTransition(async () => {
      await signIn("google", { redirectTo: DEFAULT_LOGIN_REDIRECT });
    });
  };

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-y-4 rounded-md border-2 p-4">
        <div className="flex items-center justify-center gap-x-2">
          <Image
            src="/flow-report.png"
            alt="Flow Report"
            width={200}
            height={60}
            priority
          />
        </div>
        <Button variant="outline" onClick={handleGoogleLogin}>
          <div className="flex items-center gap-x-2">
            <GrGoogle />
            <p>Googleでログイン</p>
          </div>
        </Button>
      </div>
      <footer className="absolute bottom-4 flex gap-x-4 text-sm text-muted-foreground">
        <Link href="https://about.flowreport.app/%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84" className="hover:underline">
          利用規約
        </Link>
        <Link href="https://about.flowreport.app/%E3%83%97%E3%83%A9%E3%82%A4%E3%83%90%E3%82%B7%E3%83%BC%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC" className="hover:underline">
          プライバシーポリシー
        </Link>
        <Link href="https://about.flowreport.app/flow-report%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6" className="hover:underline">
          Flow Reportについて
        </Link>
      </footer>
    </main>
  );
}
