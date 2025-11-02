import { getAppUrl, getClientAppUrl, isProduction, isPreview, isDevelopment, getProductionUrl, getAuthUrl } from './get-app-url';

describe('get-app-url', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getAppUrl', () => {
    it('should return production URL when VERCEL_ENV is production', () => {
      process.env.VERCEL_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';

      expect(getAppUrl()).toBe('https://myapp.com');
    });

    it('should add https:// to production URL if protocol is missing', () => {
      process.env.VERCEL_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'myapp.com';

      expect(getAppUrl()).toBe('https://myapp.com');
    });

    it('should use Vercel production URL as fallback in production', () => {
      process.env.VERCEL_ENV = 'production';
      delete process.env.NEXT_PUBLIC_APP_URL;
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

      expect(getAppUrl()).toBe('https://myapp.vercel.app');
    });

    it('should throw error in production if no URLs are configured', () => {
      process.env.VERCEL_ENV = 'production';
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_URL;
      delete process.env.NEXT_PUBLIC_VERCEL_URL;

      expect(() => getAppUrl()).toThrow('No production URL configured');
    });

    it('should return Vercel preview URL when VERCEL_ENV is preview', () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'feature-branch-myapp.vercel.app';

      expect(getAppUrl()).toBe('https://feature-branch-myapp.vercel.app');
    });

    it('should fallback to VERCEL_URL if NEXT_PUBLIC_VERCEL_URL is not set in preview', () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.VERCEL_URL = 'feature-branch-myapp.vercel.app';
      delete process.env.NEXT_PUBLIC_VERCEL_URL;

      expect(getAppUrl()).toBe('https://feature-branch-myapp.vercel.app');
    });

    it('should return custom URL in development if provided', () => {
      process.env.VERCEL_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3001';

      expect(getAppUrl()).toBe('http://localhost:3001');
    });

    it('should return localhost:3000 as fallback in development', () => {
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_APP_URL;

      expect(getAppUrl()).toBe('http://localhost:3000');
    });

    it('should use branch URL in preview when available', () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.VERCEL_BRANCH_URL = 'feature-git-myapp.vercel.app';
      process.env.VERCEL_URL = 'generic.vercel.app';

      expect(getAppUrl()).toBe('https://feature-git-myapp.vercel.app');
    });

    it('should return production URL when useProductionUrl option is true', () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'preview.vercel.app';
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'production.vercel.app';

      expect(getAppUrl({ useProductionUrl: true })).toBe('https://production.vercel.app');
    });
  });

  describe('getClientAppUrl', () => {
    it('should handle production environment', () => {
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';

      expect(getClientAppUrl()).toBe('https://myapp.com');
    });

    it('should use Vercel production URL as fallback', () => {
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
      delete process.env.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      const result = getClientAppUrl();

      // Should not error since we have a fallback
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result).toBe('https://myapp.vercel.app');

      consoleSpy.mockRestore();
    });

    it('should log error and use window.location in production if no URLs configured', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.NEXT_PUBLIC_VERCEL_URL;

      const result = getClientAppUrl();
      expect(consoleSpy).toHaveBeenCalledWith(
        'No production URL configured. Set NEXT_PUBLIC_APP_URL or configure a production domain in Vercel.'
      );
      // In jsdom environment, window.location.origin exists and returns "http://localhost"
      expect(result).toBe('http://localhost');

      consoleSpy.mockRestore();
    });

    it('should handle preview environment', () => {
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'preview-myapp.vercel.app';

      expect(getClientAppUrl()).toBe('https://preview-myapp.vercel.app');
    });

    it('should use branch URL in preview when available', () => {
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL = 'feature-git-myapp.vercel.app';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'generic.vercel.app';

      expect(getClientAppUrl()).toBe('https://feature-git-myapp.vercel.app');
    });

    it('should return localhost in development', () => {
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_APP_URL;

      // In jsdom environment, window.location.origin exists and returns "http://localhost"
      expect(getClientAppUrl()).toBe('http://localhost');
    });

    it('should return production URL with useProductionUrl option', () => {
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'preview.vercel.app';
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = 'production.vercel.app';

      expect(getClientAppUrl({ useProductionUrl: true })).toBe('https://production.vercel.app');
    });
  });

  describe('Environment helper functions', () => {
    it('isProduction should return true when VERCEL_ENV is production', () => {
      process.env.VERCEL_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('isProduction should return true when NEXT_PUBLIC_VERCEL_ENV is production', () => {
      delete process.env.VERCEL_ENV;
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('isProduction should return true when NODE_ENV is production', () => {
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true
      });
      expect(isProduction()).toBe(true);
    });

    it('isProduction should return false otherwise', () => {
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      });
      expect(isProduction()).toBe(false);
    });

    it('isPreview should return true when VERCEL_ENV is preview', () => {
      process.env.VERCEL_ENV = 'preview';
      expect(isPreview()).toBe(true);
    });

    it('isPreview should return true when NEXT_PUBLIC_VERCEL_ENV is preview', () => {
      delete process.env.VERCEL_ENV;
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview';
      expect(isPreview()).toBe(true);
    });

    it('isPreview should return false otherwise', () => {
      process.env.VERCEL_ENV = 'production';
      process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
      expect(isPreview()).toBe(false);
    });

    it('isDevelopment should return true when VERCEL_ENV is development', () => {
      process.env.VERCEL_ENV = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('isDevelopment should return true when NODE_ENV is development', () => {
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      });
      expect(isDevelopment()).toBe(true);
    });

    it('isDevelopment should return true when no environment is set and not production', () => {
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_VERCEL_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: undefined,
        writable: true,
        configurable: true
      });
      expect(isDevelopment()).toBe(true);
    });

    it('isDevelopment should return false in production', () => {
      process.env.VERCEL_ENV = 'production';
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('getProductionUrl', () => {
    it('should return custom app URL when set', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

      expect(getProductionUrl()).toBe('https://myapp.com');
    });

    it('should return Vercel production URL as fallback', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app';

      expect(getProductionUrl()).toBe('https://myapp.vercel.app');
    });

    it('should return null when no production URL is configured', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

      expect(getProductionUrl()).toBeNull();
    });

    it('should add https protocol if missing', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'myapp.com';

      expect(getProductionUrl()).toBe('https://myapp.com');
    });
  });

  describe('getAuthUrl', () => {
    it('should use legacy AUTH_URL if set for backward compatibility', () => {
      process.env.AUTH_URL = 'https://legacy-auth.com';
      process.env.NEXT_PUBLIC_AUTH_URL = 'https://new-auth.com';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.com';

      expect(getAuthUrl()).toBe('https://legacy-auth.com');
    });

    it('should use NEXT_PUBLIC_AUTH_URL if AUTH_URL is not set', () => {
      delete process.env.AUTH_URL;
      process.env.NEXT_PUBLIC_AUTH_URL = 'https://custom-auth.com';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.com';

      expect(getAuthUrl()).toBe('https://custom-auth.com');
    });

    it('should fallback to getAppUrl if no auth URL is set', () => {
      delete process.env.AUTH_URL;
      delete process.env.NEXT_PUBLIC_AUTH_URL;
      process.env.VERCEL_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';

      expect(getAuthUrl()).toBe('https://myapp.com');
    });

    it('should add https protocol to legacy AUTH_URL if missing', () => {
      process.env.AUTH_URL = 'legacy-auth.com';
      delete process.env.NEXT_PUBLIC_AUTH_URL;

      expect(getAuthUrl()).toBe('https://legacy-auth.com');
    });

    it('should add https protocol to NEXT_PUBLIC_AUTH_URL if missing', () => {
      delete process.env.AUTH_URL;
      process.env.NEXT_PUBLIC_AUTH_URL = 'custom-auth.com';

      expect(getAuthUrl()).toBe('https://custom-auth.com');
    });

    it('should use Vercel preview URL in preview environment when no auth URL is set', () => {
      delete process.env.AUTH_URL;
      delete process.env.NEXT_PUBLIC_AUTH_URL;
      process.env.VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'preview.vercel.app';

      expect(getAuthUrl()).toBe('https://preview.vercel.app');
    });

    it('should respect useProductionUrl option', () => {
      delete process.env.AUTH_URL;
      delete process.env.NEXT_PUBLIC_AUTH_URL;
      process.env.VERCEL_ENV = 'preview';
      process.env.NEXT_PUBLIC_VERCEL_URL = 'preview.vercel.app';
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'production.vercel.app';

      expect(getAuthUrl({ useProductionUrl: true })).toBe('https://production.vercel.app');
    });

    it('should return localhost in development when no auth URL is set', () => {
      delete process.env.AUTH_URL;
      delete process.env.NEXT_PUBLIC_AUTH_URL;
      delete process.env.VERCEL_ENV;
      delete process.env.NEXT_PUBLIC_APP_URL;

      expect(getAuthUrl()).toBe('http://localhost:3000');
    });
  });
});