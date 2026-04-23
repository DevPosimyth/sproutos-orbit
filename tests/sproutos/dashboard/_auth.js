// Shared login helper for all dashboard specs
const { expect } = require('@playwright/test');

const TEST_EMAIL    = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page) {
  await page.goto('/auth/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard/i, { timeout: 25000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
}

// Dismiss onboarding tour overlay if present (driver.js)
async function dismissTour(page) {
  const overlay = page.locator('.driver-overlay, [id="driver-popover-content"]');
  if (await overlay.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Try clicking the close/skip button
    const skip = page.locator(
      'button:has-text("Skip"), button:has-text("Dismiss"), [data-driver-next-btn], .driver-popover-close-btn'
    ).first();
    if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skip.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
  }
}

async function loginAndDismissTour(page) {
  await login(page);
  await dismissTour(page);
}

module.exports = { TEST_EMAIL, TEST_PASSWORD, login, dismissTour, loginAndDismissTour };
