// =============================================================================
// Sprout OS — Sitemap Suite — Shared Auth + Navigation Helper
// =============================================================================

const { expect } = require('@playwright/test');

const TEST_EMAIL    = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(page) {
  await page.goto('/auth/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard|sproutos\.ai\/?$/i, { timeout: 25000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
}

// ── Dismiss onboarding tour if present ───────────────────────────────────────
async function dismissTour(page) {
  const overlay = page.locator('.driver-overlay, [id="driver-popover-content"]');
  if (await overlay.isVisible({ timeout: 3000 }).catch(() => false)) {
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

// ── Navigate to sitemap editor via first project card ─────────────────────────
// Returns false if no project card is found (skip tests gracefully)
async function navigateToSitemap(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await dismissTour(page);

  // Try clicking the first project card
  const card = page.locator(
    '[class*="project-card"], [class*="ProjectCard"], [data-testid*="project"],' +
    ' .cursor-pointer:has([class*="project"]), [class*="card"]:has(h2), [class*="card"]:has(h3)'
  ).first();

  const cardVisible = await card.isVisible({ timeout: 8000 }).catch(() => false);
  if (!cardVisible) return false;

  await card.click();
  await page.waitForURL(/sitemap|project|editor/i, { timeout: 25000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  return true;
}

// ── Combined helper ───────────────────────────────────────────────────────────
async function loginAndGoToSitemap(page) {
  await login(page);
  await dismissTour(page);
  return navigateToSitemap(page);
}

module.exports = {
  TEST_EMAIL,
  TEST_PASSWORD,
  login,
  dismissTour,
  navigateToSitemap,
  loginAndGoToSitemap,
};
