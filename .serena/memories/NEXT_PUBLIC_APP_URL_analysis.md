# NEXT_PUBLIC_APP_URL Usage Analysis

## Current Usage in Codebase

### Files Using NEXT_PUBLIC_APP_URL (6 files found):

1. **src/features/subscription/actions/create-checkout-session.ts** (Line 34)
   - Usage: `const baseUrl = process.env.NEXT_PUBLIC_APP_URL;`
   - Purpose: Gets app URL for Stripe checkout success/cancel URLs
   - Error handling: Throws error if not defined

2. **src/features/subscription/actions/create-customer-portal-session.ts** (Line 22)
   - Usage: `const baseUrl = process.env.NEXT_PUBLIC_APP_URL;`
   - Purpose: Gets app URL for Stripe customer portal return URL
   - Error handling: Throws error if not defined

3. **src/features/auth/lib/mail.ts** (Line 5)
   - Usage: `const domain = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";`
   - Purpose: Base URL for password reset and email verification links
   - Error handling: Falls back to localhost:3000

4. **playwright.config.ts** (Lines 26 and 80)
   - Line 26: `baseURL: process.env.NEXT_PUBLIC_APP_URL` - Used as base URL for tests
   - Line 80: `url: process.env.NEXT_PUBLIC_APP_URL` - Used for web server config

5. **git logs** (Lines found in git history)

## Vercel Environment Variables Usage

### VERCEL_ENV (Vercel built-in variable)
Used in 7 locations:
- next.config.js (Line 19) - Optimization conditionals for production
- src/repositories/db.ts - Global Prisma singleton management
- src/app/auth/login/page.tsx (Line 9) - Conditional rendering for production
- src/app/api/auth/freee/authorize/route.ts (Lines 37, 47) - Cookie secure flag based on production environment

### Other Vercel Variables
- vercel.json checks for VERCEL_GIT_COMMIT_REF to control build pipeline

## Current Environment File Structure

Files present:
- .env (empty, 0 bytes)
- .env.example (1612 bytes) - template with all env vars
- .env.development.local (3427 bytes) - development environment
- .env.preview.local (3523 bytes) - preview/staging environment

## AUTH_URL Variable
- Used in src/app/api/auth/freee/authorize/route.ts (Line 18)
- Used for building freee OAuth callback redirectUri
- Different from NEXT_PUBLIC_APP_URL

## Key Findings

1. NEXT_PUBLIC_APP_URL is critical for:
   - Stripe payment flow (checkout and portal returns)
   - Email verification links
   - Password reset links
   - Playwright test configuration

2. Error handling varies:
   - Subscription actions: Strict error handling (no fallback)
   - Email lib: Graceful fallback to localhost:3000

3. VERCEL_ENV is used for environment-specific behavior:
   - Cookie security settings
   - Webpack optimization
   - Database client singleton management
   - Conditional UI rendering

## Recommended Dynamic Configuration Strategy

Can use Vercel's built-in variables to automatically determine URL:
- VERCEL_ENV: 'production' | 'preview' | 'development'
- VERCEL_DEPLOYMENT_ID: Unique identifier for this deployment
- VERCEL_URL: Preview URL for non-production deployments (format: {branch}.{project}.vercel.app)
- VERCEL_PROJECT_ID: Project identifier
- VERCEL_GIT_COMMIT_REF: Branch name

Pattern for dynamic URL:
- Production: Use explicitly set NEXT_PUBLIC_APP_URL or custom domain
- Preview: Use VERCEL_URL automatically
- Development: Use localhost:3000