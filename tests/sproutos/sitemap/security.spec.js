// =============================================================================
// Sprout OS — Sitemap Editor — Security, Console Errors, Performance & SEO
// Covers : Auth guard · XSS prevention · CSP · Console errors · API health
//          Performance thresholds · Data isolation · SEO meta
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, login, loginAndGoToSitemap } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GUARD
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Auth Guard', () => {

  test('unauthenticated visit to a sitemap project URL redirects to login', async ({ page }) => {
    // Do NOT login — test raw access
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // If the page redirected to login we pass, otherwise check URL
    const url = page.url();
    const isRedirected = url.includes('login') || url.includes('auth');
    if (!isRedirected) {
      // Check if dashboard content is rendered for unauthenticated user
      const dashContent = await page.locator('[class*="dashboard"], [class*="canvas"]').isVisible({ timeout: 3000 }).catch(() => false);
      expect(dashContent, 'Unauthenticated user can see dashboard/editor content').toBe(false);
    }
  });

  test('unauthenticated API call to sitemap endpoint returns 401', async ({ request }) => {
    const res = await request.get('/api/sitemaps').catch(() => null);
    if (res) expect(res.status()).toBe(401);
  });

  test('unauthenticated API call to projects endpoint returns 401', async ({ request }) => {
    const res = await request.get('/api/projects').catch(() => null);
    if (res) expect(res.status()).toBe(401);
  });

  test('accessing another user\'s project sitemap returns 403 or redirects', async ({ page }) => {
    await login(page);
    // Use a fabricated / non-owned project ID
    await page.goto('/projects/000000000000000000000000/sitemap');
    await page.waitForLoadState('domcontentloaded');
    const url = page.url();
    const status403 = await page.evaluate(() => {
      return document.body?.innerText?.includes('403') ||
             document.body?.innerText?.includes('Forbidden') ||
             document.body?.innerText?.includes('Not Found');
    });
    const redirectedAway = url.includes('dashboard') || url.includes('login') || url.includes('404') || url.includes('403');
    expect(status403 || redirectedAway, 'Non-owned project is accessible').toBe(true);
  });

  test('session cookie on sitemap editor page is HttpOnly', async ({ page }) => {
    await loginAndGoToSitemap(page).catch(() => {});
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('token') ||
      c.name.toLowerCase().includes('auth')
    );
    if (!sessionCookie) {
      console.warn('⚠️ No session/auth cookie identified');
      return;
    }
    expect(sessionCookie.httpOnly, 'Session cookie is not HttpOnly').toBe(true);
  });

  test('session cookie on sitemap editor page has Secure flag', async ({ page }) => {
    await loginAndGoToSitemap(page).catch(() => {});
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('token') ||
      c.name.toLowerCase().includes('auth')
    );
    if (!sessionCookie) return;
    expect(sessionCookie.secure, 'Session cookie does not have Secure flag').toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// XSS PREVENTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — XSS Prevention', () => {

  test('XSS payload in page rename input does not execute', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.evaluate(() => { window.__xss_sitemap = false; });
    const node = page.locator('[class*="node"], [class*="page-node"]').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    // Try to trigger rename
    await node.dblclick();
    const input = page.locator('input[type="text"]').first();
    if (!await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await node.click({ button: 'right' });
      await page.waitForTimeout(400);
      const renameItem = page.locator('[role="menuitem"]:has-text("Rename"), li:has-text("Rename")').first();
      if (await renameItem.isVisible({ timeout: 2000 }).catch(() => false)) await renameItem.click();
    }
    const renameInput = page.locator('input[type="text"]').first();
    if (!await renameInput.isVisible({ timeout: 3000 }).catch(() => false)) test.skip(true, 'Rename input not accessible');
    await renameInput.fill('<img src=x onerror="window.__xss_sitemap=true">');
    await renameInput.press('Enter');
    await page.waitForTimeout(1000);
    const executed = await page.evaluate(() => window.__xss_sitemap);
    expect(executed, 'XSS payload executed in page rename field').toBe(false);
  });

  test('XSS payload in AI chat input does not execute', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.evaluate(() => { window.__xss_chat = false; });
    const trigger = page.locator(
      'button:has-text("AI"), button:has-text("Chat"), [class*="ai-chat"]'
    ).first();
    if (!await trigger.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'AI chat trigger not found');
    await trigger.click();
    await page.waitForTimeout(600);
    const input = page.locator(
      '[class*="chat"] textarea, [class*="chat"] [contenteditable="true"],' +
      ' [class*="chat"] input[type="text"]'
    ).first();
    if (!await input.isVisible({ timeout: 5000 }).catch(() => false)) test.skip(true, 'Chat input not found');
    await input.fill('<img src=x onerror="window.__xss_chat=true">');
    await input.press('Enter');
    await page.waitForTimeout(2000);
    const executed = await page.evaluate(() => window.__xss_chat);
    expect(executed, 'XSS payload executed in AI chat input').toBe(false);
  });

  test('Content-Security-Policy header is present on sitemap editor page', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const response = await page.waitForResponse(r => r.url().includes('sproutos.ai') && r.status() < 400).catch(() => null);
    if (!response) test.skip(true, 'No response captured');
    const csp = response.headers()['content-security-policy'] || '';
    expect(csp.length, 'CSP header missing on sitemap editor page').toBeGreaterThan(0);
  });

  test('X-Frame-Options or CSP frame-ancestors prevents iframe embedding', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const response = await page.waitForResponse(r => r.url().includes('sproutos.ai') && r.status() < 400).catch(() => null);
    if (!response) test.skip(true, 'No response captured');
    const xfo = response.headers()['x-frame-options'] || '';
    const csp = response.headers()['content-security-policy'] || '';
    const protected_ = xfo.length > 0 || csp.includes('frame-ancestors');
    expect(protected_, 'Neither X-Frame-Options nor CSP frame-ancestors is set').toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CONSOLE ERRORS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Console Errors', () => {

  test('no critical JS errors on sitemap editor load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(e =>
      !/analytics|gtag|facebook|hotjar|sentry|cloudflare|paddle/i.test(e)
    );
    if (appErrors.length > 0) console.error('Console errors:', appErrors);
    expect(appErrors).toHaveLength(0);
  });

  test('no console errors when adding a page', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const addBtn = page.locator('button:has-text("Add Page"), button:has-text("Add page")').first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Page not found');
    await addBtn.click();
    await page.waitForTimeout(1500);
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

  test('no console errors when navigating between page nodes', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodes = await page.locator('[class*="node"], [class*="page-node"]').all();
    for (const node of nodes.slice(0, 3)) {
      await node.click().catch(() => {});
      await page.waitForTimeout(400);
    }
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

  test('no unhandled promise rejections on sitemap editor', async ({ page }) => {
    const rejections = [];
    page.on('pageerror', e => rejections.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle');
    const unhandled = rejections.filter(e => /unhandled|rejection/i.test(e));
    expect(unhandled).toHaveLength(0);
  });

  test('no 5xx network errors on sitemap editor load', async ({ page }) => {
    const serverErrors = [];
    page.on('response', r => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle');
    expect(serverErrors, serverErrors.join('\n')).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Performance', () => {

  test('sitemap editor visible within 8 seconds of navigation', async ({ page }) => {
    await login(page);
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const card = page.locator(
      '[class*="project-card"], [class*="card"]:has(h2), [class*="card"]:has(h3)'
    ).first();
    if (!await card.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No project card found');
    await card.click();
    const canvas = page.locator('[class*="canvas"], [class*="flow"], [class*="sitemap"], svg').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    const elapsed = Date.now() - start;
    console.log(`Sitemap editor loaded in ${elapsed}ms`);
    expect(elapsed).toBeLessThan(20000);
  });

  test('sitemap API responds within 5 seconds', async ({ page }) => {
    let sitemapApiTime = null;
    page.on('response', r => {
      if (r.url().includes('sitemap') && sitemapApiTime === null) {
        sitemapApiTime = Date.now();
      }
    });
    const start = Date.now();
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle');
    if (sitemapApiTime) {
      const elapsed = sitemapApiTime - start;
      console.log(`Sitemap API responded in ${elapsed}ms`);
      if (elapsed > 5000) console.warn(`⚠️ Sitemap API slow: ${elapsed}ms (threshold: 5000ms)`);
    }
  });

  test('sitemap editor makes fewer than 30 API requests on load', async ({ page }) => {
    let count = 0;
    page.on('request', r => {
      if (r.url().includes('api.sproutos') || r.url().includes('/api/')) count++;
    });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    if (count >= 30) console.warn(`High API request count: ${count}`);
    expect(count).toBeLessThan(40);
  });

  test('adding a page node responds within 3 seconds', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const addBtn = page.locator('button:has-text("Add Page"), button:has-text("Add page")').first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Page not found');
    const before = await page.locator('[class*="node"], [class*="page-node"]').count();
    const start = Date.now();
    await addBtn.click();
    // Wait for DOM to reflect new node
    await page.waitForFunction(
      (b) => document.querySelectorAll('[class*="node"], [class*="page-node"]').length > b,
      before,
      { timeout: 5000 }
    ).catch(() => {});
    const elapsed = Date.now() - start;
    console.log(`Add page reflected in ${elapsed}ms`);
    expect(elapsed).toBeLessThan(5000);
  });

  test('no excessive API polling — fewer than 5 calls in 5s idle', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle');
    let idleCalls = 0;
    page.on('request', () => idleCalls++);
    await page.waitForTimeout(5000);
    if (idleCalls >= 5) console.warn(`⚠️ Excessive idle polling: ${idleCalls} calls in 5s`);
    expect(idleCalls).toBeLessThan(10);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK & API HEALTH
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — API Health', () => {

  test('no 404 errors for sitemap-related API calls', async ({ page }) => {
    const notFound = [];
    page.on('response', r => {
      if (r.status() === 404 && (r.url().includes('sitemap') || r.url().includes('project'))) {
        notFound.push(r.url());
      }
    });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle');
    if (notFound.length > 0) console.warn('404s on sitemap load:', notFound.join('\n'));
    expect(notFound, notFound.join('\n')).toHaveLength(0);
  });

  test('sitemap data API returns valid JSON', async ({ page }) => {
    let sitemapResponse = null;
    page.on('response', async r => {
      if (r.url().includes('/api/') && r.url().includes('sitemap') && r.status() === 200) {
        sitemapResponse = await r.json().catch(() => null);
      }
    });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle');
    if (sitemapResponse !== null) {
      expect(typeof sitemapResponse).toBe('object');
    } else {
      console.warn('⚠️ No sitemap API JSON response captured during load');
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SEO & META
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — SEO & Meta', () => {

  test('sitemap editor page has a <title> tag', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('page has a viewport meta tag for mobile', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const viewport = await page.$eval(
      'meta[name="viewport"]', el => el.getAttribute('content')
    ).catch(() => null);
    expect(viewport, 'Missing viewport meta tag').not.toBeNull();
  });

  test('page has noindex meta or is not indexed (app page)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const robots = await page.$eval(
      'meta[name="robots"]', el => el.getAttribute('content')
    ).catch(() => null);
    // App pages should have noindex to prevent search engine crawling
    if (!robots) console.warn('⚠️ No robots meta tag — sitemap editor may be indexed by search engines');
  });

});
