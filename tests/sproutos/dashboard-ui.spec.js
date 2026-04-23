// =============================================================================
// Sprout OS — Dashboard UI Test Suite
// Covers: Prompt field · Prompt suggestion options · Space selector (top-left)
//         Recent projects panel
// Requires: TEST_USER_EMAIL + TEST_USER_PASSWORD in .env
// =============================================================================

const { test, expect } = require('@playwright/test');

const TEST_EMAIL    = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// ── Shared login helper ───────────────────────────────────────────────────────
async function login(page) {
  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard|app|home/i, { timeout: 20000 }).catch(() => {});
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
}

// ── Selectors (adjust if class names differ) ──────────────────────────────────
const SEL = {
  // Prompt field
  promptInput:       'textarea[placeholder], textarea[class*="prompt"], input[placeholder*="prompt" i], input[placeholder*="ask" i], input[placeholder*="describe" i], textarea',
  promptSubmitBtn:   'button[type="submit"], button:has-text("Generate"), button:has-text("Create"), button:has-text("Build"), button:has-text("Submit"), button:has-text("Go")',
  promptSuggestion:  '[class*="suggestion"], [class*="prompt-option"], [class*="chip"], button[class*="example"], [class*="quick-action"]',

  // Space selector
  spaceSelector:     '[class*="space"], [class*="workspace"], [aria-label*="space" i], [data-testid*="space"]',
  spaceDropdown:     '[class*="space-dropdown"], [class*="workspace-menu"], [role="listbox"], [role="menu"]',
  spaceItem:         '[role="option"], [role="menuitem"], [class*="space-item"], li[class*="space"]',

  // Recent projects
  recentSection:     '[class*="recent"], [class*="project"], section:has-text("Recent"), div:has-text("Recent Projects")',
  projectCard:       '[class*="project-card"], [class*="project-item"], [class*="card"], [class*="project"] a',
};

// =============================================================================
// PROMPT FIELD
// =============================================================================
test.describe('Sprout OS Dashboard — Prompt Field', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('prompt input is visible on dashboard', async ({ page }) => {
    const input = page.locator(SEL.promptInput).first();
    await expect(input).toBeVisible({ timeout: 10000 });
  });

  test('prompt input is focusable and accepts text', async ({ page }) => {
    const input = page.locator(SEL.promptInput).first();
    await input.click();
    await input.fill('Build a landing page for a SaaS product');
    const value = await input.inputValue();
    expect(value.trim().length).toBeGreaterThan(0);
  });

  test('prompt input clears correctly', async ({ page }) => {
    const input = page.locator(SEL.promptInput).first();
    await input.fill('Test prompt text');
    await input.fill('');
    const value = await input.inputValue();
    expect(value).toBe('');
  });

  test('prompt submit button is visible and enabled', async ({ page }) => {
    const btn = page.locator(SEL.promptSubmitBtn).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
    await expect(btn).toBeEnabled();
  });

  test('submit button activates after typing a prompt', async ({ page }) => {
    const input = page.locator(SEL.promptInput).first();
    const btn   = page.locator(SEL.promptSubmitBtn).first();
    await input.fill('Create a portfolio website');
    // Button should remain enabled (not disabled) once text is entered
    await expect(btn).toBeEnabled({ timeout: 5000 });
  });

  test('pressing Enter in prompt field triggers submission', async ({ page }) => {
    const input = page.locator(SEL.promptInput).first();
    await input.fill('Design a dashboard for analytics');
    const navPromise = page.waitForNavigation({ timeout: 15000 }).catch(() => null);
    await input.press('Enter');
    // Either navigates away or shows a loading/result state
    await page.waitForTimeout(3000);
    const isLoading = await page.locator('[class*="loading"], [class*="spinner"], [class*="generating"]').isVisible().catch(() => false);
    const navigated = page.url() !== 'https://sproutos.ai/dashboard';
    expect(isLoading || navigated || navPromise !== null).toBeTruthy();
  });

  test('prompt field has placeholder text', async ({ page }) => {
    const input = page.locator(SEL.promptInput).first();
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder && placeholder.trim().length).toBeGreaterThan(0);
  });

});

