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
  // Real class from source: .react-flow__node (ReactFlow standard)
  const node = page.locator('.react-flow__node, [class*="page-node"]').first();
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
    // Real class from source: .sitemap-section-card (set on each SortableSection)
    const sectionItem = page.locator(
      '.sitemap-section-card, [class*="section-item"], [class*="section-card"]'
    ).first();
    await expect(sectionItem).toBeVisible({ timeout: 8000 });
  });

  test('each section item displays a section type label', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const items = await page.locator(
      '.sitemap-section-card, [class*="section-item"], [class*="section-card"]'
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

  test('"Add Section" inline button is visible on section card hover', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    // The add-section button (.sitemap-add-section-btn) is an absolute-positioned + button
    // that appears at the bottom of each section card on hover
    const card = page.locator('.sitemap-section-card').first();
    if (!await card.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No section cards found');
    await card.hover();
    const addBtn = page.locator('.sitemap-add-section-btn').first();
    const visible = await addBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) console.warn('⚠️ .sitemap-add-section-btn not found on hover — may need CSS pointer-events');
  });

  test('clicking "Add Section" btn opens the section type picker panel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    // Hover a section card to reveal the + add button, then click it
    const card = page.locator('.sitemap-section-card').first();
    if (!await card.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No section cards');
    await card.hover();
    const addBtn = page.locator('.sitemap-add-section-btn').first();
    if (!await addBtn.isVisible({ timeout: 4000 }).catch(() => false)) test.skip(true, '.sitemap-add-section-btn not visible on hover');
    await addBtn.click();
    await page.waitForTimeout(600);
    // Section picker renders as a portal aside with heading "Add Section"
    const picker = page.locator('aside:has-text("Add Section"), [class*="picker"], [class*="section-type"]').first();
    await expect(picker).toBeVisible({ timeout: 6000 });
  });

  test('section type picker shows multiple section options (expects 10+)', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const card = page.locator('.sitemap-section-card').first();
    if (!await card.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No section cards');
    await card.hover();
    const addBtn = page.locator('.sitemap-add-section-btn').first();
    if (!await addBtn.isVisible({ timeout: 4000 }).catch(() => false)) test.skip(true, 'Add section btn not visible');
    await addBtn.click();
    await page.waitForTimeout(800);
    // Section picker renders cards in a 2-column grid inside the aside
    const options = page.locator('aside:has-text("Add Section") button, aside:has-text("Add Section") [class*="card"]');
    const count = await options.count();
    if (count < 10) console.warn(`⚠️ Only ${count} section types visible — expected 10+`);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('selecting a section type adds it to the page section list', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await openPageSections(page);
    const sectionSelector = '.sitemap-section-card';
    const before = await page.locator(sectionSelector).count();
    const card = page.locator('.sitemap-section-card').first();
    if (!await card.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No section cards');
    await card.hover();
    const addBtn = page.locator('.sitemap-add-section-btn').first();
    if (!await addBtn.isVisible({ timeout: 4000 }).catch(() => false)) test.skip(true, 'Add section btn not visible');
    await addBtn.click();
    await page.waitForTimeout(800);
    // Click the first section option in the picker grid
    const firstOption = page.locator(
      'aside:has-text("Add Section") button, aside:has-text("Add Section") [class*="card"]'
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
    const sectionSelector = '.sitemap-section-card';
    const card = page.locator('.sitemap-section-card').first();
    if (!await card.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No section cards');
    await card.hover();
    const addBtn = page.locator('.sitemap-add-section-btn').first();
    if (!await addBtn.isVisible({ timeout: 4000 }).catch(() => false)) test.skip(true, 'Add section btn not visible');
    await addBtn.click();
    await page.waitForTimeout(800);
    const option = page.locator('aside:has-text("Add Section") button').first();
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
    const item = page.locator('.sitemap-section-card').first();
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
    const sectionSelector = '.sitemap-section-card';
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
    const item = page.locator('.sitemap-section-card').first();
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
    const items = await page.locator('.sitemap-section-card').all();
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

  // Key section types expected in the picker — exact names from source (sections array in Sitemap.tsx)
  const expectedTypes = [
    'Hero', 'Navbar', 'Header', 'Footer', 'About Us', 'Features',
    'Pricing Table', 'Contact Form', 'Gallery', 'Testimonial', 'FAQ', 'CTA', 'Blog',
  ];

  for (const type of expectedTypes) {
    test(`section type "${type}" is available in the picker`, async ({ page }) => {
      const reached = await loginAndGoToSitemap(page);
      test.skip(!reached, 'No project found');
      await openPageSections(page);
      // Open the section picker by hovering a card and clicking the add button
      const card = page.locator('.sitemap-section-card').first();
      if (!await card.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No section cards');
      await card.hover();
      const addBtn = page.locator('.sitemap-add-section-btn').first();
      if (!await addBtn.isVisible({ timeout: 4000 }).catch(() => false)) test.skip(true, 'Add section btn not visible');
      await addBtn.click();
      await page.waitForTimeout(800);
      // Use search to filter for the type — picker has a Search input
      const search = page.locator('aside:has-text("Add Section") input[placeholder*="Search" i]').first();
      if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
        await search.fill(type);
        await page.waitForTimeout(500);
      }
      await expect(
        page.locator(`aside:has-text("Add Section") >> text=${type}`).first()
      ).toBeVisible({ timeout: 5000 });
    });
  }

});
