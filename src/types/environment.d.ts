/**
 * Vercel Environment Variables Type Definitions
 *
 * These variables are automatically provided by Vercel during deployments.
 * Reference: https://vercel.com/docs/environment-variables/framework-environment-variables
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Custom application URLs (used in production)
      NEXT_PUBLIC_APP_URL?: string;
      NEXT_PUBLIC_AUTH_URL?: string; // Custom auth URL for OAuth callbacks

      // === Server-side only Vercel variables ===
      VERCEL_ENV?: 'production' | 'preview' | 'development';
      VERCEL_TARGET_ENV?: string; // Can be production, preview, development, or custom name
      VERCEL_URL?: string; // The domain without protocol (e.g., xxx.vercel.app)
      VERCEL_PROJECT_PRODUCTION_URL?: string; // Production domain (available in all environments)
      VERCEL_BRANCH_URL?: string; // Git branch-specific URL (*-git-*.vercel.app)
      VERCEL_DEPLOYMENT_ID?: string; // Unique identifier for the deployment
      VERCEL_PROJECT_ID?: string; // The ID of the Vercel project
      VERCEL_TEAM_ID?: string; // The ID of the Vercel team (if applicable)

      // === Client-side accessible (NEXT_PUBLIC_ prefix) ===
      NEXT_PUBLIC_VERCEL_ENV?: 'production' | 'preview' | 'development';
      NEXT_PUBLIC_VERCEL_TARGET_ENV?: string;
      NEXT_PUBLIC_VERCEL_URL?: string; // The domain without protocol (e.g., xxx.vercel.app)
      NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?: string; // Production domain (useful for OG images)
      NEXT_PUBLIC_VERCEL_BRANCH_URL?: string; // Git branch-specific URL

      // === Git Information (server-side) ===
      VERCEL_GIT_PROVIDER?: string; // e.g., github, gitlab, bitbucket
      VERCEL_GIT_REPO_SLUG?: string; // Repository name
      VERCEL_GIT_REPO_OWNER?: string; // Account/organization name
      VERCEL_GIT_REPO_ID?: string; // Repository ID
      VERCEL_GIT_COMMIT_REF?: string; // The git branch that triggered the deployment
      VERCEL_GIT_COMMIT_SHA?: string; // The git SHA of the commit
      VERCEL_GIT_COMMIT_MESSAGE?: string; // The commit message
      VERCEL_GIT_COMMIT_AUTHOR_LOGIN?: string; // The username of the commit author
      VERCEL_GIT_COMMIT_AUTHOR_NAME?: string; // The name of the commit author
      VERCEL_GIT_PULL_REQUEST_ID?: string; // PR ID if deployment is from a PR

      // === Git Information (client-side accessible) ===
      NEXT_PUBLIC_VERCEL_GIT_PROVIDER?: string;
      NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG?: string;
      NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER?: string;
      NEXT_PUBLIC_VERCEL_GIT_REPO_ID?: string;
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF?: string;
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?: string;
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE?: string;
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN?: string;
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME?: string;
      NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID?: string;

      // Next.js specific
      NODE_ENV?: 'development' | 'production' | 'test';

      // Legacy auth URL (deprecated - use NEXT_PUBLIC_AUTH_URL or getAuthUrl() instead)
      AUTH_URL?: string;
    }
  }
}

export {};