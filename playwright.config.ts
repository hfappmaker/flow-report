import { defineConfig, devices } from '@playwright/test';

/**
 * Get the base URL for Playwright tests based on the environment
 */
function getTestBaseUrl(): string {
  const vercelEnv = process.env.VERCEL_ENV;

  // Production environment - use custom domain
  if (vercelEnv === 'production') {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL is required in production');
    }
    // Ensure the URL has a protocol
    if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
      return `https://${appUrl}`;
    }
    return appUrl;
  }

  // Preview environment - use Vercel's automatic preview URL
  if (vercelEnv === 'preview') {
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
    if (vercelUrl) {
      // Vercel URLs don't include protocol, add https://
      return `https://${vercelUrl}`;
    }
  }

  // Development environment or fallback
  const customUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (customUrl) {
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      return `http://${customUrl}`;
    }
    return customUrl;
  }

  // Default fallback for local development
  return 'http://localhost:3000';
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Global timeout for each test */
  timeout: 30000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: getTestBaseUrl(),

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot settings */
    screenshot: 'only-on-failure',
    
    /* Video settings */
    video: 'retain-on-failure',
    storageState: undefined, // セッションをクリア
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: getTestBaseUrl(),
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
});
