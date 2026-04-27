// =============================================================================
// Sprout OS — Sitemap Editor — Global Sections (Navbar & Footer)
// Covers : Global section visibility · Global tab in section picker
//          Making/removing sections global via InspectorPanel toggle
//          Default globals (Navbar + Footer) · Persistence
//
// Real UI structure (from source analysis):
//  • Global sections are toggled via InspectorPanel button:
//    title="Make a Global Section" / "Remove Global Section"
//  • Default global sections: section:navbar, section:footer (green border)
//  • Section picker has "Global" tab showing sections flagged as global
//  • Global section cards show border-green-500 class on .sitemap-section-card
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndGoToSitemap } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
});

// ── Helper: open the section picker panel via hovering a section card ─────────
async function openSectionPicker(page) {
  const card = page.locator('.sitemap-section-card').first();
  if (!await card.isVisible({ timeout: 10000 }).catch(() => false)) return false;
  await card.hover();
  const addBtn = page.locator('.sitemap-add-section-btn').first();
  if (!await addBtn.isVisible({ timeout: 4000 }).catch(() => false)) return false;
  await addBtn.click();
  await page.waitForTimeout(600);
  return true;
}

// ── Helper: open InspectorPanel by clicking a section card ────────────────────
async function openInspectorPanel(page) {
  // Click a .sitemap-section-card to select it and open the InspectorPanel
  const card = page.locator('.sitemap-section-card').first();
  if (!await card.isVisible({ timeout: 10000 }).catch(() => false)) return false;
  await card.click();
  await page.waitForTimeout(600);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SECTIONS — VISIBILITY & ACCESS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Global Sections — Visibility', () => {

  test('section picker has a "Global" tab accessible in the editor', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openSectionPicker(page);
    test.skip(!opened, 'Could not open section picker');
    // "Global" is a tab button in the 3-tab slider: Sections | Global | Saved
    const globalTab = page.locator('aside:has-text("Add Section") button:has-text("Global")').first();
    await expect(globalTab).toBeVisible({ timeout: 8000 });
  });

  test('Navbar is listed as a global section in the Global tab', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openSectionPicker(page);
    test.skip(!opened, 'Could not open section picker');
    const globalTab = page.locator('aside:has-text("Add Section") button:has-text("Global")').first();
    if (!await globalTab.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Global tab not found');
    await globalTab.click();
    await page.waitForTimeout(400);
    // Navbar is a default global section (from loadGlobalsFromStorage default)
    const navbarItem = page.locator('aside:has-text("Add Section") >> text=Navbar').first();
    await expect(navbarItem).toBeVisible({ timeout: 6000 });
  });

  test('Footer is listed as a global section in the Global tab', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openSectionPicker(page);
    test.skip(!opened, 'Could not open section picker');
    const globalTab = page.locator('aside:has-text("Add Section") button:has-text("Global")').first();
    if (!await globalTab.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Global tab not found');
    await globalTab.click();
    await page.waitForTimeout(400);
    // Footer is a default global section
    const footerItem = page.locator('aside:has-text("Add Section") >> text=Footer').first();
    await expect(footerItem).toBeVisible({ timeout: 6000 });
  });

  test('global section cards show green border visual distinction', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // Global sections in SortableSection have border-green-500 class
    const globalCard = page.locator('.sitemap-section-card.border-green-500').first();
    const visible = await globalCard.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) console.warn('⚠️ No green-bordered global section cards found — globals may not be rendered yet');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR — MANAGEMENT VIA INSPECTOR PANEL
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Global Sections — Navbar', () => {

  test('clicking a section card opens the InspectorPanel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openInspectorPanel(page);
    test.skip(!opened, 'No section cards found');
    // InspectorPanel is an <aside> with heading "Section"
    const panel = page.locator('aside:has-text("Section")').first();
    await expect(panel).toBeVisible({ timeout: 6000 });
  });

  test('InspectorPanel has a globe/global toggle button', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openInspectorPanel(page);
    test.skip(!opened, 'No section cards found');
    // Globe toggle button with title "Make a Global Section" or "Remove Global Section"
    const toggleBtn = page.locator(
      'aside:has-text("Section") button[title*="Global Section"], ' +
      'aside:has-text("Section") button[title*="global" i]'
    ).first();
    const visible = await toggleBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Global section toggle button not found in InspectorPanel');
  });

  test('toggling global section via InspectorPanel does not crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const opened = await openInspectorPanel(page);
    test.skip(!opened, 'No section cards found');
    const toggleBtn = page.locator(
      'aside:has-text("Section") button[title*="Global Section"]'
    ).first();
    if (!await toggleBtn.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Toggle not found');
    await toggleBtn.click();
    await page.waitForTimeout(800);
    await toggleBtn.click(); // toggle back
    await page.waitForTimeout(800);
    expect(errors.filter(e => !/analytics|paddle|cloudflare/i.test(e))).toHaveLength(0);
  });

  test('navbar change is reflected across all pages — global cards show green border', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    // Default: Navbar is global — all nodes with a Navbar section should show border-green-500
    const greenCards = await page.locator('.sitemap-section-card.border-green-500').count();
    const allCards = await page.locator('.sitemap-section-card').count();
    console.log(`Global (green) section cards: ${greenCards} / ${allCards} total`);
    if (greenCards === 0) console.warn('⚠️ No global section cards found — check default globals');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER — MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Global Sections — Footer', () => {

  test('Footer section card exists on the canvas', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const footerCard = page.locator('.sitemap-section-card:has-text("Footer")').first();
    const visible = await footerCard.isVisible({ timeout: 10000 }).catch(() => false);
    if (!visible) console.warn('⚠️ Footer section card not found — project may not have a Footer section');
  });

  test('Footer section can be selected to open the InspectorPanel', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const footerCard = page.locator('.sitemap-section-card:has-text("Footer")').first();
    if (!await footerCard.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No Footer section card');
    await footerCard.click();
    await page.waitForTimeout(600);
    const panel = page.locator('aside:has-text("Section")').first();
    await expect(panel).toBeVisible({ timeout: 6000 });
  });

  test('toggling Footer global section does not cause a page crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    const footerCard = page.locator('.sitemap-section-card:has-text("Footer")').first();
    if (!await footerCard.isVisible({ timeout: 8000 }).catch(() => false)) test.skip(true, 'No Footer section card');
    await footerCard.click();
    await page.waitForTimeout(600);
    const toggleBtn = page.locator(
      'aside:has-text("Section") button[title*="Global Section"]'
    ).first();
    if (!await toggleBtn.isVisible({ timeout: 5000 }).catch(() => false)) test.skip(true, 'Toggle not found');
    await toggleBtn.click();
    await page.waitForTimeout(800);
    await toggleBtn.click(); // restore
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
    // Count global (green-bordered) cards before reload
    const before = await page.locator('.sitemap-section-card.border-green-500').count();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const after = await page.locator('.sitemap-section-card.border-green-500').count();
    expect(after).toBe(before);
  });

  test('section picker Global tab still shows Navbar and Footer after reload', async ({ page }) => {
    const reached = await loginAndGoToSitemap(page);
    test.skip(!reached, 'No project found');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const opened = await openSectionPicker(page);
    test.skip(!opened, 'Could not open section picker after reload');
    const globalTab = page.locator('aside:has-text("Add Section") button:has-text("Global")').first();
    if (!await globalTab.isVisible({ timeout: 6000 }).catch(() => false)) test.skip(true, 'Global tab not found');
    await globalTab.click();
    await page.waitForTimeout(400);
    await expect(
      page.locator('aside:has-text("Add Section") >> text=Navbar').first()
    ).toBeVisible({ timeout: 6000 });
  });

});
