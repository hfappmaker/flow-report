"use client";

import { useRouter } from "next/navigation";

import { logout } from "@/features/auth/actions/logout";
import { useTransitionContext } from "@/contexts/transition-context";

const LogoutButton = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { startTransition } = useTransitionContext();

  const handleLogout = async () => {
    startTransition(async () => {
      await logout();
      router.push("/auth/login");
    });
  };

  return (
    <span onClick={handleLogout} className="cursor-pointer">
      {children}
    </span>
  );
};

export default LogoutButton;
