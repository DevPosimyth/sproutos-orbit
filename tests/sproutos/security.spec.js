// =============================================================================
// Sprout OS — Security Headers Test Suite
// Covers: CSP · HSTS · X-Frame-Options · X-Content-Type-Options · Referrer-Policy
// =============================================================================

const { test, expect } = require('@playwright/test');

test.describe('Sprout OS — Security Headers', () => {

  test('HSTS header is set', async ({ page }) => {
    const response = await page.goto('/');
    const hsts = response.headers()['strict-transport-security'];
    expect(hsts).toBeTruthy();
    expect(hsts).toMatch(/max-age=\d+/);
  });

  test('X-Content-Type-Options is nosniff', async ({ page }) => {
    const response = await page.goto('/');
    const header = response.headers()['x-content-type-options'];
    expect(header?.toLowerCase()).toBe('nosniff');
  });

  test('X-Frame-Options prevents clickjacking', async ({ page }) => {
    const response = await page.goto('/');
    const xfo = response.headers()['x-frame-options'];
    const csp = response.headers()['content-security-policy'];
    // Either X-Frame-Options or CSP frame-ancestors should be set
    const hasFrameProtection =
      (xfo && /deny|sameorigin/i.test(xfo)) ||
      (csp && /frame-ancestors/i.test(csp));
    expect(hasFrameProtection).toBeTruthy();
  });

  test('Referrer-Policy is set', async ({ page }) => {
    const response = await page.goto('/');
    const refPolicy = response.headers()['referrer-policy'];
    expect(refPolicy).toBeTruthy();
  });

  test('Content-Security-Policy header exists (if enforced)', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response.headers()['content-security-policy'];
    if (csp) {
      expect(csp.length).toBeGreaterThan(10);
    } else {
      test.skip(true, 'CSP not enforced (soft skip)');
    }
  });

  test('server does not leak platform version', async ({ page }) => {
    const response = await page.goto('/');
    const server = response.headers()['server'] || '';
    const poweredBy = response.headers()['x-powered-by'] || '';
    // Fail only if specific version numbers are exposed
    expect(server).not.toMatch(/\d+\.\d+\.\d+/);
    expect(poweredBy).not.toMatch(/\d+\.\d+\.\d+/);
  });

  test('HTTPS enforced — HTTP should redirect', async ({ request }) => {
    const httpUrl = (process.env.SPROUTOS_URL || 'https://sproutos.ai').replace('https://', 'http://');
    const response = await request.get(httpUrl, { maxRedirects: 0 }).catch(() => null);
    if (response) {
      // Should be a 3xx redirect to https
      expect([301, 302, 307, 308]).toContain(response.status());
      const location = response.headers()['location'];
      expect(location).toMatch(/^https:/);
    }
  });
});
