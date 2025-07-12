'use client'

import { useState } from "react";
import { signIn } from "next-auth/react";
import { BsCalendarCheck } from "react-icons/bs";
import { GrGoogle } from "react-icons/gr";

import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: DEFAULT_LOGIN_REDIRECT,
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (testUserEmail: string, testUserPassword: string) => {
    setEmail(testUserEmail);
    setPassword(testUserPassword);
  };

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-y-4 rounded-md border-2 p-6 w-full max-w-md">
        <div className="flex items-center justify-center gap-x-2">
          <BsCalendarCheck className="text-3xl text-sky-400" />
          <h1 className="text-3xl font-semibold text-primary drop-shadow-md">
            勤怠管理システム
          </h1>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 w-full">
          <p className="text-sm text-yellow-800 text-center">
            テスト環境 - 開発用ログイン
          </p>
        </div>

        <form onSubmit={handleTestLogin} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "テストログイン"}
          </Button>
        </form>

        <div className="w-full space-y-2">
          <p className="text-sm text-gray-600 text-center">クイックログイン</p>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin("loadtest1@example.com", "LoadTest123!")}
            >
              テストユーザー1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin("loadtest2@example.com", "LoadTest123!")}
            >
              テストユーザー2
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin("loadtest3@example.com", "LoadTest123!")}
            >
              テストユーザー3
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}