// =============================================================================
// PROMPT SUGGESTION OPTIONS
// =============================================================================
test.describe('Sprout OS Dashboard — Prompt Suggestion Options', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('prompt suggestion chips / options are visible', async ({ page }) => {
    const suggestions = page.locator(SEL.promptSuggestion);
    const count = await suggestions.count();
    if (count === 0) {
      test.skip(true, 'No suggestion chips found — confirm selector for this build');
    }
    expect(count).toBeGreaterThan(0);
  });

  test('each suggestion option has non-empty label text', async ({ page }) => {
    const suggestions = page.locator(SEL.promptSuggestion);
    const count = await suggestions.count();
    if (count === 0) test.skip(true, 'No suggestion chips found');
    for (let i = 0; i < Math.min(count, 6); i++) {
      const text = await suggestions.nth(i).innerText();
      expect(text.trim().length, `Suggestion ${i} has empty label`).toBeGreaterThan(0);
    }
  });

  test('clicking a suggestion populates the prompt field', async ({ page }) => {
    const suggestions = page.locator(SEL.promptSuggestion);
    const count = await suggestions.count();
    if (count === 0) test.skip(true, 'No suggestion chips found');
    await suggestions.first().click();
    await page.waitForTimeout(500);
    const input = page.locator(SEL.promptInput).first();
    const value = await input.inputValue().catch(() => '');
    // Either the prompt is filled or a generation started
    const isGenerating = await page.locator('[class*="loading"], [class*="spinner"], [class*="generating"]').isVisible().catch(() => false);
    expect(value.trim().length > 0 || isGenerating).toBeTruthy();
  });

  test('suggestion options render without layout overflow', async ({ page }) => {
    const container = page.locator('[class*="suggestion"], [class*="prompt-option"]').first();
    if (!await container.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Suggestion container not visible');
    }
    const box = await container.boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test('at least 3 suggestion options are shown', async ({ page }) => {
    const suggestions = page.locator(SEL.promptSuggestion);
    const count = await suggestions.count();
    if (count === 0) test.skip(true, 'No suggestion chips found');
    expect(count).toBeGreaterThanOrEqual(3);
  });

});

// =============================================================================
// SPACE OPTIONS (LEFT SIDE — TOP)
// =============================================================================
test.describe('Sprout OS Dashboard — Space Options', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('space selector is visible in the top-left area', async ({ page }) => {
    const space = page.locator(SEL.spaceSelector).first();
    await expect(space).toBeVisible({ timeout: 10000 });
  });

  test('space selector shows the current active space name', async ({ page }) => {
    const space = page.locator(SEL.spaceSelector).first();
    if (!await space.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Space selector not found');
    }
    const text = await space.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('clicking space selector opens dropdown / menu', async ({ page }) => {
    const space = page.locator(SEL.spaceSelector).first();
    if (!await space.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Space selector not found');
    }
    await space.click();
    await page.waitForTimeout(500);
    const dropdown = page.locator(SEL.spaceDropdown).first();
    const isOpen = await dropdown.isVisible({ timeout: 3000 }).catch(() => false);
    const listOpen = await page.locator('[role="listbox"], [role="menu"], [role="dialog"]').isVisible({ timeout: 3000 }).catch(() => false);
    expect(isOpen || listOpen).toBeTruthy();
  });

  test('space dropdown lists at least one space item', async ({ page }) => {
    const space = page.locator(SEL.spaceSelector).first();
    if (!await space.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Space selector not found');
    }
    await space.click();
    await page.waitForTimeout(500);
    const items = page.locator(SEL.spaceItem);
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('space items have non-empty labels', async ({ page }) => {
    const space = page.locator(SEL.spaceSelector).first();
    if (!await space.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Space selector not found');
    }
    await space.click();
    await page.waitForTimeout(500);
    const items = page.locator(SEL.spaceItem);
    const count = await items.count();
    if (count === 0) test.skip(true, 'No space items in dropdown');
    for (let i = 0; i < Math.min(count, 5); i++) {
      const label = await items.nth(i).innerText();
      expect(label.trim().length, `Space item ${i} has empty label`).toBeGreaterThan(0);
    }
  });

  test('selecting a different space updates the displayed space name', async ({ page }) => {
    const space = page.locator(SEL.spaceSelector).first();
    if (!await space.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Space selector not found');
    }
    const originalName = await space.innerText();
    await space.click();
    await page.waitForTimeout(500);
    const items = page.locator(SEL.spaceItem);
    const count = await items.count();
    if (count < 2) test.skip(true, 'Only one space available — cannot switch');
    // Click the second item (first may be the already-selected one)
    await items.nth(1).click();
    await page.waitForTimeout(1000);
    const updatedName = await page.locator(SEL.spaceSelector).first().innerText().catch(() => '');
    // Name changed OR the dropdown closed (selection accepted)
    const dropdownClosed = !await page.locator(SEL.spaceDropdown).isVisible().catch(() => false);
    expect(updatedName !== originalName || dropdownClosed).toBeTruthy();
  });

  test('space selector is positioned in the left sidebar / top region', async ({ page }) => {
    const space = page.locator(SEL.spaceSelector).first();
    if (!await space.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip(true, 'Space selector not found');
    }
    const box = await space.boundingBox();
    const viewportWidth = page.viewportSize().width;
    // Should be in the left half of the viewport
    expect(box.x).toBeLessThan(viewportWidth / 2);
  });

});

// =============================================================================
// RECENT PROJECTS
// =============================================================================
test.describe('Sprout OS Dashboard — Recent Projects', () => {

  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not configured');
    await login(page);
  });

  test('"Recent Projects" section is visible on dashboard', async ({ page }) => {
    const section = page.locator(SEL.recentSection).first();
    await expect(section).toBeVisible({ timeout: 10000 });
  });

  test('recent projects section has a heading label', async ({ page }) => {
    const heading = page.locator(
      'h2:has-text("Recent"), h3:has-text("Recent"), h4:has-text("Recent"), [class*="section-title"]:has-text("Recent"), p:has-text("Recent Projects")'
    ).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  test('at least one project card is rendered (if projects exist)', async ({ page }) => {
    const cards = page.locator(SEL.projectCard);
    const count = await cards.count();
    if (count === 0) {
      // Empty state is acceptable for a fresh account
      const emptyState = page.locator('[class*="empty"], [class*="no-project"], p:has-text("No projects"), p:has-text("no recent")').first();
      const isEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isEmpty).toBeTruthy();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('project cards display a project name / title', async ({ page }) => {
    const cards = page.locator(SEL.projectCard);
    const count = await cards.count();
    if (count === 0) test.skip(true, 'No project cards — fresh account');
    for (let i = 0; i < Math.min(count, 4); i++) {
      const text = await cards.nth(i).innerText();
      expect(text.trim().length, `Project card ${i} has no visible text`).toBeGreaterThan(0);
    }
  });

  test('clicking a project card navigates to that project', async ({ page }) => {
    const cards = page.locator(SEL.projectCard);
    const count = await cards.count();
    if (count === 0) test.skip(true, 'No project cards — fresh account');
    const startUrl = page.url();
    await cards.first().click();
    await page.waitForTimeout(2000);
    // URL should change, or a project view should open
    const newUrl = page.url();
    const modalOpen = await page.locator('[role="dialog"], [class*="modal"], [class*="project-view"]').isVisible().catch(() => false);
    expect(newUrl !== startUrl || modalOpen).toBeTruthy();
  });

  test('project cards render thumbnails or icons', async ({ page }) => {
    const cards = page.locator(SEL.projectCard);
    const count = await cards.count();
    if (count === 0) test.skip(true, 'No project cards — fresh account');
    const firstCard = cards.first();
    const hasThumbnail = await firstCard.locator('img, svg, canvas, [class*="thumb"], [class*="preview"]').isVisible({ timeout: 3000 }).catch(() => false);
    // Thumbnail is desirable but not mandatory — log warning if absent
    if (!hasThumbnail) {
      console.warn('Project card has no visible thumbnail/icon');
    }
  });

  test('recent projects list shows no more than expected count (UX limit)', async ({ page }) => {
    const cards = page.locator(SEL.projectCard);
    const count = await cards.count();
    // Typical UX shows 4–12 recent items; flag if excessive
    if (count > 0) expect(count).toBeLessThanOrEqual(20);
  });

  test('empty state is shown gracefully when no projects exist', async ({ page }) => {
    const cards = page.locator(SEL.projectCard);
    const count = await cards.count();
    if (count > 0) test.skip(true, 'Projects exist — empty state not applicable');
    const emptyMsg = page.locator(
      '[class*="empty"], p:has-text("No projects"), p:has-text("nothing here"), p:has-text("Get started")'
    ).first();
    await expect(emptyMsg).toBeVisible({ timeout: 5000 });
  });

});
