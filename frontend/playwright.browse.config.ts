import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const evidence = process.env.QA_OUTPUT_DIR ?? path.resolve('qa-results/browse-models');

export default defineConfig({
  testDir: './e2e',
  testMatch: ['browse-models.spec.ts', 'design-review.spec.ts', 'model-search.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: path.join(evidence, 'artifacts'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(evidence, 'results.json') }],
    ['html', { outputFolder: path.join(evidence, 'report'), open: 'never' }],
  ],
  use: {
    baseURL: process.env.QA_BASE_URL ?? 'http://127.0.0.1:25173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
  ],
});
