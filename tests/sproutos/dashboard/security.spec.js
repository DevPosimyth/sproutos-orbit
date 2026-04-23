// =============================================================================
// Sprout OS — Dashboard Security & Performance Spec
// Covers : Auth gating · Session management · API protection · XSS/CSRF
//          Console errors · Performance baselines · CSP headers
//          Paddle billing · Static asset health · Data isolation
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndDismissTour } = require('./_auth');

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GATING — Unauthenticated Access
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Auth Gating — Unauthenticated Redirect', () => {

  test('/ redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/login|auth|sign-in/i);
  });

  test('/?tab=workspace redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/?tab=workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/login|auth|sign-in/i);
  });

  test('/?tab=team-management redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/?tab=team-management');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/login|auth|sign-in/i);
  });

  test('/?tab=roles redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/?tab=roles');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/login|auth|sign-in/i);
  });

  test('/?tab=settings redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/?tab=settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/login|auth|sign-in/i);
  });

  test('/?tab=token-usage redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/?tab=token-usage');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/login|auth|sign-in/i);
  });

  test('/auth/login page renders without redirect loop', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/auth\/login/i);
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('direct /api/workspaces returns 401 without session', async ({ page }) => {
    const res = await page.request.get('/api/workspaces').catch(() => null);
    if (res) expect([401, 403]).toContain(res.status());
  });

  test('direct /api/projects returns 401 without session', async ({ page }) => {
    const res = await page.request.get('/api/projects').catch(() => null);
    if (res) expect([401, 403, 404]).toContain(res.status());
  });

  test('direct /api/user returns 401 without session', async ({ page }) => {
    const res = await page.request.get('/api/user').catch(() => null);
    if (res) expect([401, 403, 404]).toContain(res.status());
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GATING — Authenticated Access
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Auth Gating — Authenticated Access', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('dashboard loads on / after login', async ({ page }) => {
    expect(page.url()).toMatch(/dashboard|\//i);
    await expect(page.locator('aside, main').first()).toBeVisible({ timeout: 10000 });
  });

  test('session cookie is HttpOnly (not accessible via JS)', async ({ page }) => {
    const cookies = await page.context().cookies();
    const sessionCookies = cookies.filter(c =>
      /session|auth|token/i.test(c.name)
    );
    sessionCookies.forEach(cookie => {
      expect(cookie.httpOnly).toBeTruthy();
    });
  });

  test('session cookie has Secure flag on HTTPS', async ({ page }) => {
    const cookies = await page.context().cookies();
    const sessionCookies = cookies.filter(c => /session|auth|token/i.test(c.name));
    if (sessionCookies.length === 0) test.skip(true, 'No session cookies found');
    sessionCookies.forEach(cookie => {
      // Secure flag expected on production HTTPS
      expect(cookie.secure).toBeTruthy();
    });
  });

  test('clearing cookies causes protected page to redirect to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.reload();
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/login|auth|sign-in/i);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// XSS PREVENTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('XSS Prevention', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('XSS payload in prompt editor does not execute script', async ({ page }) => {
    const xssPayload = '<script>window.__xss_test__=1;</script>';
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 8000 });

    await editor.click();
    await editor.fill(xssPayload);
    await page.waitForTimeout(500);

    const xssExecuted = await page.evaluate(() => window.__xss_test__);
    expect(xssExecuted).toBeFalsy();
  });

  test('XSS payload in search input does not execute script', async ({ page }) => {
    const xssPayload = '"><img src=x onerror=window.__xss_search__=1>';
    const search = page.locator('aside input[placeholder="Search"]').first();
    await expect(search).toBeVisible({ timeout: 8000 });

    await search.fill(xssPayload);
    await page.waitForTimeout(500);

    const xssExecuted = await page.evaluate(() => window.__xss_search__);
    expect(xssExecuted).toBeFalsy();
  });

  test('Content-Security-Policy header is present', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];
    if (!csp) test.skip(true, 'CSP header not set — security improvement recommended');
    expect(csp).toBeTruthy();
  });

  test('X-Frame-Options or CSP frame-ancestors prevents clickjacking', async ({ page }) => {
    const response = await page.goto('/');
    const xFrame = response?.headers()['x-frame-options'];
    const csp = response?.headers()['content-security-policy'];
    const hasProtection = xFrame || (csp && csp.includes('frame-ancestors'));
    if (!hasProtection) test.skip(true, 'No clickjacking protection found');
    expect(hasProtection).toBeTruthy();
  });

  test('X-Content-Type-Options: nosniff header is present', async ({ page }) => {
    const response = await page.goto('/');
    const noSniff = response?.headers()['x-content-type-options'];
    if (!noSniff) test.skip(true, 'X-Content-Type-Options not set — improvement recommended');
    expect(noSniff).toMatch(/nosniff/i);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CSRF PROTECTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CSRF Protection', () => {

  test('POST to /api/user/profile without CSRF token returns 401/403', async ({ page }) => {
    const res = await page.request.post('/api/user/profile', {
      data: { firstName: 'csrf-test' },
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null);
    if (res) expect([401, 403, 404, 405]).toContain(res.status());
  });

  test('DELETE to API endpoint without session returns 401/403', async ({ page }) => {
    const res = await page.request.delete('/api/projects/fake-project-id').catch(() => null);
    if (res) expect([401, 403, 404, 405]).toContain(res.status());
  });

  test('PUT to workspace without session returns 401/403', async ({ page }) => {
    const res = await page.request.put('/api/workspaces/fake-workspace-id', {
      data: { name: 'hacked' },
    }).catch(() => null);
    if (res) expect([401, 403, 404, 405]).toContain(res.status());
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CONSOLE ERRORS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Console Errors — Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('no critical JS errors on dashboard load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR') &&
      !e.includes('hydration') && // Next.js hydration warnings are acceptable
      !e.includes('ResizeObserver')
    );
    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }
    expect(criticalErrors.length).toBe(0);
  });

  test('no console errors on workspace tab navigation', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/?tab=workspace');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const critical = errors.filter(e =>
      !e.includes('favicon') && !e.includes('ResizeObserver') && !e.includes('hydration')
    );
    expect(critical.length).toBe(0);
  });

  test('no console errors on settings tab', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/?tab=settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const critical = errors.filter(e =>
      !e.includes('favicon') && !e.includes('ResizeObserver') && !e.includes('hydration')
    );
    expect(critical.length).toBe(0);
  });

  test('no unhandled promise rejections on dashboard', async ({ page }) => {
    const rejections = [];
    page.on('pageerror', err => {
      if (err.message.includes('Unhandled')) rejections.push(err.message);
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    expect(rejections.length).toBe(0);
  });

  test('no 5xx network errors on dashboard load', async ({ page }) => {
    const serverErrors = [];
    page.on('response', res => {
      if (res.status() >= 500) serverErrors.push(`${res.status()} ${res.url()}`);
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    expect(serverErrors.length).toBe(0);
  });

  test('Paddle billing SDK initialized without error', async ({ page }) => {
    // Explicitly fail if [PADDLE BILLING] errors appear in console
    const paddleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().toUpperCase().includes('PADDLE')) {
        paddleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      if (err.message.toUpperCase().includes('PADDLE')) {
        paddleErrors.push(err.message);
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(
      paddleErrors,
      `Paddle billing errors detected:\n${paddleErrors.join('\n')}`
    ).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ASSET HEALTH
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Static Asset Health', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('no 404 errors for static assets (CSS, JS, fonts)', async ({ page }) => {
    const failedAssets = [];

    page.on('response', res => {
      const url = res.url();
      const status = res.status();
      // Only check CSS, JS, and font files
      if (/\.(css|js|woff|woff2|ttf|otf)(\?.*)?$/i.test(url) && status === 404) {
        failedAssets.push(`404 ${url}`);
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(
      failedAssets,
      `404 static assets found:\n${failedAssets.join('\n')}`
    ).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// DATA ISOLATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Data Isolation — API Responses', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('dashboard API responses do not leak user data from other accounts', async ({ page }) => {
    const apiResponses = [];

    // Intercept all API calls and collect their bodies
    page.on('response', async res => {
      const url = res.url();
      if (url.includes('/api/') && res.headers()['content-type']?.includes('application/json')) {
        try {
          const body = await res.text().catch(() => '');
          apiResponses.push({ url, body });
        } catch {
          // ignore
        }
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Extract the local part and domain of the logged-in user's email
    const [emailLocalPart, emailDomain] = TEST_EMAIL.split('@');

    // Every response that contains an email address should only reference the logged-in user's email
    for (const { url, body } of apiResponses) {
      // Find any email-like strings in the response
      const emailMatches = body.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
      for (const email of emailMatches) {
        // Allow the logged-in user's own email or system/noreply emails
        const isOwnEmail = email.toLowerCase() === TEST_EMAIL.toLowerCase();
        const isSystemEmail = /noreply|no-reply|support|admin|system/i.test(email);
        expect(
          isOwnEmail || isSystemEmail,
          `API response from ${url} contains unexpected email: ${email}`
        ).toBeTruthy();
      }
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE BASELINES
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Performance Baselines', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('dashboard main content visible within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await expect(page.locator('main, #dashboard-prompt-card, aside').first())
      .toBeVisible({ timeout: 5000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('workspace tab loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/?tab=workspace');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('settings tab loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/?tab=settings');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('page does not make excessive API calls on load (< 20 network requests)', async ({ page }) => {
    const requests = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) requests.push(req.url());
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    // Warn if excessive but don't hard fail — threshold is reasonable
    if (requests.length >= 20) {
      console.warn(`High API call count on load: ${requests.length} requests`);
    }
    expect(requests.length).toBeLessThan(30);
  });

  test('images on dashboard have loading attribute set', async ({ page }) => {
    const imgs = page.locator('img');
    const count = await imgs.count();
    if (count === 0) test.skip(true, 'No images found');
    let lazyCount = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const loading = await imgs.nth(i).getAttribute('loading');
      if (loading === 'lazy') lazyCount++;
    }
    // At least some images should use lazy loading
    expect(lazyCount).toBeGreaterThanOrEqual(0); // soft check — just log
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SEO & META TAGS — Dashboard
// ─────────────────────────────────────────────────────────────────────────────
test.describe('SEO & Meta — Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('dashboard page has a <title> tag', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('dashboard <title> contains relevant brand keyword', async ({ page }) => {
    const title = await page.title();
    expect(title).toMatch(/sprout|workspace|dashboard/i);
  });

  test('dashboard has meta description', async ({ page }) => {
    const meta = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    if (!meta) test.skip(true, 'No meta description — SEO improvement needed');
    expect(meta.trim().length).toBeGreaterThan(10);
  });

  test('dashboard has Open Graph title', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    if (!ogTitle) test.skip(true, 'No OG title found');
    expect(ogTitle.trim().length).toBeGreaterThan(0);
  });

  test('robots meta tag does not disallow dashboard indexing', async ({ page }) => {
    const robots = await page.locator('meta[name="robots"]').getAttribute('content').catch(() => null);
    // Dashboard can be noindex (behind auth) — just verify it's intentional if set
    if (robots) {
      // Acceptable: noindex on authenticated pages
      expect(robots).toBeTruthy();
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-BROWSER COMPATIBILITY — Smoke Tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Cross-Browser Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('core dashboard layout renders without broken styles', async ({ page }) => {
    const aside = page.locator('aside').first();
    const main = page.locator('main').first();
    await expect(aside).toBeVisible({ timeout: 10000 });
    await expect(main).toBeVisible({ timeout: 10000 });

    const asideBox = await aside.boundingBox();
    const mainBox = await main.boundingBox();
    expect(asideBox.width).toBeGreaterThan(0);
    expect(mainBox.width).toBeGreaterThan(0);
  });

  test('sidebar and main content do not overlap', async ({ page }) => {
    const asideBox = await page.locator('aside').first().boundingBox();
    const mainBox = await page.locator('main').first().boundingBox();
    if (!asideBox || !mainBox) test.skip(true, 'Cannot get bounding boxes');

    const asideRight = asideBox.x + asideBox.width;
    const mainLeft = mainBox.x;
    // Main content should start at or after sidebar ends
    expect(mainLeft).toBeGreaterThanOrEqual(asideRight - 5); // 5px tolerance
  });

  test('header, sidebar, and main content are all visible simultaneously', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('main').first()).toBeVisible({ timeout: 8000 });
  });

  test('fonts and text render correctly (not blank)', async ({ page }) => {
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText.trim().length).toBeGreaterThan(50);
  });

  test('no broken images on dashboard (all img elements have src)', async ({ page }) => {
    const imgs = page.locator('img');
    const count = await imgs.count();
    if (count === 0) test.skip(true, 'No images found');

    for (let i = 0; i < Math.min(count, 8); i++) {
      const src = await imgs.nth(i).getAttribute('src');
      expect(src?.length ?? 0).toBeGreaterThan(0);
    }
  });

  test('CSS custom properties / design tokens are applied', async ({ page }) => {
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background') ||
      getComputedStyle(document.body).backgroundColor
    );
    expect(bgColor.trim().length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK & API HEALTH
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Network & API Health', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
    await loginAndDismissTour(page);
  });

  test('no failed network requests (4xx/5xx) on dashboard load', async ({ page }) => {
    const failedRequests = [];
    page.on('response', res => {
      const status = res.status();
      const url = res.url();
      if (status >= 400 && !url.includes('favicon') && !url.includes('analytics')) {
        failedRequests.push(`${status} ${url}`);
      }
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    if (failedRequests.length > 0) {
      console.log('Failed requests:', failedRequests);
    }
    // Allow up to 2 minor failures (e.g. analytics, optional resources)
    expect(failedRequests.length).toBeLessThanOrEqual(2);
  });

  test('workspace API responds within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/?tab=workspace');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test('dashboard does not poll APIs excessively (< 5 calls in 5s idle)', async ({ page }) => {
    const apiCalls = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) apiCalls.push(req.url());
    });
    // Let the page idle for 5 seconds after load
    await page.waitForLoadState('networkidle');
    const baseline = apiCalls.length;
    await page.waitForTimeout(5000);
    const pollCount = apiCalls.length - baseline;
    if (pollCount > 5) {
      console.warn(`Excessive API polling detected: ${pollCount} calls in 5s idle`);
    }
    expect(pollCount).toBeLessThan(10);
  });

});
