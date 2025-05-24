import { SessionProvider } from "next-auth/react";

import { auth } from "@/features/auth/lib/auth";
import { getSubscriptionInfo } from "@/features/subscription/actions/get-subscription-info";

import Navbar from "./_components/navbar";
import { SubscriptionCheckWrapper } from "./_components/subscription-check-wrapper";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const subscriptionInfo = await getSubscriptionInfo();

  return (
    <SessionProvider session={session}>
      <Navbar />
      <main className="mx-4 my-6 flex items-center justify-center lg:mt-20">
        {subscriptionInfo ? (
          <SubscriptionCheckWrapper subscriptionInfo={subscriptionInfo}>
            {children}
          </SubscriptionCheckWrapper>
        ) : (
          children
        )}
      </main>
    </SessionProvider>
  );
}
