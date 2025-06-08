import NextAuth from "next-auth";

import authConfig from "@/features/auth/lib/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/app/routes";

const { auth } = NextAuth(authConfig);

console.log("Middleware file is being loaded");

export default auth(async (req) => {
  console.log("=== Middleware Execution Start ===");
  console.log("Request URL:", req.nextUrl.toString());
  console.log("Request Method:", req.method);
  console.log("Request Headers:", Object.fromEntries(req.headers.entries()));
  
  const { nextUrl } = req;
  console.log("Middleware executing for path:", nextUrl.pathname);
  console.log("Is authorized:", !!req.auth);
  console.log("Is API auth route:", nextUrl.pathname.startsWith(apiAuthPrefix));
  console.log("Is public route:", publicRoutes.includes(nextUrl.pathname));
  console.log("Is auth route:", authRoutes.includes(nextUrl.pathname));

  const isAuthorized = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    console.log("Skipping middleware for API auth route");
    return;
  }

  if (isAuthorized) {
    if (isAuthRoute) {
      console.log("Redirecting authorized user from auth route");
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isAuthorized && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;

    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    console.log("Redirecting unauthorized user to login with callback:", callbackUrl);

    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl),
    );
  }

  console.log("=== Middleware Execution End ===");
  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 