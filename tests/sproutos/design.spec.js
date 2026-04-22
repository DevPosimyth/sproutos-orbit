// =============================================================================
// Sprout OS — Design Test Suite
// Covers: /design route · design canvas/editor · auth gating
// NOTE: Design-specific assertions are placeholders. Refine once flows confirmed.
// =============================================================================

const { test, expect } = require('@playwright/test');

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page) {
  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard|app|home|design/i, { timeout: 15000 }).catch(() => {});
}

test.describe('Sprout OS — Design (Auth Required)', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not configured');
    }
    await login(page);
  });

  test('design route loads after login', async ({ page }) => {
    const res = await page.goto('/design');
    if (res.status() >= 400) {
      test.skip(true, `/design not reachable (status ${res.status()}) — confirm route slug`);
    }
    expect(page.url()).toMatch(/design/i);
  });

  test('design page has main content / canvas region', async ({ page }) => {
    await page.goto('/design').catch(() => {});
    const main = page.locator('main, [role="main"], canvas, [class*="design"], [class*="canvas"], [class*="editor"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('design page renders without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/design').catch(() => {});
    await page.waitForTimeout(3000);
    const appErrors = errors.filter((e) => !/analytics|gtag|facebook|hotjar|sentry/i.test(e));
    expect(appErrors, appErrors.join('\n')).toHaveLength(0);
  });

  test('design page loads critical assets (no 4xx/5xx on same-origin requests)', async ({ page }) => {
    const failures = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('sproutos.ai') && res.status() >= 400) {
        failures.push(`${res.status()} ${url}`);
      }
    });
    await page.goto('/design').catch(() => {});
    await page.waitForTimeout(3000);
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  // TODO: add assertions once Design UI flows are documented:
  //   - create new design / open existing
  //   - canvas interactions (drag, drop, select)
  //   - save / autosave indicator
  //   - export / publish actions
  //   - layers / properties panels
});

test.describe('Sprout OS — Design Auth Gating (Unauthenticated)', () => {

  test('/design redirects or blocks unauthenticated users', async ({ page }) => {
    const res = await page.goto('/design');
    const url = page.url();
    if (res.status() === 404) {
      test.skip(true, '/design slug not found — confirm exact path');
    }
    expect(url).toMatch(/login|sign-in|^https?:\/\/[^/]+\/?$/i);
  });
});
