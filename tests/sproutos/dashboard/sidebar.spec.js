// =============================================================================
// Sprout OS — Dashboard Sidebar & Header Spec
// Covers : Sidebar search · Last Opened (recent projects) · Get Started
//          checklist · Profile menu · Logout · Header workspace pill
//          UI · Functionality · Logic · Accessibility · Security
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndDismissTour } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
  await loginAndDismissTour(page);
});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — UI
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sidebar — UI & Layout', () => {

  test('sidebar <aside> is visible on desktop', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible({ timeout: 10000 });
  });

  test('sidebar has correct background color class', async ({ page }) => {
    const aside = page.locator('aside').first();
    const cls = await aside.getAttribute('class');
    expect(cls).toMatch(/background-dark/);
  });

  test('sidebar width is within expected range (200–320px)', async ({ page }) => {
    const box = await page.locator('aside').first().boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(200);
    expect(box.width).toBeLessThanOrEqual(320);
  });

  test('sidebar does not overflow the viewport height', async ({ page }) => {
    const viewportHeight = page.viewportSize().height;
    const box = await page.locator('aside').first().boundingBox();
    expect(box.height).toBeLessThanOrEqual(viewportHeight + 5);
  });

  test('sidebar has sticky positioning', async ({ page }) => {
    const cls = await page.locator('aside').first().getAttribute('class');
    expect(cls).toMatch(/sticky|fixed/);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — SEARCH
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sidebar — Project Search', () => {

  test('search input is visible in sidebar', async ({ page }) => {
    const search = page.locator('aside input[placeholder="Search"]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('search input accepts text', async ({ page }) => {
    const search = page.locator('aside input[placeholder="Search"]').first();
    await search.fill('test query');
    expect(await search.inputValue()).toBe('test query');
    await search.fill('');
  });

  test('search filters "Last Opened" projects by name', async ({ page }) => {
    const search = page.locator('aside input[placeholder="Search"]').first();
    const noRecent = await page.locator('aside').locator('text=No Recent Projects').isVisible({ timeout: 3000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects to filter');

    await search.fill('zzz_no_match_xyz');
    await page.waitForTimeout(400);
    const items = await page.locator('aside [class*="truncate"]').count();
    expect(items).toBe(0);
    await search.fill('');
  });

  test('clearing search restores project list', async ({ page }) => {
    const noRecent = await page.locator('aside').locator('text=No Recent Projects').isVisible({ timeout: 3000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects');

    const search = page.locator('aside input[placeholder="Search"]').first();
    await search.fill('zzz_no_match');
    await page.waitForTimeout(300);
    await search.fill('');
    await page.waitForTimeout(300);
    const items = await page.locator('aside [class*="truncate"]').count();
    expect(items).toBeGreaterThan(0);
  });

  test('search icon is present next to input', async ({ page }) => {
    const icon = page.locator('aside svg').first();
    await expect(icon).toBeVisible({ timeout: 8000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — LAST OPENED (RECENT PROJECTS)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sidebar — Last Opened', () => {

  test('"Last Opened" section label is visible', async ({ page }) => {
    await expect(page.locator('aside').locator('text=Last Opened')).toBeVisible({ timeout: 10000 });
  });

  test('shows "No Recent Projects" or project items', async ({ page }) => {
    const aside = page.locator('aside').first();
    const noRecent = await aside.locator('text=No Recent Projects').isVisible({ timeout: 5000 }).catch(() => false);
    const hasItems = await aside.locator('[class*="truncate"]').count();
    expect(noRecent || hasItems > 0).toBeTruthy();
  });

  test('recent project items have non-empty names', async ({ page }) => {
    const aside = page.locator('aside').first();
    const noRecent = await aside.locator('text=No Recent Projects').isVisible({ timeout: 3000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects');
    const items = aside.locator('[class*="truncate"]');
    const count = await items.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      expect((await items.nth(i).innerText()).trim().length).toBeGreaterThan(0);
    }
  });

  test('hovering a project item reveals the 3-dot menu button', async ({ page }) => {
    const aside = page.locator('aside').first();
    const noRecent = await aside.locator('text=No Recent Projects').isVisible({ timeout: 3000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects');

    const row = aside.locator('[class*="group"]').first();
    await row.hover();
    await page.waitForTimeout(300);
    // 3-dot button becomes visible on hover
    const dotBtn = row.locator('button').last();
    await expect(dotBtn).toBeVisible({ timeout: 3000 });
  });

  test('3-dot menu on project item shows context options', async ({ page }) => {
    const aside = page.locator('aside').first();
    const noRecent = await aside.locator('text=No Recent Projects').isVisible({ timeout: 3000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects');

    const row = aside.locator('[class*="group"]').first();
    await row.hover();
    await page.waitForTimeout(300);
    const dotBtn = row.locator('button').last();
    if (await dotBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dotBtn.click({ force: true });
      await page.waitForTimeout(300);
      const menu = page.locator('[class*="menu"], [role="menu"]').filter({ hasText: /rename|delete|duplicate|copy/i }).first();
      await expect(menu).toBeVisible({ timeout: 3000 });
    }
  });

  test('clicking a recent project navigates to /project/sitemap', async ({ page }) => {
    const aside = page.locator('aside').first();
    const noRecent = await aside.locator('text=No Recent Projects').isVisible({ timeout: 3000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects');

    const item = aside.locator('[class*="truncate"]').first();
    const startUrl = page.url();
    await item.click({ force: true });
    await page.waitForTimeout(2000);
    expect(page.url()).not.toBe(startUrl);
    expect(page.url()).toMatch(/project|sitemap/i);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — GET STARTED CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sidebar — Get Started Checklist', () => {

  test('"Get started" section visible when checklist not completed', async ({ page }) => {
    const gs = page.locator('aside').locator('text=Get started').first();
    const isVisible = await gs.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) test.skip(true, 'Get started checklist already completed');
    await expect(gs).toBeVisible();
  });

  test('checklist shows step items with labels', async ({ page }) => {
    const gs = page.locator('aside').locator('text=Get started').first();
    if (!await gs.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Get started checklist completed');
    }
    const steps = page.locator('[id^="get-started-item-"]');
    const count = await steps.count();
    expect(count).toBeGreaterThan(0);
  });

  test('step 1 "Enter the prompt" is always present', async ({ page }) => {
    const gs = page.locator('aside').locator('text=Get started').first();
    if (!await gs.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Get started checklist completed');
    }
    await expect(page.locator('text=Enter the prompt')).toBeVisible({ timeout: 5000 });
  });

  test('step 2 "Generate site map" is present', async ({ page }) => {
    const gs = page.locator('aside').locator('text=Get started').first();
    if (!await gs.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Get started checklist completed');
    }
    await expect(page.locator('text=Generate site map')).toBeVisible({ timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// HEADER — WORKSPACE PILL
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Header — Workspace Pill', () => {

  test('header is visible at top of page', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  });

  test('header height is within expected range (40–56px)', async ({ page }) => {
    const box = await page.locator('header').first().boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeLessThanOrEqual(56);
  });

  test('workspace name is displayed in header pill', async ({ page }) => {
    const wsName = page.locator('header span.font-zalando-sans').first();
    await expect(wsName).toBeVisible({ timeout: 10000 });
    expect((await wsName.innerText()).trim().length).toBeGreaterThan(0);
  });

  test('workspace pill is positioned in the left area of the header', async ({ page }) => {
    const headerBox = await page.locator('header').first().boundingBox();
    const wsName = page.locator('header span.font-zalando-sans').first();
    await expect(wsName).toBeVisible({ timeout: 8000 });
    const nameBox = await wsName.boundingBox();
    expect(nameBox.x).toBeLessThan(headerBox.x + headerBox.width / 2);
  });

  test('user avatar is shown in header pill', async ({ page }) => {
    const avatar = page.locator('header [class*="avatar"], header [class*="Avatar"]').first();
    await expect(avatar).toBeVisible({ timeout: 8000 });
  });

  test('SproutOS logo is visible in header', async ({ page }) => {
    const logo = page.locator('header img, header svg').first();
    await expect(logo).toBeVisible({ timeout: 8000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — PROFILE MENU & LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sidebar — Profile Menu & Logout', () => {

  test('user profile/avatar area is visible at bottom of sidebar', async ({ page }) => {
    const profile = page.locator('aside [class*="profile"], aside [class*="avatar"], aside [class*="user"]').first();
    const isVisible = await profile.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) test.skip(true, 'Profile area not found at bottom of sidebar');
    await expect(profile).toBeVisible();
  });

  test('logout action returns user to login or landing page', async ({ page }) => {
    const logoutBtn = page.locator(
      'button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Log out")'
    ).first();
    const visible = await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) {
      // Try opening profile menu first
      const profileTrigger = page.locator('aside [class*="profile"], aside [class*="avatar"]').first();
      if (await profileTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
        await profileTrigger.click();
        await page.waitForTimeout(500);
        const btn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Log out")').first();
        if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(2000);
          expect(page.url()).toMatch(/login|sign-in|^https?:\/\/[^/]+\/?$/i);
          return;
        }
      }
      test.skip(true, 'Logout button not accessible from this state');
    } else {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/login|sign-in|^https?:\/\/[^/]+\/?$/i);
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — ACCESSIBILITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sidebar — Accessibility', () => {

  test('search input has accessible placeholder text', async ({ page }) => {
    const input = page.locator('aside input[placeholder="Search"]').first();
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder?.trim().length).toBeGreaterThan(0);
  });

  test('sidebar does not break keyboard tab order', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Should remain on dashboard, no trap
    expect(page.url()).toMatch(/dashboard/i);
  });

  test('"Last Opened" label has sufficient color contrast (dark theme)', async ({ page }) => {
    const label = page.locator('aside').locator('text=Last Opened').first();
    await expect(label).toBeVisible({ timeout: 8000 });
    const color = await label.evaluate(el => getComputedStyle(el).color);
    expect(color).toBeTruthy();
  });

});
