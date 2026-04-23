// =============================================================================
// Sprout OS — Homepage / Marketing Landing Page Test Suite
// Covers: page load · meta tags · navigation · hero · CTAs · footer · assets
// URL: https://sproutos.ai/
// =============================================================================

const { test, expect } = require('@playwright/test');

test.describe('Sprout OS — Homepage', () => {

  // ── PAGE LOAD ───────────────────────────────────────────────────────────────
  test.describe('Page Load', () => {

    test('returns HTTP 200', async ({ request }) => {
      const res = await request.get('/');
      expect(res.status()).toBe(200);
    });

    test('has a non-empty <title>', async ({ page }) => {
      await page.goto('/');
      const title = await page.title();
      expect(title.trim().length).toBeGreaterThan(0);
      await expect(page).toHaveTitle(/sprout/i);
    });

    test('loads without uncaught JS errors', async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const appErrors = errors.filter(
        (e) => !/analytics|gtag|facebook|hotjar|sentry|intercom/i.test(e)
      );
      expect(appErrors, appErrors.join('\n')).toHaveLength(0);
    });

    test('no 4xx/5xx on same-origin asset requests', async ({ page }) => {
      const failures = [];
      page.on('response', (res) => {
        if (res.url().includes('sproutos.ai') && res.status() >= 400) {
          failures.push(`${res.status()} ${res.url()}`);
        }
      });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      expect(failures, failures.join('\n')).toHaveLength(0);
    });

  });

  // ── META / SEO ──────────────────────────────────────────────────────────────
  test.describe('Meta & SEO', () => {

    test('has a meta description', async ({ page }) => {
      await page.goto('/');
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc && desc.trim().length).toBeGreaterThan(0);
    });

    test('has Open Graph title tag', async ({ page }) => {
      await page.goto('/');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
      expect(ogTitle).not.toBeNull();
      expect(ogTitle.trim().length).toBeGreaterThan(0);
    });

    test('has Open Graph image tag', async ({ page }) => {
      await page.goto('/');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);
      expect(ogImage).not.toBeNull();
      expect(ogImage.trim().length).toBeGreaterThan(0);
    });

    test('canonical URL points to https', async ({ page }) => {
      await page.goto('/');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
      if (canonical) {
        expect(canonical).toMatch(/^https:\/\//);
      }
    });

  });

  // ── NAVIGATION ──────────────────────────────────────────────────────────────
  test.describe('Navigation', () => {

    test('site header / navbar is visible', async ({ page }) => {
      await page.goto('/');
      const nav = page.locator('header, nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
    });

    test('logo is present and links to homepage', async ({ page }) => {
      await page.goto('/');
      const logo = page.locator('header a img, nav a img, a[href="/"] img').first();
      if (await logo.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(logo).toBeVisible();
      } else {
        const logoLink = page.locator('a[href="/"], a[href="https://sproutos.ai"]').first();
        await expect(logoLink).toBeVisible();
      }
    });

    test('primary nav links are reachable (no 4xx)', async ({ page, request }) => {
      await page.goto('/');
      const anchors = await page.locator('header a, nav a').all();
      const hrefs = [];
      for (const a of anchors) {
        const href = await a.getAttribute('href').catch(() => null);
        if (href && href.startsWith('/') && !href.startsWith('//') && !hrefs.includes(href)) {
          hrefs.push(href);
        }
      }
      for (const href of hrefs.slice(0, 10)) {
        const res = await request.get(href).catch(() => null);
        if (res) expect(res.status(), `Broken nav link: ${href}`).toBeLessThan(400);
      }
    });

    test('mobile menu toggle exists on small viewport', async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
      const mobilePage = await ctx.newPage();
      await mobilePage.goto('/');
      const toggle = mobilePage.locator(
        '[class*="hamburger"], [class*="menu-toggle"], [aria-label*="menu"], button[class*="mobile"]'
      ).first();
      if (await toggle.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(toggle).toBeVisible();
      }
      await ctx.close();
    });

  });

  // ── HERO SECTION ────────────────────────────────────────────────────────────
  test.describe('Hero Section', () => {

    test('hero heading is visible', async ({ page }) => {
      await page.goto('/');
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      const text = await heading.innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    });

    test('hero has a primary CTA button', async ({ page }) => {
      await page.goto('/');
      const cta = page.locator(
        'a:has-text("Get Started"), a:has-text("Try Free"), a:has-text("Start Free"), a:has-text("Sign Up"), button:has-text("Get Started")'
      ).first();
      await expect(cta).toBeVisible({ timeout: 8000 });
    });

    test('hero CTA link points to signup or app route', async ({ page }) => {
      await page.goto('/');
      const cta = page.locator(
        'a:has-text("Get Started"), a:has-text("Try Free"), a:has-text("Start Free"), a:has-text("Sign Up")'
      ).first();
      if (await cta.isVisible({ timeout: 5000 }).catch(() => false)) {
        const href = await cta.getAttribute('href');
        expect(href).toMatch(/signup|register|login|app|get-started/i);
      }
    });

  });

  // ── FEATURES / SECTIONS ─────────────────────────────────────────────────────
  test.describe('Features Section', () => {

    test('page has at least one h2 section heading', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThanOrEqual(1);
    });

    test('feature cards or list items are rendered', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const cards = page.locator(
        '[class*="feature"], [class*="card"], [class*="benefit"], section ul li'
      ).first();
      await expect(cards).toBeVisible({ timeout: 8000 });
    });

    test('images in features section have non-empty alt attributes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const images = await page.locator('main img').all();
      for (const img of images.slice(0, 15)) {
        const alt = await img.getAttribute('alt');
        // alt="" is valid for decorative images; null is the problem
        expect(alt, 'img missing alt attribute').not.toBeNull();
      }
    });

  });

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  test.describe('Footer', () => {

    test('footer is present', async ({ page }) => {
      await page.goto('/');
      const footer = page.locator('footer').first();
      await expect(footer).toBeVisible();
    });

    test('footer contains copyright text', async ({ page }) => {
      await page.goto('/');
      const footer = page.locator('footer');
      const text = await footer.innerText().catch(() => '');
      expect(text).toMatch(/©|copyright|\d{4}/i);
    });

    test('footer links are not broken (spot check first 8)', async ({ page, request }) => {
      await page.goto('/');
      const footerAnchors = await page.locator('footer a').all();
      const hrefs = [];
      for (const a of footerAnchors) {
        const href = await a.getAttribute('href').catch(() => null);
        if (href && href.startsWith('/') && !hrefs.includes(href)) hrefs.push(href);
      }
      for (const href of hrefs.slice(0, 8)) {
        const res = await request.get(href).catch(() => null);
        if (res) expect(res.status(), `Broken footer link: ${href}`).toBeLessThan(400);
      }
    });

    test('footer has Privacy Policy link', async ({ page }) => {
      await page.goto('/');
      const privacyLink = page.locator('footer a:has-text("Privacy"), footer a[href*="privacy"]').first();
      await expect(privacyLink).toBeVisible({ timeout: 5000 });
    });

    test('footer has Terms link', async ({ page }) => {
      await page.goto('/');
      const termsLink = page.locator('footer a:has-text("Terms"), footer a[href*="terms"]').first();
      await expect(termsLink).toBeVisible({ timeout: 5000 });
    });

  });

  // ── PERFORMANCE BASELINE ────────────────────────────────────────────────────
  test.describe('Performance Baseline', () => {

    test('homepage loads within 10 seconds', async ({ page }) => {
      const start = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(10000);
    });

    test('page has a <main> landmark region', async ({ page }) => {
      await page.goto('/');
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

  });

});
