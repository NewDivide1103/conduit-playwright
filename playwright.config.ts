import { defineConfig, devices } from '@playwright/test';
import { env, STORAGE_STATE } from './src/config/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },

  projects: [
    // 1. Логін через API один раз → зберігаємо storageState
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // 2. Чисті API тести — без браузера
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: { baseURL: env.apiUrl + '/' },
    },

    // 3. UI / e2e тести — вже залогінені через storageState
    ...[
      { name: 'chromium', device: devices['Desktop Chrome'] },
      { name: 'firefox', device: devices['Desktop Firefox'] },
      { name: 'webkit', device: devices['Desktop Safari'] },
    ].map(({ name, device }) => ({
      name,
      testMatch: /(ui|e2e)\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...device, storageState: STORAGE_STATE },
    })),
  ],
});
