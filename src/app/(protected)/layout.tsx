"use server";

import { SessionProvider } from "next-auth/react";

import { auth } from "@/features/auth/lib/auth";

import Navbar from "./_components/navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <Navbar />
      <main className="mx-4 my-6 flex items-center justify-between lg:mt-20">
        {children}
      </main>
    </SessionProvider>
  );
}
