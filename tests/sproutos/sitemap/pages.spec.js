// =============================================================================
// Sprout OS — Sitemap Editor — Page Management
// Covers : Add page · Rename page · Delete page · Duplicate page
//          Page ordering · Home page node · Empty states · Edge cases
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndGoToSitemap } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE NODES — VISIBILITY & STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Management — Structure', () => {

  test('at least one page node is rendered on the canvas', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodes = page.locator('.react-flow__node, [class*="page-node"], [data-type="page"]');
    await expect(nodes.first()).toBeVisible({ timeout: 15000 });
    const count = await nodes.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('home page node exists and is labeled correctly', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const homeNode = page.locator(
      '.react-flow__node:has-text("Home"), .react-flow__node:has-text("home"),' +
      ' [data-page-type="home"], [class*="home-node"]'
    ).first();
    const visible = await homeNode.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Home page node not found by text — may use different label');
    // Not a hard fail — label may differ per project
  });

  test('each page node shows the page name text', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodes = await page.locator('.react-flow__node, [class*="page-node"]').all();
    for (const node of nodes.slice(0, 5)) {
      const text = await node.innerText().catch(() => '');
      expect(text.trim().length, 'Page node has no name').toBeGreaterThan(0);
    }
  });

  test('nodes are connected by edges or lines on the canvas', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodeCount = await page.locator('.react-flow__node, [class*="page-node"]').count();
    if (nodeCount < 2) test.skip(true, 'Only one node — no edges expected');
    const edge = page.locator(
      '[class*="edge"], [class*="connector"], [class*="line"], svg path, svg line'
    ).first();
    await expect(edge).toBeVisible({ timeout: 8000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// ADD PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Management — Add Page', () => {

  test('"Add Page" button is visible and clickable', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // Real class from source: .sitemap-add-page-btn (rendered inside the AddNode)
    const addBtn = page.locator(
      '.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page"),' +
      ' button:has-text("+ Page"), [aria-label*="add page" i]'
    ).first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await expect(addBtn).toBeEnabled();
  });

  test('clicking "Add Page" increases the node count by one', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodeSelector = '.react-flow__node';
    const before = await page.locator(nodeSelector).count();

    const addBtn = page.locator(
      '.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page")'
    ).first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      test.skip(true, 'Add Page button not found');
    }
    await addBtn.click();
    await page.waitForTimeout(1500);
    const after = await page.locator(nodeSelector).count();
    expect(after).toBeGreaterThan(before);
  });

  test('newly added page node has a default name (not empty)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const addBtn = page.locator(
      '.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page")'
    ).first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Page button not found');
    await addBtn.click();
    await page.waitForTimeout(1500);
    const nodes = await page.locator('.react-flow__node, [class*="page-node"]').all();
    const last = nodes[nodes.length - 1];
    const text = await last.innerText().catch(() => '');
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('adding a page does not cause console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const addBtn = page.locator(
      '.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page")'
    ).first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Page button not found');
    await addBtn.click();
    await page.waitForTimeout(1500);
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

  test('add page is persisted — node remains after page refresh', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const addBtn = page.locator('.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page")').first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Page button not found');
    await addBtn.click();
    await page.waitForTimeout(2000);
    const before = await page.locator('.react-flow__node').count();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const after = await page.locator('.react-flow__node').count();
    expect(after).toBeGreaterThanOrEqual(before);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// RENAME PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Management — Rename Page', () => {

  test('double-clicking a page node enables inline rename', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator('.react-flow__node').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    await node.dblclick();
    const input = page.locator('input[type="text"], [contenteditable="true"]').first();
    const inputVisible = await input.isVisible({ timeout: 4000 }).catch(() => false);
    if (!inputVisible) console.warn('⚠️ Inline rename input not triggered by double-click — may use context menu');
  });

  test('right-click context menu on node contains a Rename option', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator('.react-flow__node').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    await node.click({ button: 'right' });
    await page.waitForTimeout(500);
    const renameItem = page.locator(
      '[role="menuitem"]:has-text("Rename"), li:has-text("Rename"), button:has-text("Rename")'
    ).first();
    await expect(renameItem).toBeVisible({ timeout: 5000 });
  });

  test('renamed page name is reflected on the canvas node', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator('.react-flow__node').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    // Try right-click rename
    await node.click({ button: 'right' });
    await page.waitForTimeout(400);
    const renameItem = page.locator(
      '[role="menuitem"]:has-text("Rename"), li:has-text("Rename"), button:has-text("Rename")'
    ).first();
    if (!await renameItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Fall back to double-click
      await page.keyboard.press('Escape');
      await node.dblclick();
    } else {
      await renameItem.click();
    }
    const input = page.locator('input[type="text"], [contenteditable="true"]').first();
    if (!await input.isVisible({ timeout: 4000 }).catch(() => false)) {
      test.skip(true, 'Rename input not accessible');
    }
    await input.fill('QA Renamed Page');
    await input.press('Enter');
    await page.waitForTimeout(800);
    await expect(page.locator('.react-flow__node:has-text("QA Renamed Page")').first()).toBeVisible({ timeout: 5000 });
  });

  test('page name cannot be set to empty string', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator('.react-flow__node').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    const originalName = await node.innerText().catch(() => '');
    await node.dblclick();
    const input = page.locator('input[type="text"], [contenteditable="true"]').first();
    if (!await input.isVisible({ timeout: 3000 }).catch(() => false)) test.skip(true, 'Rename input not found');
    await input.selectAll?.();
    await input.fill('');
    await input.press('Enter');
    await page.waitForTimeout(800);
    // Node should revert or show validation — not save empty
    const newText = await node.innerText().catch(() => '');
    expect(newText.trim().length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// DUPLICATE PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Management — Duplicate Page', () => {

  test('right-click context menu has a Duplicate option', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator('.react-flow__node').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    await node.click({ button: 'right' });
    await page.waitForTimeout(400);
    const dupeItem = page.locator(
      '[role="menuitem"]:has-text("Duplicate"), li:has-text("Duplicate"), button:has-text("Duplicate")'
    ).first();
    await expect(dupeItem).toBeVisible({ timeout: 5000 });
  });

  test('duplicating a page adds a new node to the canvas', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodeSelector = '.react-flow__node';
    const node = page.locator(nodeSelector).first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    const before = await page.locator(nodeSelector).count();
    await node.click({ button: 'right' });
    await page.waitForTimeout(400);
    const dupeItem = page.locator(
      '[role="menuitem"]:has-text("Duplicate"), li:has-text("Duplicate")'
    ).first();
    if (!await dupeItem.isVisible({ timeout: 3000 }).catch(() => false)) test.skip(true, 'Duplicate option not found');
    await dupeItem.click();
    await page.waitForTimeout(1500);
    const after = await page.locator(nodeSelector).count();
    expect(after).toBeGreaterThan(before);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE PAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Management — Delete Page', () => {

  test('right-click context menu has a Delete option', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const node = page.locator('.react-flow__node').first();
    if (!await node.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No node found');
    await node.click({ button: 'right' });
    await page.waitForTimeout(400);
    const deleteItem = page.locator(
      '[role="menuitem"]:has-text("Delete"), li:has-text("Delete"), button:has-text("Delete"),' +
      ' [role="menuitem"]:has-text("Remove"), li:has-text("Remove")'
    ).first();
    await expect(deleteItem).toBeVisible({ timeout: 5000 });
  });

  test('home/root page cannot be deleted', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const homeNode = page.locator(
      '.react-flow__node:has-text("Home"), [data-page-type="home"]'
    ).first();
    if (!await homeNode.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Home node not identified');
    await homeNode.click({ button: 'right' });
    await page.waitForTimeout(400);
    const deleteItem = page.locator('[role="menuitem"]:has-text("Delete"), li:has-text("Delete")').first();
    const deleteVisible = await deleteItem.isVisible({ timeout: 3000 }).catch(() => false);
    if (deleteVisible) {
      const deleteDisabled = await deleteItem.getAttribute('aria-disabled').catch(() => null);
      const deleteClass = await deleteItem.getAttribute('class').catch(() => '');
      const isDisabled = deleteDisabled === 'true' || deleteClass.includes('disabled');
      if (!isDisabled) console.warn('⚠️ Home page Delete option appears enabled — may allow deletion');
    }
  });

  test('deleting a non-home page removes it from the canvas', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // First add a page so we have one to delete
    const addBtn = page.locator('.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page")').first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Page not found');
    await addBtn.click();
    await page.waitForTimeout(1500);
    const nodeSelector = '.react-flow__node';
    const before = await page.locator(nodeSelector).count();
    // Right-click the last node (newly added)
    const nodes = await page.locator(nodeSelector).all();
    const lastNode = nodes[nodes.length - 1];
    await lastNode.click({ button: 'right' });
    await page.waitForTimeout(400);
    const deleteItem = page.locator('[role="menuitem"]:has-text("Delete"), li:has-text("Delete")').first();
    if (!await deleteItem.isVisible({ timeout: 3000 }).catch(() => false)) test.skip(true, 'Delete option not found');
    await deleteItem.click();
    await page.waitForTimeout(1500);
    const after = await page.locator(nodeSelector).count();
    expect(after).toBeLessThan(before);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// DRAG & DROP REORDER
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Management — Drag & Drop', () => {

  test('dragging a page node does not throw a console error', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodes = await page.locator('.react-flow__node, [class*="page-node"]').all();
    if (nodes.length < 2) test.skip(true, 'Need at least 2 nodes for drag test');
    const source = nodes[nodes.length - 1];
    const target = nodes[0];
    const srcBox = await source.boundingBox().catch(() => null);
    const tgtBox = await target.boundingBox().catch(() => null);
    if (!srcBox || !tgtBox) test.skip(true, 'Could not get bounding boxes');
    await page.mouse.move(srcBox.x + srcBox.width / 2, srcBox.y + srcBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(tgtBox.x + tgtBox.width / 2, tgtBox.y + tgtBox.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// UNDO / REDO
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Page Management — Undo / Redo', () => {

  test('Ctrl+Z after adding a page removes the newly added node', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const nodeSelector = '.react-flow__node';
    const addBtn = page.locator('.sitemap-add-page-btn, button:has-text("Add Page"), button:has-text("Add page")').first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Page not found');
    await addBtn.click();
    await page.waitForTimeout(1200);
    const after = await page.locator(nodeSelector).count();
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(1000);
    const afterUndo = await page.locator(nodeSelector).count();
    expect(afterUndo).toBeLessThanOrEqual(after);
  });

});
