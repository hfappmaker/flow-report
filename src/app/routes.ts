
export const errorRoutes: string[] = [
  "/global-error",
  "/not-found",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /dashboard
 */
export const authRoutes: string[] = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
  "/auth/new-verification"
];

/**
 * An array of routes that are accessible to authenticated users
 * These routes require authentication
 */
// export const privateRoutes = [""]; All routes are private by default, is defined the middleware.ts

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes. They are available to the public.
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The prefix for API webhook routes
 * Routes that start with this prefix are used for webhook endpoints. They are available to the public.
 */
export const apiWebhookPrefix = "/api/webhook";

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
