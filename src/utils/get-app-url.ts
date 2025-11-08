/**
 * Get the application URL based on the current environment
 * Automatically adapts to Vercel's deployment environments
 */

/**
 * Get the application URL for server-side usage
 * @param options - Configuration options
 * @param options.useProductionUrl - Use production URL even in preview environments (useful for OG images)
 * @returns The application URL with protocol
 * @throws Error in production if NEXT_PUBLIC_APP_URL is not set and no Vercel production URL is configured
 */
export function getAppUrl(options?: { useProductionUrl?: boolean }): string {
  const vercelEnv = process.env.VERCEL_ENV;

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url: string, forceHttps = true): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return forceHttps ? `https://${url}` : `http://${url}`;
  };

  // If useProductionUrl is true, try to get production URL (useful for OG images in preview)
  if (options?.useProductionUrl) {
    const productionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
                          process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (productionUrl) {
      return ensureProtocol(productionUrl);
    }
  }

  // Production environment - use custom domain or Vercel production URL
  if (vercelEnv === 'production') {
    // First try custom domain
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      return ensureProtocol(appUrl);
    }

    // Fallback to Vercel's production URL
    const productionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
                          process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (productionUrl) {
      return ensureProtocol(productionUrl);
    }

    // Last resort: use VERCEL_URL
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
    if (vercelUrl) {
      return ensureProtocol(vercelUrl);
    }

    throw new Error(
      'No production URL configured. Set NEXT_PUBLIC_APP_URL or configure a production domain in Vercel.'
    );
  }

  // Preview environment - use Vercel's automatic preview URL
  if (vercelEnv === 'preview') {
    // Try branch-specific URL first
    const branchUrl = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? process.env.VERCEL_BRANCH_URL;
    if (branchUrl) {
      return ensureProtocol(branchUrl);
    }

    // Fallback to general Vercel URL
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
    if (vercelUrl) {
      return ensureProtocol(vercelUrl);
    }
  }

  // Development environment or fallback
  const customUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (customUrl) {
    // In development, allow http:// for localhost
    const isLocalhost = customUrl.includes('localhost') || customUrl.includes('127.0.0.1');
    return ensureProtocol(customUrl, !isLocalhost);
  }

  // Default fallback for local development
  return 'http://localhost:3000';
}

/**
 * Get the application URL for client-side usage
 * This function can be used in React components and browser code
 * @param options - Configuration options
 * @param options.useProductionUrl - Use production URL even in preview environments (useful for OG images)
 * @returns The application URL with protocol
 */
export function getClientAppUrl(options?: { useProductionUrl?: boolean }): string {
  // In the browser, we can only access NEXT_PUBLIC_ prefixed variables
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url: string, forceHttps = true): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return forceHttps ? `https://${url}` : `http://${url}`;
  };

  // If useProductionUrl is true, try to get production URL (useful for OG images in preview)
  if (options?.useProductionUrl) {
    const productionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    if (productionUrl) {
      return ensureProtocol(productionUrl);
    }
  }

  // Production environment - use custom domain or Vercel production URL
  if (vercelEnv === 'production') {
    // First try custom domain
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      return ensureProtocol(appUrl);
    }

    // Fallback to Vercel's production URL
    const productionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
    if (productionUrl) {
      return ensureProtocol(productionUrl);
    }

    // Last resort: use VERCEL_URL
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
    if (vercelUrl) {
      return ensureProtocol(vercelUrl);
    }

    console.error(
      'No production URL configured. Set NEXT_PUBLIC_APP_URL or configure a production domain in Vercel.'
    );

    // In client-side code, fall back to current origin
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  // Preview environment - use Vercel's automatic preview URL
  if (vercelEnv === 'preview') {
    // Try branch-specific URL first
    const branchUrl = process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
    if (branchUrl) {
      return ensureProtocol(branchUrl);
    }

    // Fallback to general Vercel URL
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
    if (vercelUrl) {
      return ensureProtocol(vercelUrl);
    }
  }

  // Development environment or custom URL
  const customUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (customUrl) {
    // In development, allow http:// for localhost
    const isLocalhost = customUrl.includes('localhost') || customUrl.includes('127.0.0.1');
    return ensureProtocol(customUrl, !isLocalhost);
  }

  // Fallback: use current origin in browser or default to localhost
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

/**
 * Check if we're in a production environment
 */
export function isProduction(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  );
}

/**
 * Check if we're in a preview environment
 */
export function isPreview(): boolean {
  return (
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
  );
}

/**
 * Check if we're in a development environment
 */
export function isDevelopment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;
  return (
    vercelEnv === 'development' ||
    process.env.NODE_ENV === 'development' ||
    (!vercelEnv && !isProduction())
  );
}

/**
 * Get the production URL for the application
 * Useful for generating OG images and canonical URLs that should always point to production
 * @returns The production URL with protocol, or null if not configured
 */
export function getProductionUrl(): string | null {
  // Helper function to ensure URL has protocol
  const ensureProtocol = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  // First try custom domain
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return ensureProtocol(appUrl);
  }

  // Then try Vercel's production URL (available in all environments)
  const productionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
                        process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) {
    return ensureProtocol(productionUrl);
  }

  return null;
}

/**
 * Get the authentication URL for OAuth callbacks and authentication flows
 * Automatically adapts to Vercel's deployment environments
 * @param options - Configuration options
 * @param options.useProductionUrl - Use production URL even in preview environments
 * @returns The authentication URL with protocol
 * @throws Error in production if no URL is configured
 */
export function getAuthUrl(options?: { useProductionUrl?: boolean }): string {
  // First check if a custom AUTH_URL is explicitly set (for backward compatibility)
  const legacyAuthUrl = process.env.AUTH_URL;
  if (legacyAuthUrl) {
    // If legacy AUTH_URL is set, use it (for backward compatibility)
    if (!legacyAuthUrl.startsWith('http://') && !legacyAuthUrl.startsWith('https://')) {
      return `https://${legacyAuthUrl}`;
    }
    return legacyAuthUrl;
  }

  // Check if custom NEXT_PUBLIC_AUTH_URL is set
  const customAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  if (customAuthUrl) {
    if (!customAuthUrl.startsWith('http://') && !customAuthUrl.startsWith('https://')) {
      return `https://${customAuthUrl}`;
    }
    return customAuthUrl;
  }

  // Otherwise, use the same URL as the application
  return getAppUrl(options);
}