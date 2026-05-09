import { Analytics } from "@vercel/analytics/next";
import { BotIdClient } from "botid/client";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import "./globals.css";

import ClientLayout from "./client-layout";
import { Toaster } from "@/components/ui/sonner";
import { TransitionProvider } from "@/contexts/transition-context";

const botIdProtectedRoutes = [
  { path: "/auth/login", method: "POST" as const },
  { path: "/auth/register", method: "POST" as const },
  { path: "/auth/reset", method: "POST" as const },
  { path: "/auth/new-password", method: "POST" as const },
];

export const metadata: Metadata = {
  title: {
    template: "%s | Flow Report",
    default: "Flow Report",
  },
  description: "Flow Report",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        sizes: "16x16",
        type: "image/x-icon",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <BotIdClient protect={botIdProtectedRoutes} />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayout>
            <TransitionProvider>
              {children}
              <Toaster richColors closeButton />
            </TransitionProvider>
          </ClientLayout>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
