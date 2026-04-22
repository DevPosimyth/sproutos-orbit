// =============================================================================
// Sprout OS Orbit — Playwright Configuration
// Property: sproutos.ai — POSIMYTH's AI-powered SaaS platform
// =============================================================================

require('dotenv').config();

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({

  // ── Test Directory ──────────────────────────────────────────────────────────
  testDir: './tests',

  // ── Run tests in parallel ───────────────────────────────────────────────────
  fullyParallel: false,

  // ── Fail the build on CI if test.only is accidentally left in ───────────────
  forbidOnly: !!process.env.CI,

  // ── Retry failed tests once on CI ───────────────────────────────────────────
  retries: process.env.CI ? 1 : 0,

  // ── Number of parallel workers ──────────────────────────────────────────────
  workers: 1,

  // ── Reporter ────────────────────────────────────────────────────────────────
  reporter: [
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['list'],
  ],

  // ── Global test settings ────────────────────────────────────────────────────
  use: {
    // Base URL — override with SPROUTOS_URL in .env
    baseURL: process.env.SPROUTOS_URL || 'https://sproutos.ai',

    // Capture screenshot only on failure
    screenshot: 'only-on-failure',

    // Record video only on failure
    video: 'retain-on-failure',

    // Collect trace on first retry — open with: npx playwright show-trace
    trace: 'on-first-retry',

    // Action timeout
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Ignore HTTPS errors (useful for staging environments)
    ignoreHTTPSErrors: false,
  },

  // ── Output folder for test artifacts ────────────────────────────────────────
  outputDir: 'test-results',

  // ── Snapshot directory for visual regression ────────────────────────────────
  snapshotDir: 'tests/snapshots',

  // ── Expect timeout ──────────────────────────────────────────────────────────
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03,
    },
  },

  // ── Global timeout per test ──────────────────────────────────────────────────
  timeout: 60000,

  // ── Projects — multi-viewport testing ───────────────────────────────────────
  projects: [

    // ── Sprout OS — Desktop ───────────────────────────────────────────────────
    {
      name: 'sproutos-desktop',
      testMatch: 'tests/sproutos/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.SPROUTOS_URL || 'https://sproutos.ai',
        viewport: { width: 1440, height: 900 },
      },
    },

    // ── Sprout OS — Mobile ────────────────────────────────────────────────────
    {
      name: 'sproutos-mobile',
      testMatch: 'tests/sproutos/**/*.spec.js',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.SPROUTOS_URL || 'https://sproutos.ai',
        viewport: { width: 375, height: 812 },
      },
    },

    // ── Sprout OS — Tablet ────────────────────────────────────────────────────
    {
      name: 'sproutos-tablet',
      testMatch: 'tests/sproutos/**/*.spec.js',
      use: {
        ...devices['iPad (gen 7)'],
        baseURL: process.env.SPROUTOS_URL || 'https://sproutos.ai',
        viewport: { width: 768, height: 1024 },
      },
    },

  ],

});
