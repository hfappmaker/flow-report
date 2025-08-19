"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { GrGoogle } from "react-icons/gr";

import { DEFAULT_LOGIN_REDIRECT } from "@/app/routes";
import { Button } from "@/components/ui/button";

const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = (provider: "google" | "github") => {
    void signIn(provider, {
      redirectTo: callbackUrl ?? DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <div className="flex w-full items-center gap-x-2">
      <Button
        size="lg"
        className="w-full text-xl hover:bg-sky-400 hover:text-background"
        variant="outline"
        onClick={() => {
          onClick("google");
        }}
      >
        <GrGoogle />
      </Button>
      <Button
        size="lg"
        className="w-full text-2xl hover:bg-sky-400 hover:text-background"
        variant="outline"
        onClick={() => {
          onClick("github");
        }}
      >
        <FaGithub />
      </Button>
    </div>
  );
};

export default Social;
