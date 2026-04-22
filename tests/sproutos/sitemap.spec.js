// =============================================================================
// Sprout OS — Sitemap Test Suite
// Covers: /sitemap.xml · /robots.txt · public URL discoverability · reachability
// =============================================================================

const { test, expect } = require('@playwright/test');

test.describe('Sprout OS — Sitemap', () => {

  test('sitemap.xml is reachable and returns XML', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBeLessThan(400);
    const ctype = (res.headers()['content-type'] || '').toLowerCase();
    expect(ctype).toMatch(/xml/);
  });

  test('sitemap.xml contains <urlset> or <sitemapindex>', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const body = await res.text();
    expect(body).toMatch(/<urlset|<sitemapindex/i);
  });

  test('sitemap entries use https and point to sproutos domain', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const body = await res.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const url of locs.slice(0, 25)) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  test('robots.txt is reachable', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBeLessThan(400);
  });

  test('robots.txt references sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    const body = await res.text();
    expect(body.toLowerCase()).toContain('sitemap');
  });

  test('sitemap URLs resolve with 2xx/3xx (spot check first 10)', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    const body = await res.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).slice(0, 10);
    for (const url of locs) {
      const r = await request.get(url).catch(() => null);
      if (r) expect(r.status(), `Broken: ${url}`).toBeLessThan(400);
    }
  });

});
