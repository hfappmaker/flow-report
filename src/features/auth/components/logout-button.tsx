"use client";

import { useRouter } from "next/navigation";

import { useTransitionContext } from "@/contexts/transition-context";
import { logout } from "@/features/auth/actions/logout";

const LogoutButton = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { startTransition } = useTransitionContext();

  const handleLogout = async () => {
    startTransition(async () => {
      await logout();
      router.push("/auth/login");
      router.refresh();
    });
  };

  return (
    <span onClick={handleLogout} className="cursor-pointer">
      {children}
    </span>
  );
};

export default LogoutButton;
