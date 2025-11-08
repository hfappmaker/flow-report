import type { Session } from "next-auth";
import { useSession } from "next-auth/react";

export const useCurrentUser = (): Session["user"] | undefined => {
  const session = useSession();

  return session.data?.user;
};
