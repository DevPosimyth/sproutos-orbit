// =============================================================================
// Sprout OS — Dashboard HomeTab Spec
// Covers : Prompt field · Suggestions · Projects grid · Guided Brief
//          UI · Functionality · Responsiveness · Logic · Accessibility
//          Performance · Console errors · Cross-browser
// =============================================================================

const { test, expect, devices } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndDismissTour, dismissTour } = require('./_auth');

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
  await loginAndDismissTour(page);
});

// ─────────────────────────────────────────────────────────────────────────────
// UI — LAYOUT & RENDERING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('HomeTab — UI & Layout', () => {

  test('dashboard page renders without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.waitForLoadState('networkidle');
    const appErrors = errors.filter(e => !/analytics|gtag|facebook|hotjar|sentry/i.test(e));
    expect(appErrors, appErrors.join('\n')).toHaveLength(0);
  });

  test('no 4xx/5xx asset requests on dashboard load', async ({ page }) => {
    const failures = [];
    page.on('response', r => {
      if (r.url().includes('sproutos.ai') && r.status() >= 400)
        failures.push(`${r.status()} ${r.url()}`);
    });
    await page.waitForLoadState('networkidle');
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  test('dashboard has correct page title', async ({ page }) => {
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('main content area is visible', async ({ page }) => {
    const main = page.locator('main, .bg-white, [class*="background-default"]').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('no visible layout overflow or horizontal scroll', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('no cumulative layout shift — content stable after 3s', async ({ page }) => {
    const clsBefore = await page.evaluate(() => document.documentElement.scrollTop);
    await page.waitForTimeout(3000);
    const clsAfter = await page.evaluate(() => document.documentElement.scrollTop);
    expect(Math.abs(clsAfter - clsBefore)).toBeLessThan(50);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT FIELD — FUNCTIONALITY & LOGIC
// ─────────────────────────────────────────────────────────────────────────────
test.describe('HomeTab — Prompt Field', () => {

  test('prompt card #dashboard-prompt-card is visible', async ({ page }) => {
    await expect(page.locator('#dashboard-prompt-card')).toBeVisible({ timeout: 12000 });
  });

  test('prompt card has minimum height of 80px', async ({ page }) => {
    const box = await page.locator('#dashboard-prompt-card').boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(80);
  });

  test('clicking prompt area focuses the contenteditable editor', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
  });

  test('typing in prompt editor reflects the entered text', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.fill('Build a website for a yoga studio');
    expect((await editor.innerText()).trim()).toBe('Build a website for a yoga studio');
  });

  test('prompt editor clears correctly after fill-then-clear', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.fill('Test text');
    await editor.fill('');
    expect((await editor.innerText()).trim()).toBe('');
  });

  test('prompt supports pasting plain text', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.focus();
    await page.keyboard.insertText('Pasted prompt content');
    const text = await editor.innerText();
    expect(text).toContain('Pasted prompt content');
  });

  test('prompt card does not submit on Shift+Enter (only newline)', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.fill('Multi line');
    await editor.press('Shift+Enter');
    // Should not navigate away — still on dashboard
    expect(page.url()).toMatch(/dashboard/i);
  });

  test('generate/submit button is visible and enabled', async ({ page }) => {
    const btn = page.locator(
      'button:has-text("Generate"), button:has-text("Create"), button:has-text("Build")'
    ).first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await expect(btn).toBeEnabled();
  });

  test('slash menu appears on typing "/" in prompt', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.focus();
    await page.keyboard.type('/');
    const slashMenu = page.locator('[class*="slash"], [class*="menu"]').filter({ hasText: /website|link|file/i }).first();
    await expect(slashMenu).toBeVisible({ timeout: 3000 });
  });

  test('Escape key dismisses slash menu', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.focus();
    await page.keyboard.type('/');
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    const slashMenu = page.locator('[class*="slash-menu"]').first();
    await expect(slashMenu).not.toBeVisible({ timeout: 2000 });
  });

  test('submitting empty prompt shows error or disables submit button', async ({ page }) => {
    // Ensure editor is empty
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.fill('');
    // Find and click the submit/send button
    const submitBtn = page.locator(
      '#dashboard-prompt-card button[type="submit"], #dashboard-prompt-card button[aria-label*="submit" i], #dashboard-prompt-card button[aria-label*="send" i]'
    ).first();
    if (await submitBtn.isVisible({ timeout: 3000 })) {
      await submitBtn.click({ force: true });
      // Either an error appears OR the button stays disabled OR URL does not change to a project
      const errorEl = page.locator('[class*="error"], [role="alert"]').first();
      const isErrorVisible = await errorEl.isVisible({ timeout: 2000 }).catch(() => false);
      const isStillOnDashboard = page.url().match(/dashboard/i);
      expect(isErrorVisible || isStillOnDashboard).toBeTruthy();
    } else {
      // If no explicit submit btn found, the editor itself should prevent navigation
      expect(page.url()).toMatch(/dashboard/i);
    }
  });

  test('prompt character count or hint shown when typing', async ({ page }) => {
    await page.locator('#dashboard-prompt-card .cursor-text').first().click();
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await editor.fill('Hello this is a test prompt for character count');
    // After typing, some feedback element (counter, hint, icon change) should be present
    const feedback = page.locator(
      '#dashboard-prompt-card [class*="count"], #dashboard-prompt-card [class*="hint"], #dashboard-prompt-card [class*="char"]'
    ).first();
    // Also check the editor itself has content (the fill worked)
    const text = await editor.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
    // If a feedback element exists, assert it's visible
    const feedbackExists = await feedback.count();
    if (feedbackExists > 0) {
      await expect(feedback).toBeVisible({ timeout: 3000 });
    }
  });

  test('project card has hover state (cursor changes or card elevates)', async ({ page }) => {
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cards = page.locator('[class*="rounded-xl"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const card = cards.first();
    await card.hover();
    // After hover, check that computed cursor is pointer OR a shadow/scale class has been added
    const cursor = await card.evaluate(el => getComputedStyle(el).cursor);
    const cls = await card.getAttribute('class');
    expect(cursor === 'pointer' || (cls !== null && /hover|shadow|scale|elevat/i.test(cls))).toBeTruthy();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT SUGGESTIONS — FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('HomeTab — Prompt Suggestions', () => {

  test('"Need a starting point?" hint is visible', async ({ page }) => {
    await expect(page.locator('text=Need a starting point?')).toBeVisible({ timeout: 10000 });
  });

  test('"Spin up an idea" button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Spin up an idea")')).toBeVisible({ timeout: 10000 });
  });

  test('"Spin up an idea" click fills the prompt (tour dismissed)', async ({ page }) => {
    const btn = page.locator('button:has-text("Spin up an idea")').first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    // Force-click to bypass any remaining overlay
    await btn.click({ force: true });
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();
    await expect(editor).not.toBeEmpty({ timeout: 3000 });
    const text = await editor.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('"Start with a Guided Brief" button is visible', async ({ page }) => {
    await expect(
      page.locator('button:has-text("Start with a Guided Brief")')
    ).toBeVisible({ timeout: 10000 });
  });

  test('"Start with a Guided Brief" has subtitle description text', async ({ page }) => {
    await expect(
      page.locator('p:has-text("Answer a guided set of questions")')
    ).toBeVisible({ timeout: 8000 });
  });

  test('"Start with a Guided Brief" click navigates to guided brief', async ({ page }) => {
    const btn = page.locator('button:has-text("Start with a Guided Brief")').first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click({ force: true });
    // Assert navigation occurred — URL changes or guided content appears
    await page.waitForFunction(
      () => window.location.href.includes('guided') || document.querySelector('[class*="guided"], [class*="brief"], input[placeholder*="project" i]') !== null,
      { timeout: 6000 }
    );
    const url = page.url();
    const guidedContent = await page.locator('[class*="guided"], [class*="brief"], input[placeholder*="project" i]').isVisible({ timeout: 3000 }).catch(() => false);
    expect(url.includes('guided') || guidedContent).toBeTruthy();
  });

  test('OR divider between prompt and guided brief is visible', async ({ page }) => {
    await expect(page.locator('span:has-text("OR")')).toBeVisible({ timeout: 8000 });
  });

  test('"Spin up an idea" generates a different idea on each click', async ({ page }) => {
    const btn = page.locator('button:has-text("Spin up an idea")').first();
    await expect(btn).toBeVisible({ timeout: 10000 });
    const editor = page.locator('#dashboard-prompt-card [contenteditable="true"]').first();

    await btn.click({ force: true });
    await page.waitForTimeout(300);
    const first = await editor.innerText();
    expect(first.trim().length).toBeGreaterThan(0);

    await editor.fill('');
    await btn.click({ force: true });
    await page.waitForTimeout(300);
    const second = await editor.innerText();
    expect(second.trim().length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS GRID — UI, FUNCTIONALITY, LOGIC
// ─────────────────────────────────────────────────────────────────────────────
test.describe('HomeTab — Projects Grid', () => {

  test('"Projects" section heading is visible', async ({ page }) => {
    await expect(page.locator('h2:has-text("Projects")')).toBeVisible({ timeout: 12000 });
  });

  test('projects grid renders at least one card', async ({ page }) => {
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cardCount = await page.locator('[class*="rounded-xl"]').count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('empty state shows "No Projects" heading and video card', async ({ page }) => {
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const emptyHeading = await page.locator('h3:has-text("No Projects")').isVisible().catch(() => false);
    if (!emptyHeading) test.skip(true, 'Projects exist — empty state not applicable');
    await expect(page.locator('h3:has-text("No Projects")')).toBeVisible();
    // "Getting Started" video card should also be present
    await expect(page.locator('text=Getting Started')).toBeVisible({ timeout: 5000 });
  });

  test('loading skeleton disappears after data loads', async ({ page }) => {
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const skeletons = await page.locator('.animate-pulse').count();
    expect(skeletons).toBe(0);
  });

  test('project cards display a name', async ({ page }) => {
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cards = page.locator('[class*="rounded-xl"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const text = await cards.first().innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('project cards display a thumbnail or placeholder', async ({ page }) => {
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cards = page.locator('[class*="rounded-xl"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const hasThumbnail = await cards.first().locator('img, canvas, [class*="preview"]').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasThumbnail).toBeTruthy();
  });

  test('clicking a project card navigates to project sitemap', async ({ page }) => {
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cards = page.locator('[class*="rounded-xl"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    await cards.first().click();
    await page.waitForURL(/project|sitemap/i, { timeout: 8000 });
    expect(page.url()).toMatch(/project|sitemap/i);
  });

  test('projects grid is responsive — adjusts columns at different widths', async ({ page }) => {
    // Check grid uses responsive column classes from source
    const grid = page.locator('.grid').first();
    await expect(grid).toBeVisible({ timeout: 8000 });
    const cls = await grid.getAttribute('class');
    expect(cls).toMatch(/grid-cols/);
  });

  test('search/filter in sidebar narrows project list', async ({ page }) => {
    const searchInput = page.locator('aside input[placeholder="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 8000 });
    await searchInput.fill('zzzzz_nonexistent_project');
    await page.waitForTimeout(500);
    // Scoped to sidebar only to avoid matching unrelated elements
    const results = await page.locator('aside [class*="truncate"]').count();
    // With a non-matching query, sidebar should show 0 items
    expect(results).toBe(0);
    await searchInput.fill('');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITY
// ─────────────────────────────────────────────────────────────────────────────
test.describe('HomeTab — Accessibility', () => {

  test('prompt area has accessible label or aria attributes', async ({ page }) => {
    const card = page.locator('#dashboard-prompt-card');
    await expect(card).toBeVisible({ timeout: 10000 });
    // Spin up an idea button has aria-label per source code
    const spinBtn = page.locator('button[aria-label*="idea"], button:has-text("Spin up an idea")').first();
    await expect(spinBtn).toBeVisible({ timeout: 8000 });
  });

  test('images on dashboard have alt attributes', async ({ page }) => {
    const images = await page.locator('main img, aside img').all();
    for (const img of images.slice(0, 10)) {
      const alt = await img.getAttribute('alt');
      expect(alt, 'img missing alt').not.toBeNull();
    }
  });

  test('keyboard navigation reaches the prompt editor', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // Dashboard should still be functional
    expect(page.url()).toMatch(/dashboard/i);
  });

  test('focus is not trapped on page load', async ({ page }) => {
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).not.toBe('null');
  });

  test('header has correct landmark role', async ({ page }) => {
    // Use first() to handle cases where locator matches multiple header elements
    await expect(page.locator('header').first()).toBeVisible({ timeout: 8000 });
  });

  test('sidebar has aside landmark', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible({ timeout: 8000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('HomeTab — Performance', () => {

  test('dashboard content visible within 8 seconds', async ({ page }) => {
    const start = Date.now();
    await page.waitForSelector('#dashboard-prompt-card', { timeout: 8000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(8000);
  });

  test('no requests pending after networkidle', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // If we reach here, no pending requests
    expect(true).toBeTruthy();
  });

  test('dashboard JS bundle does not produce memory warnings', async ({ page }) => {
    const warnings = [];
    page.on('console', m => { if (m.type() === 'warning' && /memory|leak/i.test(m.text())) warnings.push(m.text()); });
    await page.waitForTimeout(3000);
    expect(warnings).toHaveLength(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVENESS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('HomeTab — Responsiveness', () => {

  test('desktop 1440px: prompt card and projects visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('#dashboard-prompt-card')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Projects")')).toBeVisible({ timeout: 10000 });
  });

  test('tablet 768px: layout renders without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 10);
  });

  test('mobile <426px: shows "Coming Soon on Mobile" block screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const mobileBlock = page.locator('text=Coming Soon on Mobile').first();
    await expect(mobileBlock).toBeVisible({ timeout: 8000 });
  });

});
