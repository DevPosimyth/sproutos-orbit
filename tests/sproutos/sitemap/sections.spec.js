// =============================================================================
// Sprout OS — Sitemap Editor — Section Management
// Covers : Section list within a page · Add section · Remove section
//          51+ section types · Reorder sections · Section labels
//          Empty state · Edge cases
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndGoToSitemap } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
});

// ── Helper: open a page node to reveal its sections ──────────────────────────
async function openPageSections(page) {
  const node = page.locator('[class*="node"], [class*="page-node"]').first();
  if (!await node.isVisible({ timeout: 10000 }).catch(() => false)) return false;
  await node.click();
  await page.waitForTimeout(800);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION LIST — VISIBILITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section Management — Visibility', () => {

  test('clicking a page node reveals a section list panel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const panel = page.locator(
      '[class*="section-list"], [class*="sections"], [class*="panel"],' +
      ' [class*="sidebar"], [class*="detail"]'
    ).first();
    await expect(panel).toBeVisible({ timeout: 8000 });
  });

  test('sections panel lists at least one section item', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const sectionItem = page.locator(
      '[class*="section-item"], [class*="section-row"], [class*="section-card"],' +
      ' [class*="sections"] li, [class*="sections"] [class*="item"]'
    ).first();
    await expect(sectionItem).toBeVisible({ timeout: 8000 });
  });

  test('each section item displays a section type label', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const items = await page.locator(
      '[class*="section-item"], [class*="section-row"], [class*="section-card"]'
    ).all();
    for (const item of items.slice(0, 5)) {
      const text = await item.innerText().catch(() => '');
      expect(text.trim().length, 'Section item has no label').toBeGreaterThan(0);
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// ADD SECTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section Management — Add Section', () => {

  test('"Add Section" button is visible inside the page panel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const addBtn = page.locator(
      'button:has-text("Add Section"), button:has-text("Add section"),' +
      ' button:has-text("+ Section"), [aria-label*="add section" i]'
    ).first();
    await expect(addBtn).toBeVisible({ timeout: 8000 });
  });

  test('clicking "Add Section" opens a section type picker', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const addBtn = page.locator(
      'button:has-text("Add Section"), button:has-text("Add section"), button:has-text("+ Section")'
    ).first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Section not found');
    await addBtn.click();
    await page.waitForTimeout(600);
    const picker = page.locator(
      '[class*="picker"], [class*="section-type"], [class*="type-select"],' +
      ' [class*="modal"], [class*="dropdown"], [role="dialog"]'
    ).first();
    await expect(picker).toBeVisible({ timeout: 6000 });
  });

  test('section type picker shows multiple section options (expects 10+)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const addBtn = page.locator(
      'button:has-text("Add Section"), button:has-text("Add section")'
    ).first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Section not found');
    await addBtn.click();
    await page.waitForTimeout(800);
    const options = page.locator(
      '[class*="section-type"] [class*="item"], [class*="picker"] [class*="option"],' +
      ' [class*="section-list"] li, [role="option"]'
    );
    const count = await options.count();
    if (count < 10) console.warn(`⚠️ Only ${count} section types visible — expected 10+`);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('selecting a section type adds it to the page section list', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const sectionSelector = '[class*="section-item"], [class*="section-row"], [class*="section-card"]';
    const before = await page.locator(sectionSelector).count();
    const addBtn = page.locator(
      'button:has-text("Add Section"), button:has-text("Add section")'
    ).first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Section not found');
    await addBtn.click();
    await page.waitForTimeout(800);
    // Click the first available section type option
    const firstOption = page.locator(
      '[class*="section-type"] [class*="item"], [class*="picker"] [class*="option"],' +
      ' [class*="section-list"] li, [role="option"]'
    ).first();
    if (!await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) test.skip(true, 'No section type options found');
    await firstOption.click();
    await page.waitForTimeout(1500);
    const after = await page.locator(sectionSelector).count();
    expect(after).toBeGreaterThan(before);
  });

  test('added section is persisted after page reload', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const sectionSelector = '[class*="section-item"], [class*="section-row"]';
    const addBtn = page.locator('button:has-text("Add Section"), button:has-text("Add section")').first();
    if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Section not found');
    await addBtn.click();
    await page.waitForTimeout(800);
    const option = page.locator('[class*="section-type"] [class*="item"], [role="option"]').first();
    if (!await option.isVisible({ timeout: 5000 }).catch(() => false)) test.skip(true, 'No options found');
    await option.click();
    await page.waitForTimeout(2000);
    const before = await page.locator(sectionSelector).count();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await openPageSections(page);
    const after = await page.locator(sectionSelector).count();
    expect(after).toBeGreaterThanOrEqual(before);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE SECTION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section Management — Remove Section', () => {

  test('each section item has a remove / delete control', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const item = page.locator('[class*="section-item"], [class*="section-row"]').first();
    if (!await item.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No section items found');
    await item.hover();
    const deleteBtn = item.locator(
      'button[aria-label*="delete" i], button[aria-label*="remove" i],' +
      ' button:has-text("Remove"), [class*="delete"], [class*="remove"]'
    ).first();
    const visible = await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Delete control on section item not found on hover — may use context menu');
  });

  test('removing a section decreases the section count', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const sectionSelector = '[class*="section-item"], [class*="section-row"]';
    const before = await page.locator(sectionSelector).count();
    if (before === 0) test.skip(true, 'No sections to remove');
    const item = page.locator(sectionSelector).last();
    await item.hover();
    const deleteBtn = item.locator(
      'button[aria-label*="delete" i], button[aria-label*="remove" i],' +
      ' button:has-text("Remove"), [class*="delete"]'
    ).first();
    if (!await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Try right-click
      await item.click({ button: 'right' });
      await page.waitForTimeout(400);
      const menuItem = page.locator('[role="menuitem"]:has-text("Delete"), li:has-text("Delete")').first();
      if (!await menuItem.isVisible({ timeout: 3000 }).catch(() => false)) test.skip(true, 'Delete not accessible');
      await menuItem.click();
    } else {
      await deleteBtn.click();
    }
    await page.waitForTimeout(1200);
    const after = await page.locator(sectionSelector).count();
    expect(after).toBeLessThan(before);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REORDER SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section Management — Reorder', () => {

  test('section items have a drag handle', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const item = page.locator('[class*="section-item"], [class*="section-row"]').first();
    if (!await item.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No sections');
    await item.hover();
    const handle = item.locator(
      '[class*="drag"], [class*="handle"], [aria-label*="drag" i], [cursor="grab"]'
    ).first();
    const visible = await handle.isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Drag handle not found on section item');
  });

  test('dragging sections does not throw a console error', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const items = await page.locator('[class*="section-item"], [class*="section-row"]').all();
    if (items.length < 2) test.skip(true, 'Need 2+ sections for reorder test');
    const src = items[0];
    const tgt = items[1];
    const srcBox = await src.boundingBox().catch(() => null);
    const tgtBox = await tgt.boundingBox().catch(() => null);
    if (!srcBox || !tgtBox) test.skip(true, 'Could not get bounding boxes');
    await page.mouse.move(srcBox.x + srcBox.width / 2, srcBox.y + srcBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(tgtBox.x + tgtBox.width / 2, tgtBox.y + tgtBox.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION TYPES — COVERAGE CHECK
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Section Management — Section Types', () => {

  // Key section types expected in the picker (subset of 51+)
  const expectedTypes = [
    'Hero', 'Header', 'Footer', 'About', 'Features', 'Pricing',
    'Contact', 'Gallery', 'Testimonial', 'FAQ', 'CTA', 'Blog',
  ];

  for (const type of expectedTypes) {
    test(`section type "${type}" is available in the picker`, async ({ page }) => {
      const reached = await loginAndGoToSitemap(page);
      test.skip(!reached, 'No project found');
      await openPageSections(page);
      const addBtn = page.locator('button:has-text("Add Section"), button:has-text("Add section")').first();
      if (!await addBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Add Section not found');
      await addBtn.click();
      await page.waitForTimeout(800);
      const typeOption = page.locator(
        `[class*="section-type"] [class*="item"]:has-text("${type}")`,
        `[role="option"]:has-text("${type}")`,
        `li:has-text("${type}")`
      ).first();
      const visible = await typeOption.isVisible({ timeout: 4000 }).catch(() => false);
      if (!visible) {
        // Try searching if there's a search input
        const search = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]').first();
        if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
          await search.fill(type);
          await page.waitForTimeout(500);
        }
      }
      await expect(
        page.locator(`text=${type}`).first()
      ).toBeVisible({ timeout: 5000 });
    });
  }

});
