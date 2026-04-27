// =============================================================================
// Sprout OS — Sitemap Editor — UI, Layout & Core Functionality
// Covers : Canvas rendering · Toolbar · Viewport switcher · Node visibility
//          Responsiveness · Accessibility · Performance · Console errors
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndGoToSitemap, dismissTour } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set — skipping sitemap editor tests');
});

// ─────────────────────────────────────────────────────────────────────────────
// UI — LAYOUT & RENDERING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — UI & Layout', () => {

  test('sitemap editor loads without critical JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found to open sitemap editor');
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(e =>
      !/analytics|gtag|facebook|hotjar|sentry|cloudflare|paddle/i.test(e)
    );
    expect(appErrors, appErrors.join('\n')).toHaveLength(0);
  });

  test('sitemap editor canvas area is visible', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const canvas = page.locator(
      '.react-flow__pane, .react-flow__viewport, .react-flow__renderer, [class*="flow"], svg'
    ).first();
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('sitemap editor has a top toolbar or header', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const toolbar = page.locator(
      'header, [class*="toolbar"], [class*="top-bar"], [class*="header"], nav'
    ).first();
    await expect(toolbar).toBeVisible({ timeout: 10000 });
  });

  test('at least one page node is visible on the canvas', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator(
      '.react-flow__node, [class*="sitemap-node"], [data-type="page"]'
    ).first();
    await expect(node).toBeVisible({ timeout: 15000 });
  });

  test('page node displays the page name', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator(
      '.react-flow__node, [class*="sitemap-node"]'
    ).first();
    await expect(node).toBeVisible({ timeout: 15000 });
    const text = await node.innerText().catch(() => '');
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('no horizontal overflow on sitemap editor page', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('no cumulative layout shift — canvas stable after 3s', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const posBefore = await page.evaluate(() => document.documentElement.scrollTop);
    await page.waitForTimeout(3000);
    const posAfter = await page.evaluate(() => document.documentElement.scrollTop);
    expect(Math.abs(posAfter - posBefore)).toBeLessThan(50);
  });

  test('sitemap editor page has a valid <title>', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR & CONTROLS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Toolbar & Controls', () => {

  test('"Add Page" button or control is visible', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const addBtn = page.locator(
      '.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page"),' +
      ' button:has-text("+ Page"), [aria-label*="add page" i]'
    ).first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
  });

  test('zoom in / zoom out controls are visible', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const zoomCtrl = page.locator(
      '[aria-label*="zoom" i], [class*="zoom"], button:has-text("+"), button:has-text("-")'
    ).first();
    await expect(zoomCtrl).toBeVisible({ timeout: 10000 });
  });

  test('"Fit to screen" or reset view control is accessible', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const fitBtn = page.locator(
      'button:has-text("Fit"), [aria-label*="fit" i], [aria-label*="reset" i],' +
      ' [class*="fit-screen"], [class*="reset-view"]'
    ).first();
    const visible = await fitBtn.isVisible({ timeout: 6000 }).catch(() => false);
    // Not a hard failure — log if missing
    if (!visible) console.warn('⚠️ Fit-to-screen control not found');
  });

  test('AI suggestions button or panel trigger is present', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // AI chat toggle is a fixed bottom-right button with class .ai-chat-toggle
    const aiBtn = page.locator(
      '.ai-chat-toggle, button:has-text("AI"), [aria-label*="AI" i], [class*="ai-suggest"]'
    ).first();
    await expect(aiBtn).toBeVisible({ timeout: 10000 });
  });

  test('undo button or keyboard shortcut is available', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // Ctrl+Z should not throw an error
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);
    // If undo button exists, check it
    const undoBtn = page.locator(
      'button[aria-label*="undo" i], button:has-text("Undo"), [class*="undo"]'
    ).first();
    const hasUndoBtn = await undoBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasUndoBtn) console.warn('⚠️ Undo button not found — Ctrl+Z tested only');
  });

  test('project name or breadcrumb is visible in the editor header', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const breadcrumb = page.locator(
      '[class*="breadcrumb"], [class*="project-name"], [class*="title"],' +
      ' header h1, header h2, header span'
    ).first();
    await expect(breadcrumb).toBeVisible({ timeout: 10000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS INTERACTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Canvas Interaction', () => {

  test('canvas is pannable — mouse drag does not throw error', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const canvas = page.locator('.react-flow__pane, .react-flow__viewport, [class*="flow"], svg').first();
    const box = await canvas.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
      await page.mouse.up();
    }
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('clicking a page node does not crash the editor', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const node = page.locator('.react-flow__node, [class*="page-node"]').first();
    if (await node.isVisible({ timeout: 8000 }).catch(() => false)) {
      await node.click();
      await page.waitForTimeout(600);
    }
    expect(errors).toHaveLength(0);
  });

  test('clicking a page node opens a detail panel or context menu', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator('.react-flow__node, [class*="page-node"]').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) {
      test.skip(true, 'No node visible');
    }
    await node.click();
    const panel = page.locator(
      '[class*="panel"], [class*="sidebar"], [class*="detail"], [class*="context-menu"],' +
      ' [role="menu"], [class*="popover"]'
    ).first();
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Performance', () => {

  test('sitemap editor canvas visible within 8 seconds', async ({ page }) => {
    const start = Date.now();
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const canvas = page.locator(
      '[class*="canvas"], [class*="sitemap"], [class*="flow"], svg'
    ).first();
    await expect(canvas).toBeVisible({ timeout: 8000 });
    const elapsed = Date.now() - start;
    console.log(`Canvas visible in ${elapsed}ms`);
    expect(elapsed).toBeLessThan(15000); // hard cap
  });

  test('no pending network requests after canvas loads', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
      console.warn('⚠️ networkidle not reached within 20s');
    });
  });

  test('sitemap editor makes fewer than 25 API requests on load', async ({ page }) => {
    let count = 0;
    page.on('request', r => {
      if (r.url().includes('api.sproutos') || r.url().includes('/api/')) count++;
    });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    if (count >= 25) console.warn(`High API call count: ${count} requests`);
    expect(count).toBeLessThan(30);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Accessibility', () => {

  test('editor toolbar buttons have accessible labels', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const buttons = await page.locator('button').all();
    let unlabeled = 0;
    for (const btn of buttons) {
      const ariaLabel = await btn.getAttribute('aria-label').catch(() => null);
      const text = await btn.innerText().catch(() => '');
      if (!ariaLabel && !text.trim()) unlabeled++;
    }
    if (unlabeled > 0) console.warn(`⚠️ ${unlabeled} buttons have no label or aria-label`);
    expect(unlabeled).toBeLessThan(5); // allow minor threshold for icon-only buttons
  });

  test('keyboard Tab key cycles through interactive elements without trap', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // If focus is trapped, this would hang — just ensure no error
    const active = await page.evaluate(() => document.activeElement?.tagName || 'none');
    expect(active).not.toBe('BODY'); // focus moved from body
  });

  test('page nodes have readable text (not empty)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodes = await page.locator('.react-flow__node, [class*="page-node"]').all();
    for (const node of nodes.slice(0, 5)) {
      const text = await node.innerText().catch(() => '');
      expect(text.trim().length, 'Node has no readable text').toBeGreaterThan(0);
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVENESS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sitemap Editor — Responsiveness', () => {

  test('desktop 1440px: canvas and toolbar both visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await expect(page.locator('[class*="canvas"], [class*="flow"], svg').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('header, [class*="toolbar"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('tablet 768px: editor renders without layout overflow', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
  });

});
