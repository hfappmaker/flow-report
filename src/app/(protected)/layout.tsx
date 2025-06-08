"use server";

import { SessionProvider } from "next-auth/react";

import { auth } from "@/features/auth/lib/auth";

import Navbar from "./_components/navbar";
import { canAccessPaidFeatures } from "@/features/subscription/utils/subscription-utils";
import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  try {
    console.log("Checking subscription for authorized user");
    const subscriptionInfo = await getSubscriptionInfo();
    
    if (subscriptionInfo) {
      const canAccess = canAccessPaidFeatures(subscriptionInfo);
      console.log("Subscription access:", canAccess);
      
      if (!canAccess) {
        console.log("Redirecting to subscription page");
        return redirect("/subscription");
      }
    }
  } catch (error) {
    console.error("Subscription check error:", error);
    throw error;
  }

  const session = await auth();

  return (
    <SessionProvider session={session}>
      <Navbar />
      <main className="mx-4 my-6 flex items-center justify-center lg:mt-20">
        {children}
      </main>
    </SessionProvider>
  );
}
