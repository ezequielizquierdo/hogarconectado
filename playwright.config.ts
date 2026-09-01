import { defineConfig } from '@playwright/test';

const visualTestPort = process.env.VISUAL_TEST_PORT || '8081';
const visualTestBaseUrl = `http://127.0.0.1:${visualTestPort}`;

export default defineConfig({
  testDir: './tests/visual',
  outputDir: 'test-results/visual',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'list',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      // Small font-rasterization differences are expected between local and CI macOS runners.
      maxDiffPixelRatio: 0.025,
    },
  },
  use: {
    baseURL: visualTestBaseUrl,
    colorScheme: 'light',
    locale: 'es-AR',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
  webServer: {
    command: `npx expo start --web --port ${visualTestPort}`,
    url: visualTestBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
