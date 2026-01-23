import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Roboto_Mono as Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";

import ClientLayout from "./client-layout";
import { Toaster } from "@/components/ui/sonner";
import { TransitionProvider } from "@/contexts/transition-context";


const mono = Mono({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning>
      <body className={mono.className}>
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
