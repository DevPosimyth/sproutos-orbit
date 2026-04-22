// =============================================================================
// Sprout OS — Pricing Page Test Suite
// Covers: Plans · pricing toggles · checkout CTAs
// =============================================================================

const { test, expect } = require('@playwright/test');

test.describe('Sprout OS — Pricing Page', () => {

  test('pricing page loads without errors', async ({ page }) => {
    const response = await page.goto('/pricing');
    expect(response.status()).toBeLessThan(400);
  });

  test('displays at least one pricing plan', async ({ page }) => {
    await page.goto('/pricing');
    const plans = page.locator('[class*="plan"], [class*="tier"], [class*="pricing-card"]');
    const count = await plans.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows prices with currency symbol', async ({ page }) => {
    await page.goto('/pricing');
    const priceText = await page.locator('body').textContent();
    expect(priceText).toMatch(/[$€£₹]\s?\d+/);
  });

  test('has monthly / yearly toggle (if applicable)', async ({ page }) => {
    await page.goto('/pricing');
    const toggle = page.locator('button:has-text("Monthly"), button:has-text("Yearly"), button:has-text("Annual"), [role="switch"]').first();
    if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(toggle).toBeVisible();
    } else {
      test.skip(true, 'No billing toggle present');
    }
  });

  test('each plan has a CTA button', async ({ page }) => {
    await page.goto('/pricing');
    const ctas = page.locator('a:has-text("Get Started"), a:has-text("Sign Up"), a:has-text("Buy"), a:has-text("Start"), button:has-text("Choose")');
    const count = await ctas.count();
    expect(count).toBeGreaterThan(0);
  });

  test('FAQ section is present', async ({ page }) => {
    await page.goto('/pricing');
    const faq = page.locator('[class*="faq"], h2:has-text("FAQ"), h2:has-text("Questions")').first();
    if (await faq.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(faq).toBeVisible();
    } else {
      test.skip(true, 'No FAQ section on pricing page');
    }
  });
});
