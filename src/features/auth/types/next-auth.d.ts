import type { UserRole } from "@prisma/client";
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    isTwoFactorEnabled?: boolean;
    isOAuth?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    isTwoFactorEnabled?: boolean;
    isOAuth?: boolean;
  }
}
