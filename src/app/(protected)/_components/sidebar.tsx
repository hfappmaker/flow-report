"use client";

import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { NAV_LINKS } from "../_constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTransitionContext } from "@/contexts/transition-context";
import UserButton from "@/features/auth/components/user-button";

const STORAGE_KEY = "sidebar-collapsed";

const Sidebar = () => {
  const { startTransition } = useTransitionContext();
  const router = useRouter();
  const pathName = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const handleNavigation = useCallback(
    (path: string) => {
      setIsSheetOpen(false);
      startTransition(() => {
        router.push(path);
      });
    },
    [startTransition, router],
  );

  const isActive = (path: string) => pathName === path;

  return (
    <>
      {/* デスクトップサイドバー */}
      <aside
        className="hidden h-screen flex-col border-r bg-card transition-[width] duration-200 lg:flex"
        style={{
          width: isCollapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
        }}
      >
        {/* ロゴ */}
        <div className="flex h-14 shrink-0 items-center border-b px-4">
          {isCollapsed ? (
            <div className="flex w-full justify-center">
              <Image
                src="/flow-report.png"
                alt="Flow Report"
                width={32}
                height={32}
                priority
                className="shrink-0"
              />
            </div>
          ) : (
            <Image
              src="/flow-report.png"
              alt="Flow Report"
              width={140}
              height={30}
              priority
              className="shrink-0"
            />
          )}
        </div>

        {/* ナビリンク */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(link.path);
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-l-2 border-primary bg-accent text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    title={isCollapsed ? link.title : undefined}
                  >
                    <Icon className="size-5 shrink-0" />
                    {!isCollapsed && <span>{link.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 下部エリア */}
        <div className="shrink-0 border-t px-3 py-3">
          <div
            className={`flex items-center ${isCollapsed ? "flex-col gap-2" : "justify-between"}`}
          >
            <div
              className={`flex items-center ${isCollapsed ? "flex-col gap-2" : "gap-2"}`}
            >
              <ThemeToggle />
              <UserButton />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="size-8 text-muted-foreground hover:text-foreground"
              aria-label={
                isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"
              }
            >
              {isCollapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* モバイルヘッダー */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="メニューを開く"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="border-b px-4 py-4">
              <SheetTitle className="flex items-center">
                <Image
                  src="/flow-report.png"
                  alt="Flow Report"
                  width={140}
                  height={30}
                  priority
                />
              </SheetTitle>
            </SheetHeader>
            <nav className="px-3 py-4">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <li key={link.path}>
                      <Link
                        href={link.path}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(link.path);
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "border-l-2 border-primary bg-accent text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span>{link.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-auto border-t px-4 py-3">
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Image
          src="/flow-report.png"
          alt="Flow Report"
          width={120}
          height={26}
          priority
        />

        <UserButton />
      </div>
    </>
  );
};

export default Sidebar;
