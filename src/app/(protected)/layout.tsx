"use server";

import { SessionProvider } from "next-auth/react";

import { auth } from "@/features/auth/libs/auth";

import Sidebar from "./_components/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
