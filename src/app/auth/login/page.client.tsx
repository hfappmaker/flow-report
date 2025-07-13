'use client'

import { signIn } from "next-auth/react";
import { BsCalendarCheck } from "react-icons/bs";
import { GrGoogle } from "react-icons/gr";

import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-y-4 rounded-md border-2 p-4">
        <div className="flex items-center justify-center gap-x-2">
          <BsCalendarCheck className="text-3xl text-sky-400" />
          <h1 className="text-3xl font-semibold text-primary drop-shadow-md">
            勤怠管理システム
          </h1>
        </div>
        <Button variant="outline" onClick={() => signIn("google", { redirectTo: DEFAULT_LOGIN_REDIRECT })}>
          <div className="flex items-center gap-x-2">
            <GrGoogle />
            <p>Googleでログイン</p>
          </div>
        </Button>
      </div>
    </main>
  );
}