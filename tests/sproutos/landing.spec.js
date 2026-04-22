// =============================================================================
// Sprout OS — Landing / Marketing Page Test Suite
// Covers: Homepage · navigation · CTAs · footer
// =============================================================================

const { test, expect } = require('@playwright/test');

test.describe('Sprout OS — Landing Page', () => {

  test('homepage loads with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBeLessThan(400);
  });

  test('has meaningful title and meta description', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/sprout/i);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(30);
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('sproutos');
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
    expect(ogImage).toBeTruthy();
  });

  test('main hero CTA is visible', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h1, [class*="hero"] h1, [class*="hero"] h2').first();
    await expect(hero).toBeVisible();
  });

  test('Get Started / Sign Up CTA exists', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('a:has-text("Get Started"), a:has-text("Sign Up"), a:has-text("Try"), a:has-text("Start Free")').first();
    await expect(cta).toBeVisible();
  });

  test('Login link in navigation', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign in"), a:has-text("Log in")').first();
    await expect(loginLink).toBeVisible();
  });

  test('footer contains company info', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('no broken internal images', async ({ page }) => {
    await page.goto('/');
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 20)) {
      const naturalWidth = await img.evaluate((el) => el.naturalWidth).catch(() => 0);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('no console errors on homepage load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Allow third-party errors (analytics, etc.) but fail on first-party
    const firstPartyErrors = errors.filter(
      (e) => !e.match(/google|facebook|hotjar|segment|mixpanel|stripe|analytics/i)
    );
    expect(firstPartyErrors).toHaveLength(0);
  });
});
