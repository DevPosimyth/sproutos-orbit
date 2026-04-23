// =============================================================================
// Sprout OS — Dashboard UI Test Suite
// Covers: Prompt field · Prompt suggestion · Space selector (header team pill)
//         Recent projects (sidebar "Last Opened")
// Requires: TEST_USER_EMAIL + TEST_USER_PASSWORD in .env
// Login route: /auth/login
// =============================================================================

const { test, expect } = require('@playwright/test');

const TEST_EMAIL    = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// ── Shared login helper ───────────────────────────────────────────────────────
async function login(page) {
  await page.goto('/auth/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard/i, { timeout: 25000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
}

// =============================================================================
// PROMPT FIELD
// =============================================================================
test.describe('Sprout OS Dashboard — Prompt Field', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('prompt card container is visible', async ({ page }) => {
    const card = page.locator('#dashboard-prompt-card');
    await expect(card).toBeVisible({ timeout: 12000 });
  });

  test('prompt editor area is clickable and receives focus', async ({ page }) => {
    // The prompt uses a contenteditable div inside the card
    const editorArea = page.locator('#dashboard-prompt-card .cursor-text').first();
    await expect(editorArea).toBeVisible({ timeout: 10000 });
    await editorArea.click();
    // After click, a contenteditable span should be focused
    const focused = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await expect(focused).toBeVisible({ timeout: 5000 });
  });

  test('typing in prompt editor shows the entered text', async ({ page }) => {
    const editorArea = page.locator('#dashboard-prompt-card .cursor-text').first();
    await editorArea.click();
    const editable = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editable.fill('Build a website for a bakery');
    const text = await editable.innerText();
    expect(text.trim()).toBe('Build a website for a bakery');
  });

  test('prompt card has minimum height (not collapsed)', async ({ page }) => {
    const card = page.locator('#dashboard-prompt-card');
    await expect(card).toBeVisible({ timeout: 10000 });
    const box = await card.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(80);
  });

  test('generate/submit button is present inside or below prompt card', async ({ page }) => {
    const btn = page.locator(
      'button:has-text("Generate"), button:has-text("Create"), button[class*="generate"], button[type="submit"]'
    ).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('Enter key in prompt triggers generation (no shift)', async ({ page }) => {
    const editorArea = page.locator('#dashboard-prompt-card .cursor-text').first();
    await editorArea.click();
    const editable = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editable.fill('Create a portfolio for a photographer');
    await editable.press('Enter');
    await page.waitForTimeout(3000);
    // Generation state: spinner / loading indicator / navigation away
    const isGenerating = await page.locator(
      '[class*="spinner"], [class*="loading"], [class*="generating"], .animate-spin'
    ).isVisible().catch(() => false);
    const navigated = !page.url().includes('/dashboard');
    expect(isGenerating || navigated).toBeTruthy();
  });

  test('prompt card renders without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.waitForTimeout(2000);
    const appErrors = errors.filter(
      (e) => !/analytics|gtag|facebook|hotjar|sentry/i.test(e)
    );
    expect(appErrors, appErrors.join('\n')).toHaveLength(0);
  });

});

// =============================================================================
// PROMPT SUGGESTION OPTIONS
// =============================================================================
test.describe('Sprout OS Dashboard — Prompt Suggestions', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('"Spin up an idea" suggestion button is visible', async ({ page }) => {
    const spinBtn = page.locator('button:has-text("Spin up an idea")').first();
    await expect(spinBtn).toBeVisible({ timeout: 10000 });
  });

  test('"Spin up an idea" button populates the prompt editor', async ({ page }) => {
    const spinBtn = page.locator('button:has-text("Spin up an idea")').first();
    await expect(spinBtn).toBeVisible({ timeout: 10000 });
    await spinBtn.click();
    await page.waitForTimeout(500);
    const editable = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    const text = await editable.innerText().catch(() => '');
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('"Start with a Guided Brief" option is visible', async ({ page }) => {
    const guidedBtn = page.locator('button:has-text("Start with a Guided Brief"), p:has-text("Start with a Guided Brief")').first();
    await expect(guidedBtn).toBeVisible({ timeout: 10000 });
  });

  test('"Start with a Guided Brief" button has a description subtitle', async ({ page }) => {
    const desc = page.locator('p:has-text("Answer a guided set of questions")').first();
    await expect(desc).toBeVisible({ timeout: 8000 });
  });

  test('"Start with a Guided Brief" click navigates to guided brief tab', async ({ page }) => {
    const guidedBtn = page.locator('button:has-text("Start with a Guided Brief")').first();
    await expect(guidedBtn).toBeVisible({ timeout: 10000 });
    await guidedBtn.click();
    await page.waitForTimeout(2000);
    // Should navigate to guided-brief tab (URL updates or content changes)
    const url = page.url();
    const guidedVisible = await page.locator('[class*="guided"], [class*="brief"]').isVisible({ timeout: 5000 }).catch(() => false);
    expect(url.includes('guided') || guidedVisible).toBeTruthy();
  });

  test('OR divider between prompt and guided brief is shown', async ({ page }) => {
    const orDivider = page.locator('span:has-text("OR")').first();
    await expect(orDivider).toBeVisible({ timeout: 8000 });
  });

  test('"Need a starting point?" hint text is visible', async ({ page }) => {
    const hint = page.locator('text=Need a starting point?').first();
    await expect(hint).toBeVisible({ timeout: 8000 });
  });

});

// =============================================================================
// SPACE OPTIONS (Header workspace / team pill — top left area)
// =============================================================================
test.describe('Sprout OS Dashboard — Space (Workspace) Options', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('workspace team pill is visible in the header', async ({ page }) => {
    // Header has avatar + team name button, visible on min-[426px] and above
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 10000 });
    // Team name button contains workspace name
    const teamBtn = header.locator('button').filter({ hasText: /.+/ }).first();
    await expect(teamBtn).toBeVisible({ timeout: 8000 });
  });

  test('workspace name is non-empty in the header pill', async ({ page }) => {
    const header = page.locator('header').first();
    // The span inside the team button shows workspace name
    const wsName = header.locator('span.font-zalando-sans').first();
    await expect(wsName).toBeVisible({ timeout: 10000 });
    const text = await wsName.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('workspace team pill is positioned in the left area of the header', async ({ page }) => {
    const header = page.locator('header').first();
    const teamBtn = header.locator('button').first();
    await expect(teamBtn).toBeVisible({ timeout: 10000 });
    const headerBox = await header.boundingBox();
    const btnBox = await teamBtn.boundingBox();
    // Button should be in the left half of the header
    expect(btnBox.x).toBeLessThan(headerBox.x + headerBox.width / 2);
  });

  test('clicking workspace name opens workspace settings tab', async ({ page }) => {
    const header = page.locator('header').first();
    // The left button (avatar + name) navigates to workspace tab
    const nameBtn = header.locator('button').first();
    await expect(nameBtn).toBeVisible({ timeout: 10000 });
    await nameBtn.click();
    await page.waitForTimeout(1500);
    const url = page.url();
    expect(url).toMatch(/workspace|tab=workspace/i);
  });

  test('workspace tab page loads with workspace content', async ({ page }) => {
    await page.goto('/dashboard?tab=workspace');
    await page.waitForLoadState('networkidle');
    const main = page.locator('main, [role="main"], .bg-white').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('header is present and not broken on dashboard', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 10000 });
    const box = await header.boundingBox();
    expect(box.height).toBeGreaterThan(0);
    expect(box.width).toBeGreaterThan(0);
  });

});

