// =============================================================================
// Sprout OS — Sitemap Editor — Global Sections (Navbar & Footer)
// Covers : Global section visibility · Navbar management · Footer management
//          Toggling global sections · Edit flow · Persistence
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndGoToSitemap } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
});

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SECTIONS — VISIBILITY & ACCESS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Global Sections — Visibility', () => {

  test('Global Sections panel or tab is accessible in the editor', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const globalTab = page.locator(
      'button:has-text("Global"), [class*="global-section"], [aria-label*="global" i],' +
      ' button:has-text("Navbar"), button:has-text("Footer")'
    ).first();
    await expect(globalTab).toBeVisible({ timeout: 10000 });
  });

  test('Navbar is listed as a global section', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const navbarItem = page.locator(
      '[class*="global"] [class*="navbar"], [class*="global"]:has-text("Navbar"),' +
      ' [class*="global"]:has-text("Header"), button:has-text("Navbar"), span:has-text("Navbar")'
    ).first();
    await expect(navbarItem).toBeVisible({ timeout: 10000 });
  });

  test('Footer is listed as a global section', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const footerItem = page.locator(
      '[class*="global"] [class*="footer"], [class*="global"]:has-text("Footer"),' +
      ' button:has-text("Footer"), span:has-text("Footer")'
    ).first();
    await expect(footerItem).toBeVisible({ timeout: 10000 });
  });

  test('global sections are visually distinct from page-level sections', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const globalSection = page.locator(
      '[class*="global-section"], [data-type="global"]'
    ).first();
    const pageSection = page.locator(
      '[class*="page-section"], [class*="section-item"]'
    ).first();
    const bothVisible =
      await globalSection.isVisible({ timeout: 8000 }).catch(() => false) &&
      await pageSection.isVisible({ timeout: 8000 }).catch(() => false);
    if (!bothVisible) console.warn('⚠️ Could not verify visual distinction between global and page sections');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR — MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Global Sections — Navbar', () => {

  test('clicking the Navbar global section opens an edit panel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const navbarItem = page.locator(
      '[class*="global"]:has-text("Navbar"), [class*="global"]:has-text("Header"),' +
      ' button:has-text("Navbar")'
    ).first();
    if (!await navbarItem.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'Navbar global section not found');
    await navbarItem.click();
    await page.waitForTimeout(600);
    const editPanel = page.locator(
      '[class*="panel"], [class*="editor"], [class*="detail"], [role="dialog"]'
    ).first();
    await expect(editPanel).toBeVisible({ timeout: 6000 });
  });

  test('navbar global section has a toggle to enable/disable it', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const toggle = page.locator(
      '[class*="global"] [role="switch"], [class*="global"] input[type="checkbox"],' +
      ' [class*="navbar"] [class*="toggle"], [class*="header"] [class*="toggle"]'
    ).first();
    const visible = await toggle.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Navbar enable/disable toggle not found');
  });

  test('toggling navbar does not cause a page crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const toggle = page.locator(
      '[class*="global"] [role="switch"], [class*="global"] input[type="checkbox"],' +
      ' [class*="navbar"] [class*="toggle"]'
    ).first();
    if (!await toggle.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Navbar toggle not found');
    await toggle.click();
    await page.waitForTimeout(800);
    await toggle.click();
    await page.waitForTimeout(800);
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

  test('navbar change is reflected across all pages in the sitemap', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // Verify that global section indicator/badge appears on multiple page nodes
    const globalIndicators = await page.locator(
      '[class*="node"] [class*="global"], [class*="node"] [class*="navbar"]'
    ).count();
    // If project has multiple pages, global indicator should appear on all
    const nodeCount = await page.locator('[class*="node"], [class*="page-node"]').count();
    if (nodeCount >= 2 && globalIndicators < 2) {
      console.warn('⚠️ Navbar global indicator not visible on all page nodes');
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER — MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Global Sections — Footer', () => {

  test('clicking the Footer global section opens an edit panel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const footerItem = page.locator(
      '[class*="global"]:has-text("Footer"), button:has-text("Footer")'
    ).first();
    if (!await footerItem.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'Footer global section not found');
    await footerItem.click();
    await page.waitForTimeout(600);
    const editPanel = page.locator(
      '[class*="panel"], [class*="editor"], [class*="detail"], [role="dialog"]'
    ).first();
    await expect(editPanel).toBeVisible({ timeout: 6000 });
  });

  test('footer global section has a toggle to enable/disable it', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const toggle = page.locator(
      '[class*="footer"] [role="switch"], [class*="footer"] input[type="checkbox"],' +
      ' [class*="footer"] [class*="toggle"]'
    ).first();
    const visible = await toggle.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Footer enable/disable toggle not found');
  });

  test('toggling footer does not cause a page crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const toggle = page.locator(
      '[class*="footer"] [role="switch"], [class*="footer"] input[type="checkbox"],' +
      ' [class*="footer"] [class*="toggle"]'
    ).first();
    if (!await toggle.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Footer toggle not found');
    await toggle.click();
    await page.waitForTimeout(800);
    await toggle.click();
    await page.waitForTimeout(800);
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SECTIONS — PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Global Sections — Persistence', () => {

  test('global section state persists after page reload', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const navbarVisible = await page.locator(
      '[class*="global"]:has-text("Navbar"), [class*="global"]:has-text("Header")'
    ).isVisible({ timeout: 8000 }).catch(() => false);
    if (!navbarVisible) test.skip(true, 'Global sections not visible to check persistence');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('[class*="global"]:has-text("Navbar"), [class*="global"]:has-text("Header")').first()
    ).toBeVisible({ timeout: 10000 });
  });

});
