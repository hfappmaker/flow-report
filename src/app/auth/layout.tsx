import { BotIdClient } from "botid/client";

const protectedRoutes = [
  { path: "/auth/login", method: "POST" as const },
  { path: "/auth/register", method: "POST" as const },
  { path: "/auth/reset", method: "POST" as const },
  { path: "/auth/new-password", method: "POST" as const },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BotIdClient protect={protectedRoutes} />
      <div className="flex min-h-full items-center justify-center px-4 py-8">
        {children}
      </div>
    </>
  );
}