// =============================================================================
// RECENT PROJECTS (Sidebar — "Last Opened" section)
// =============================================================================
test.describe('Sprout OS Dashboard — Recent Projects (Last Opened)', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('sidebar <aside> is visible', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test('"Last Opened" section label is visible in sidebar', async ({ page }) => {
    const label = page.locator('aside').locator('text=Last Opened').first();
    await expect(label).toBeVisible({ timeout: 10000 });
  });

  test('sidebar search input is visible and accepts input', async ({ page }) => {
    const searchInput = page.locator('aside input[placeholder="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('test');
    const value = await searchInput.inputValue();
    expect(value).toBe('test');
    await searchInput.fill(''); // clear after test
  });

  test('shows "No Recent Projects" or project list items', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    // Either shows projects or the empty state message
    const hasProjects = await sidebar.locator('[class*="truncate"]').count();
    const isEmpty = await sidebar.locator('text=No Recent Projects').isVisible().catch(() => false);
    expect(hasProjects > 0 || isEmpty).toBeTruthy();
  });

  test('recent project items show a name (non-empty text)', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const noRecent = await sidebar.locator('text=No Recent Projects').isVisible({ timeout: 5000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects for this account');

    const projectNames = sidebar.locator('[class*="truncate"]');
    const count = await projectNames.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 3); i++) {
      const name = await projectNames.nth(i).innerText();
      expect(name.trim().length).toBeGreaterThan(0);
    }
  });

  test('at most 3 recent items shown in sidebar', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const noRecent = await sidebar.locator('text=No Recent Projects').isVisible({ timeout: 5000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects for this account');

    // The sidebar slices recentProjects to first 3
    const items = sidebar.locator('[class*="truncate"]');
    const count = await items.count();
    expect(count).toBeLessThanOrEqual(3);
  });

  test('clicking a recent project navigates to that project', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const noRecent = await sidebar.locator('text=No Recent Projects').isVisible({ timeout: 5000 }).catch(() => false);
    if (noRecent) test.skip(true, 'No recent projects for this account');

    const firstItem = sidebar.locator('[class*="truncate"]').first();
    await expect(firstItem).toBeVisible({ timeout: 8000 });
    const startUrl = page.url();
    await firstItem.click();
    await page.waitForTimeout(2000);
    expect(page.url()).not.toBe(startUrl);
    expect(page.url()).toMatch(/project|sitemap/i);
  });

  test('"Get started" checklist is visible in sidebar bottom area', async ({ page }) => {
    const getStarted = page.locator('aside').locator('text=Get started').first();
    // Only shown if checklist is not fully completed
    const isVisible = await getStarted.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Get started checklist already completed — skipping');
    }
    await expect(getStarted).toBeVisible();
  });

  test('projects section heading is visible on main dashboard area', async ({ page }) => {
    const heading = page.locator('h2:has-text("Projects")').first();
    await expect(heading).toBeVisible({ timeout: 12000 });
  });

  test('projects grid renders cards or shows empty state', async ({ page }) => {
    // Wait for project loading to finish
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cards = page.locator('[class*="rounded-xl"]');
    const count = await cards.count();
    const emptyState = await page.locator('h3:has-text("No Projects")').isVisible().catch(() => false);
    expect(count > 0 || emptyState).toBeTruthy();
  });

});
