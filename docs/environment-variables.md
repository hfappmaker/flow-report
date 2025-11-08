# Environment Variables Configuration

This document explains how environment variables work in this application, particularly with Vercel deployments.

## Application URL Configuration

The application URL is now automatically determined based on the deployment environment using Vercel's built-in environment variables, following the official [Vercel documentation](https://vercel.com/docs/environment-variables/framework-environment-variables).

### How It Works

The application uses a centralized utility function (`src/utils/get-app-url.ts`) that automatically determines the correct URL based on the environment:

1. **Production Environment** (`NEXT_PUBLIC_VERCEL_ENV === 'production'`)
   - Primary: Uses `NEXT_PUBLIC_APP_URL` (your custom domain)
   - Fallback 1: Uses `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` (Vercel's production domain)
   - Fallback 2: Uses `NEXT_PUBLIC_VERCEL_URL` (deployment URL)
   - Example: `https://yourdomain.com`

2. **Preview Environment** (`NEXT_PUBLIC_VERCEL_ENV === 'preview'`)
   - Primary: Uses `NEXT_PUBLIC_VERCEL_BRANCH_URL` (branch-specific URL)
   - Fallback: Uses `NEXT_PUBLIC_VERCEL_URL` (general preview URL)
   - No manual configuration needed
   - Format: `https://{branch}-git-{project}.vercel.app`

3. **Development Environment**
   - Falls back to `http://localhost:3000`
   - Or uses `NEXT_PUBLIC_APP_URL` if provided

### Vercel's Automatic Environment Variables

Vercel automatically provides these environment variables during deployments (based on [official docs](https://vercel.com/docs/environment-variables/framework-environment-variables)):

#### Server-side Variables
- `VERCEL_ENV`: The environment type (`production`, `preview`, or `development`)
- `VERCEL_URL`: The deployment URL without protocol
- `VERCEL_PROJECT_PRODUCTION_URL`: Production domain (available in all environments)
- `VERCEL_BRANCH_URL`: Git branch-specific URL
- `VERCEL_GIT_*`: Git information (provider, repo, commit details)

#### Client-side Variables (NEXT_PUBLIC_ prefix)
- `NEXT_PUBLIC_VERCEL_ENV`: The environment type
- `NEXT_PUBLIC_VERCEL_URL`: The deployment URL without protocol
- `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`: Production domain (useful for OG images)
- `NEXT_PUBLIC_VERCEL_BRANCH_URL`: Git branch-specific URL
- `NEXT_PUBLIC_VERCEL_GIT_*`: Git information accessible in browser

### Configuration Requirements

#### Production Deployment
Set your production domains:
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_AUTH_URL=https://yourdomain.com  # Optional: defaults to NEXT_PUBLIC_APP_URL
```

#### Preview Deployments
No configuration needed! The application automatically uses Vercel's preview URL.

#### Local Development
Optional: Set custom URLs if not using localhost:3000:
```
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=http://localhost:3001  # Optional: defaults to NEXT_PUBLIC_APP_URL
```

#### Legacy Support
If you have existing `AUTH_URL` configured, it will still work (backward compatibility):
```
AUTH_URL=https://yourdomain.com  # Deprecated but still supported
```

### Usage in Code

To get the application URL in your code:

```typescript
import {
  getAppUrl,
  getClientAppUrl,
  getAuthUrl,
  getProductionUrl,
  isProduction,
  isPreview,
  isDevelopment
} from '@/utils/get-app-url';

// Server-side usage
const url = getAppUrl();

// Server-side with production URL for OG images (even in preview)
const ogImageUrl = getAppUrl({ useProductionUrl: true });

// Authentication URL for OAuth callbacks
const authUrl = getAuthUrl();

// OAuth redirect URI
const redirectUri = `${getAuthUrl()}/api/auth/callback`;

// Client-side usage
const url = getClientAppUrl();

// Client-side with production URL for canonical links
const canonicalUrl = getClientAppUrl({ useProductionUrl: true });

// Get production URL directly (returns null if not configured)
const prodUrl = getProductionUrl();

// Check environment
if (isProduction()) {
  // Production-specific code
}
if (isPreview()) {
  // Preview-specific code
}
if (isDevelopment()) {
  // Development-specific code
}
```

### Benefits

1. **Zero Configuration for Previews**: No need to manually set URLs for preview deployments
2. **Environment-Aware**: Automatically adapts to the deployment context
3. **Type-Safe**: Full TypeScript support with environment type definitions
4. **Centralized Logic**: Single source of truth for URL determination
5. **Backward Compatible**: Existing `NEXT_PUBLIC_APP_URL` configurations continue to work

### Affected Features

The following features now use dynamic URL configuration:
- Stripe checkout sessions
- Stripe customer portal sessions
- Email verification links
- Password reset links
- OAuth authentication callbacks (freee API integration)
- Playwright E2E tests

### Migration Guide

If you're upgrading from a static `NEXT_PUBLIC_APP_URL` configuration:

1. **Production**: Keep your `NEXT_PUBLIC_APP_URL` setting as-is
2. **Preview/Staging**: Remove `NEXT_PUBLIC_APP_URL` from preview environment variables
3. **Local Development**: Optional - remove unless using a non-standard port

The application will automatically use the appropriate URL based on the environment.