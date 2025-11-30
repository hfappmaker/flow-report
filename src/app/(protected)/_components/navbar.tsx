"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MdMenu } from "react-icons/md";

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

const Navbar = () => {
  const { startTransition } = useTransitionContext();
  const router = useRouter();
  const pathName = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <>
      <nav className="fixed top-0 hidden h-14 w-full items-center justify-between bg-secondary p-4 shadow-md lg:flex">
        <div className="flex items-center gap-x-4">
          <Image
            src="/flow-report.png"
            alt="Flow Report"
            width={140}
            height={30}
            priority
            className="shrink-0"
          />
          <div className="flex gap-x-2">
            {NAV_LINKS.map((link, index) => (
              <Button
                key={index}
                asChild
                variant={pathName === link.path ? "default" : "outline"}
                className="w-full hover:bg-sky-400 hover:text-primary-foreground"
              >
                <Link
                  role="link"
                  href={link.path}
                  onClick={() => {
                    handleNavigation(link.path);
                  }}
                >
                  {link.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </nav>

      <nav className="flex items-center justify-between bg-secondary p-4 shadow-md lg:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="w-full text-sky-400 hover:text-background"
            >
              <MdMenu />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="sr-only">
                ナビゲーションメニュー
              </SheetTitle>
            </SheetHeader>
            <div className="mb-6 flex justify-center">
              <Image
                src="/flow-report.png"
                alt="Flow Report"
                width={180}
                height={39}
                priority
              />
            </div>
            <div className="flex-col p-2">
              {NAV_LINKS.map((link, index) => (
                <Button
                  key={index}
                  asChild
                  variant={pathName === link.path ? "default" : "outline"}
                  className="my-2 w-full hover:bg-sky-400 hover:text-primary-foreground"
                >
                  <Link
                    role="link"
                    href={link.path}
                    onClick={() => {
                      handleNavigation(link.path);
                    }}
                  >
                    {link.title}
                  </Link>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-x-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </nav>
    </>
  );
};
export default Navbar;
