import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.CF_E2E_WEB_URL ?? 'http://localhost:23000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
