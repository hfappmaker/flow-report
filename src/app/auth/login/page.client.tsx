"use client";

import Link from "next/link";

import LoginForm from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <LoginForm />
      <footer className="absolute bottom-4 flex gap-x-4 text-sm text-muted-foreground">
        <Link
          href="https://about.flowreport.flowtech.co.jp/terms-of-service"
          className="hover:underline"
        >
          利用規約
        </Link>
        <Link
          href="https://about.flowreport.flowtech.co.jp/privacy-policy"
          className="hover:underline"
        >
          プライバシーポリシー
        </Link>
        <Link
          href="https://about.flowreport.flowtech.co.jp"
          className="hover:underline"
        >
          Flow Reportについて
        </Link>
      </footer>
    </main>
  );
}
