"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdMenu } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTransitionContext } from "@/contexts/transition-context";
import UserButton from "@/features/auth/components/user-button";

import { NAV_LINKS } from "../_constants";

const Navbar = () => {
  const { startTransition } = useTransitionContext();
  const router = useRouter();
  const pathName = usePathname();

  const handleNavigation = (path: string) => {
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <>
      <nav className="fixed top-0 hidden h-14 w-full items-center justify-between bg-secondary p-4 shadow-md lg:flex">
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
        <UserButton />
      </nav>

      <nav className="flex items-center justify-between bg-secondary p-4 shadow-md lg:hidden">
        <Sheet>
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

        <UserButton />
      </nav>
    </>
  );
};
export default Navbar;
