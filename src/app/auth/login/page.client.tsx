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
        <Link
          href="https://about.flowreport.app/terms-of-service"
          className="hover:underline"
        >
          利用規約
        </Link>
        <Link
          href="https://about.flowreport.app/privacy-policy"
          className="hover:underline"
        >
          プライバシーポリシー
        </Link>
        <Link href="https://about.flowreport.app" className="hover:underline">
          Flow Reportについて
        </Link>
      </footer>
    </main>
  );
}
