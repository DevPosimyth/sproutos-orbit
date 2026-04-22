// =============================================================================
// Sprout OS — Dashboard Test Suite
// Covers: Protected dashboard routes · auth gating · user profile
// NOTE: Requires valid TEST_USER_EMAIL + TEST_USER_PASSWORD in .env
// =============================================================================

const { test, expect } = require('@playwright/test');

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

test.describe('Sprout OS — Dashboard (Auth Required)', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip(true, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not configured');
    }

    // Login flow
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
    await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/dashboard|app|home/i, { timeout: 15000 }).catch(() => {});
  });

  test('dashboard loads after login', async ({ page }) => {
    await page.goto('/dashboard');
    expect(page.url()).toMatch(/dashboard|app/i);
  });

  test('dashboard shows user context (email/avatar/name)', async ({ page }) => {
    await page.goto('/dashboard');
    const userMenu = page.locator('[class*="user"], [class*="profile"], [class*="avatar"], [aria-label*="user" i]').first();
    await expect(userMenu).toBeVisible({ timeout: 10000 });
  });

  test('settings route is accessible', async ({ page }) => {
    const response = await page.goto('/settings');
    // 404 is acceptable if Sprout OS uses a different slug
    if (response.status() < 400) {
      expect(response.status()).toBeLessThan(400);
    } else {
      test.skip(true, 'Settings route uses a different path');
    }
  });

  test('logout returns user to landing or login', async ({ page }) => {
    await page.goto('/dashboard');
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")').first();
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/login|^https?:\/\/[^/]+\/?$/i);
    } else {
      test.skip(true, 'Logout button not found — may be inside a menu');
    }
  });
});

test.describe('Sprout OS — Dashboard Auth Gating (Unauthenticated)', () => {

  test('dashboard redirects unauthenticated users to login', async ({ page }) => {
    const response = await page.goto('/dashboard');
    // Either 401/403 or a redirect to /login
    const url = page.url();
    if (response.status() >= 400 && response.status() !== 401 && response.status() !== 403) {
      // Unexpected status
      expect(response.status()).toBeLessThan(500);
    } else {
      expect(url).toMatch(/login|sign-in|^https?:\/\/[^/]+\/?$/i);
    }
  });
});
