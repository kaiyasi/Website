import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  use: { baseURL: 'http://127.0.0.1:4322', screenshot: 'only-on-failure' },
  webServer: {
    command: 'node tests/server.mjs',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
