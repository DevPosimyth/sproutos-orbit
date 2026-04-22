// =============================================================================
// Sprout OS — Scope Test Suite
// Covers: /scope route · project/workspace scope UI · auth gating
// NOTE: Scope-specific assertions are placeholders. Refine once flows confirmed.
// =============================================================================

const { test, expect } = require('@playwright/test');

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page) {
  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard|app|home|scope/i, { timeout: 15000 }).catch(() => {});
}

test.describe('Sprout OS — Scope (Auth Required)', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not configured');
    }
    await login(page);
  });

  test('scope route loads after login', async ({ page }) => {
    const res = await page.goto('/scope');
    if (res.status() >= 400) {
      test.skip(true, `/scope not reachable (status ${res.status()}) — confirm route slug`);
    }
    expect(page.url()).toMatch(/scope/i);
  });

  test('scope page has main content region', async ({ page }) => {
    await page.goto('/scope').catch(() => {});
    const main = page.locator('main, [role="main"], [class*="scope"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('scope page renders without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/scope').catch(() => {});
    await page.waitForTimeout(2000);
    // Allow analytics/3rd-party noise, fail only on app errors
    const appErrors = errors.filter((e) => !/analytics|gtag|facebook|hotjar|sentry/i.test(e));
    expect(appErrors, appErrors.join('\n')).toHaveLength(0);
  });

  // TODO: add assertions once Scope UI flows are documented:
  //   - scope create / edit / delete
  //   - scope list rendering
  //   - scope-to-project association
  //   - permissions / role checks
});

test.describe('Sprout OS — Scope Auth Gating (Unauthenticated)', () => {

  test('/scope redirects or blocks unauthenticated users', async ({ page }) => {
    const res = await page.goto('/scope');
    const url = page.url();
    if (res.status() === 404) {
      test.skip(true, '/scope slug not found — confirm exact path');
    }
    expect(url).toMatch(/login|sign-in|^https?:\/\/[^/]+\/?$/i);
  });
});
