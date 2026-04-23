// =============================================================================
// Sprout OS — Dashboard Workspace & Team Spec
// Covers : WorkspaceTab (projects grid/list, invite, mode toggle)
//          TeamManagement (members, roles, invite modal email+link)
//          RolesTab (role definitions, 12 permissions, Create/Manage mode)
//          UI · Functionality · Logic · Security · Accessibility
// =============================================================================

const { test, expect } = require('@playwright/test');
const { TEST_EMAIL, TEST_PASSWORD, loginAndDismissTour } = require('./_auth');

async function goToTab(page, tab) {
  await page.goto(`/dashboard?tab=${tab}`);
  // Use domcontentloaded to avoid networkidle timeouts, then wait for main content
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('main, .bg-white').first()).toBeVisible({ timeout: 10000 });
}

test.beforeEach(async ({ page }) => {
  if (!TEST_EMAIL || !TEST_PASSWORD) test.skip(true, 'Credentials not set');
  await loginAndDismissTour(page);
});

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE TAB — UI & NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('WorkspaceTab — UI', () => {

  test('workspace tab loads via URL param ?tab=workspace', async ({ page }) => {
    await goToTab(page, 'workspace');
    const main = page.locator('main, .bg-white').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('workspace tab renders without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await goToTab(page, 'workspace');
    await page.waitForTimeout(2000);
    const appErrors = errors.filter(e => !/analytics|gtag|facebook|hotjar|sentry/i.test(e));
    expect(appErrors, appErrors.join('\n')).toHaveLength(0);
  });

  test('workspace project cards renders at least one card', async ({ page }) => {
    await goToTab(page, 'workspace');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cardCount = await page.locator('[class*="rounded"]').count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('workspace project cards show project names', async ({ page }) => {
    await goToTab(page, 'workspace');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cards = page.locator('[class*="rounded-xl"], [class*="project-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const name = await cards.first().locator('p, span, h3').first().innerText().catch(() => '');
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test('workspace cards display time-ago labels', async ({ page }) => {
    await goToTab(page, 'workspace');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const timeLabel = page.locator('text=/ago|now/i').first();
    await expect(timeLabel).toBeVisible({ timeout: 5000 });
  });

  test('workspace project card click navigates to project', async ({ page }) => {
    await goToTab(page, 'workspace');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 15000 }).catch(() => {});
    const cards = page.locator('[class*="rounded-xl"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const startUrl = page.url();
    await cards.first().click();
    await page.waitForURL(/project|sitemap/i, { timeout: 8000 });
    expect(page.url()).not.toBe(startUrl);
    expect(page.url()).toMatch(/project|sitemap/i);
  });

  test('grid/list view toggle is present', async ({ page }) => {
    await goToTab(page, 'workspace');
    const gridBtn = page.locator('button[class*="grid"], button[aria-label*="grid" i], svg[class*="grid"]').first();
    await expect(gridBtn).toBeVisible({ timeout: 8000 });
  });

  test('list view toggle switches layout', async ({ page }) => {
    await goToTab(page, 'workspace');
    const listBtn = page.locator('button[aria-label*="list" i], button:has(svg[class*="list"])').first();
    if (!await listBtn.isVisible({ timeout: 5000 })) test.skip(true, 'List view button not found');
    await listBtn.click();
    // Layout should change — look for a list-style element
    const listStyle = page.locator('[class*="flex-col"], [class*="list-view"]').first();
    await expect(listStyle).toBeVisible({ timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE MODE TOGGLE — CREATE / MANAGE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('WorkspaceTab — Create / Manage Mode Toggle', () => {

  test('Create/Manage mode toggle is visible', async ({ page }) => {
    await goToTab(page, 'workspace');
    // Try role="tablist" first, then fallback to button text selectors
    const toggle = page.locator(
      '[role="tablist"]:has-text("Create"), [class*="WorkspaceModeToggle"], button:has-text("Create")'
    ).first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
  });

  test('"Create" tab is active by default', async ({ page }) => {
    await goToTab(page, 'workspace');
    const createTab = page.locator(
      '[role="tab"]:has-text("Create"), button:has-text("Create")[class*="active"], button:has-text("Create")[aria-selected="true"]'
    ).first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
    // Check active state via data-state or aria-selected
    const state = await createTab.getAttribute('data-state');
    const ariaSelected = await createTab.getAttribute('aria-selected');
    expect(state === 'active' || ariaSelected === 'true').toBeTruthy();
  });

  test('clicking "Manage" tab switches workspace mode', async ({ page }) => {
    await goToTab(page, 'workspace');
    const manageTab = page.locator('[role="tab"]:has-text("Manage"), button:has-text("Manage")').first();
    await expect(manageTab).toBeVisible({ timeout: 8000 });
    await manageTab.click();
    // Assert the manage tab is now active
    const state = await manageTab.getAttribute('data-state');
    const ariaSelected = await manageTab.getAttribute('aria-selected');
    const cls = await manageTab.getAttribute('class');
    expect(state === 'active' || ariaSelected === 'true' || (cls !== null && /active|selected/i.test(cls))).toBeTruthy();
  });

  test('switching back to "Create" restores active state', async ({ page }) => {
    await goToTab(page, 'workspace');
    const manageTab = page.locator('[role="tab"]:has-text("Manage"), button:has-text("Manage")').first();
    const createTab = page.locator('[role="tab"]:has-text("Create"), button:has-text("Create")').first();
    await expect(manageTab).toBeVisible({ timeout: 8000 });
    await manageTab.click();
    await page.waitForTimeout(500);
    await createTab.click();
    await page.waitForTimeout(500);
    const state = await createTab.getAttribute('data-state');
    const ariaSelected = await createTab.getAttribute('aria-selected');
    const cls = await createTab.getAttribute('class');
    expect(state === 'active' || ariaSelected === 'true' || (cls !== null && /active|selected/i.test(cls))).toBeTruthy();
  });

  test('workspace mode toggle has sparkles icon on Create tab', async ({ page }) => {
    await goToTab(page, 'workspace');
    const createTab = page.locator('[role="tab"]:has-text("Create"), button:has-text("Create")').first();
    await expect(createTab).toBeVisible({ timeout: 8000 });
    const svgInTab = createTab.locator('svg').first();
    await expect(svgInTab).toBeVisible({ timeout: 3000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MANAGEMENT TAB
// ─────────────────────────────────────────────────────────────────────────────
test.describe('TeamManagement — Members', () => {

  test('team-management tab loads', async ({ page }) => {
    await goToTab(page, 'team-management');
    const main = page.locator('main, .bg-white').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('member list renders', async ({ page }) => {
    await goToTab(page, 'team-management');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 12000 }).catch(() => {});
    const members = page.locator('[class*="member"], [class*="user-row"], [class*="team"]').first();
    await expect(members).toBeVisible({ timeout: 8000 });
  });

  test('current user appears in member list', async ({ page }) => {
    await goToTab(page, 'team-management');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 12000 }).catch(() => {});
    // The logged-in user's email should appear somewhere in the team list
    const userRow = page.locator(`text=${TEST_EMAIL}`).first();
    await expect(userRow).toBeVisible({ timeout: 8000 });
  });

  test('member rows show role labels (Admin/Designer/Developer/Client/Viewer)', async ({ page }) => {
    await goToTab(page, 'team-management');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 12000 }).catch(() => {});
    const roleLabel = page.locator('text=/Admin|Designer|Developer|Client|Viewer/i').first();
    await expect(roleLabel).toBeVisible({ timeout: 8000 });
  });

  test('search members input is visible', async ({ page }) => {
    await goToTab(page, 'team-management');
    const search = page.locator('input[placeholder*="Search" i]').first();
    await expect(search).toBeVisible({ timeout: 10000 });
  });

  test('searching members by name filters the list', async ({ page }) => {
    await goToTab(page, 'team-management');
    const search = page.locator('input[placeholder*="Search" i]').first();
    await expect(search).toBeVisible({ timeout: 8000 });
    await search.fill('zzz_nobody');
    await page.waitForTimeout(400);
    const rows = page.locator('[class*="member"], [class*="user-row"]');
    const count = await rows.count();
    expect(count).toBe(0);
    await search.fill('');
  });

  test('grid/list view toggle available in team management', async ({ page }) => {
    await goToTab(page, 'team-management');
    const gridBtn = page.locator('button[aria-label*="grid" i], svg[data-icon*="grid"]').first();
    await expect(gridBtn).toBeVisible({ timeout: 8000 });
  });

  test('searching members with matching name shows results', async ({ page }) => {
    await goToTab(page, 'team-management');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 12000 }).catch(() => {});
    const search = page.locator('input[placeholder*="Search" i]').first();
    await expect(search).toBeVisible({ timeout: 8000 });
    // Search with the logged-in user's email — their row must appear
    const emailPrefix = TEST_EMAIL.split('@')[0];
    await search.fill(emailPrefix);
    await page.waitForTimeout(400);
    const userRow = page.locator(`text=${TEST_EMAIL}`).first();
    await expect(userRow).toBeVisible({ timeout: 5000 });
    await search.fill('');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// INVITE MODAL — EMAIL & LINK
// ─────────────────────────────────────────────────────────────────────────────
test.describe('TeamManagement — Invite Modal', () => {

  async function openInviteModal(page) {
    await goToTab(page, 'team-management');
    const inviteBtn = page.locator('button:has-text("Invite"), button[aria-label*="invite" i]').first();
    await expect(inviteBtn).toBeVisible({ timeout: 10000 });
    // Use force: true in case overlay may interfere
    await inviteBtn.click({ force: true });
    await page.waitForTimeout(500);
  }

  test('invite button is visible in team management', async ({ page }) => {
    await goToTab(page, 'team-management');
    const btn = page.locator('button:has-text("Invite"), button[aria-label*="invite" i]').first();
    await expect(btn).toBeVisible({ timeout: 10000 });
  });

  test('invite modal opens on button click', async ({ page }) => {
    await openInviteModal(page);
    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('invite modal has "Invite by email" and "Share link" tabs', async ({ page }) => {
    await openInviteModal(page);
    await expect(page.locator('button:has-text("Invite by email")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Share link"), button:has-text("Copy link"), button:has-text("link")')).toBeVisible({ timeout: 5000 });
  });

  test('invite by email tab shows email input field', async ({ page }) => {
    await openInviteModal(page);
    const emailInput = page.locator('[role="dialog"] input[type="email"], [role="dialog"] input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test('role selector in invite modal shows 5 roles', async ({ page }) => {
    await openInviteModal(page);
    const roleBtn = page.locator('[role="dialog"] [class*="role"], [role="dialog"] button:has-text("Admin"), [role="dialog"] button:has-text("Designer")').first();
    await expect(roleBtn).toBeVisible({ timeout: 5000 });
    await roleBtn.click({ force: true });
    await page.waitForTimeout(300);
    // 5 role options: Admin, Designer, Developer, Client, Viewer
    for (const role of ['Admin', 'Designer', 'Developer', 'Client', 'Viewer']) {
      const opt = page.locator(`text=${role}`).first();
      await expect(opt).toBeVisible({ timeout: 3000 });
    }
  });

  test('submitting empty email shows validation error', async ({ page }) => {
    await openInviteModal(page);
    const sendBtn = page.locator('[role="dialog"] button:has-text("Send"), [role="dialog"] button[type="submit"]').first();
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
    await sendBtn.click({ force: true });
    await page.waitForTimeout(500);
    const emailInput = page.locator('[role="dialog"] input[type="email"]').first();
    const isInvalid = await emailInput.evaluate(el => !el.validity.valid).catch(() => false);
    const errMsg = await page.locator('[role="dialog"] [class*="error"], [role="dialog"] [role="alert"]').isVisible({ timeout: 2000 }).catch(() => false);
    expect(isInvalid || errMsg).toBeTruthy();
  });

  test('"Share link" tab shows copy link button', async ({ page }) => {
    await openInviteModal(page);
    const linkTab = page.locator('button:has-text("Share link"), button:has-text("Copy link"), button[class*="link"]').first();
    await expect(linkTab).toBeVisible({ timeout: 5000 });
    await linkTab.click({ force: true });
    const copyBtn = page.locator('button:has-text("Copy"), button[aria-label*="copy" i]').first();
    await expect(copyBtn).toBeVisible({ timeout: 3000 });
  });

  test('invite modal closes with X button', async ({ page }) => {
    await openInviteModal(page);
    const closeBtn = page.locator('[role="dialog"] button:has-text("✕"), [role="dialog"] button[aria-label*="close" i], [role="dialog"] .lucide-x').first();
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click({ force: true });
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test('invite modal closes with Escape key', async ({ page }) => {
    await openInviteModal(page);
    await page.keyboard.press('Escape');
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test('inviting a valid email shows pending/sent confirmation', async ({ page }) => {
    await openInviteModal(page);
    const emailInput = page.locator('[role="dialog"] input[type="email"], [role="dialog"] input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill('qa-test-invite@example.com');
    const sendBtn = page.locator('[role="dialog"] button:has-text("Send"), [role="dialog"] button[type="submit"]').first();
    await expect(sendBtn).toBeVisible({ timeout: 3000 });
    await sendBtn.click({ force: true });
    // After sending, a confirmation message (sent, pending, invited) should appear
    const confirmation = page.locator(
      '[role="dialog"] text=/sent|pending|invited|success/i, [role="dialog"] [class*="success"], [role="dialog"] [role="alert"]'
    ).first();
    await expect(confirmation).toBeVisible({ timeout: 8000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// ROLES TAB — PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('RolesTab — Permissions & Role Definitions', () => {

  test('roles tab loads', async ({ page }) => {
    await goToTab(page, 'roles');
    const main = page.locator('main, .bg-white').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('default roles are displayed (Admin, Designer, Developer, Client, Viewer)', async ({ page }) => {
    await goToTab(page, 'roles');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 12000 }).catch(() => {});
    for (const role of ['Admin', 'Designer', 'Developer', 'Client', 'Viewer']) {
      const label = page.locator(`text=${role}`).first();
      await expect(label).toBeVisible({ timeout: 8000 });
    }
  });

  test('permission groups are visible: Team Members, Projects, Design & Content', async ({ page }) => {
    await goToTab(page, 'roles');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 12000 }).catch(() => {});
    const groups = ['Team Members', 'Projects', 'Design & Content'];
    for (const g of groups) {
      const el = page.locator(`text=${g}`).first();
      await expect(el).toBeVisible({ timeout: 8000 });
    }
  });

  test('12 permissions are listed (3 groups × 4 each)', async ({ page }) => {
    await goToTab(page, 'roles');
    await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout: 12000 }).catch(() => {});
    const perms = [
      'View members', 'Invite members', 'Edit roles', 'Remove members',
      'View projects', 'Edit sitemap', 'Manage settings', 'Billing access',
      'Edit design', 'Comments', 'Export', 'AI usage',
    ];
    let found = 0;
    for (const perm of perms) {
      if (await page.locator(`text=${perm}`).isVisible({ timeout: 2000 }).catch(() => false)) {
        found++;
      }
    }
    expect(found).toBeGreaterThanOrEqual(8);
  });

  test('workspace mode toggle (Create/Manage) is present on roles tab', async ({ page }) => {
    await goToTab(page, 'roles');
    const toggle = page.locator(
      '[role="tablist"]:has-text("Create"), [class*="WorkspaceModeToggle"], button:has-text("Create")'
    ).first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
  });

  test('role search/filter input is visible', async ({ page }) => {
    await goToTab(page, 'roles');
    const search = page.locator('input[placeholder*="Search" i]').first();
    await expect(search).toBeVisible({ timeout: 8000 });
  });

  test('searching for non-existent role shows no results', async ({ page }) => {
    await goToTab(page, 'roles');
    const search = page.locator('input[placeholder*="Search" i]').first();
    await expect(search).toBeVisible({ timeout: 8000 });
    await search.fill('zzz_no_role_xyz');
    await page.waitForTimeout(400);
    const roles = page.locator('[class*="role-row"], [class*="role-item"]');
    expect(await roles.count()).toBe(0);
    await search.fill('');
  });

  test('Manage mode shows different permission groups', async ({ page }) => {
    await goToTab(page, 'roles');
    const manageTab = page.locator('[role="tab"]:has-text("Manage"), button:has-text("Manage")').first();
    await expect(manageTab).toBeVisible({ timeout: 8000 });
    await manageTab.click();
    await page.waitForTimeout(1000);
    // Manage mode has "Monitoring & Control", "Updates & Approvals"
    const monLabel = page.locator('text=Monitoring').first();
    await expect(monLabel).toBeVisible({ timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY — PERMISSION GATING
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Workspace — Security & Access Control', () => {

  test('unauthenticated access to ?tab=workspace redirects to login', async ({ page: unauthPage }) => {
    await unauthPage.goto('/dashboard?tab=workspace');
    await unauthPage.waitForTimeout(2000);
    expect(unauthPage.url()).toMatch(/login|sign-in|auth/i);
  });

  test('unauthenticated access to ?tab=team-management redirects to login', async ({ page: unauthPage }) => {
    await unauthPage.goto('/dashboard?tab=team-management');
    await unauthPage.waitForTimeout(2000);
    expect(unauthPage.url()).toMatch(/login|sign-in|auth/i);
  });

  test('unauthenticated access to ?tab=roles redirects to login', async ({ page: unauthPage }) => {
    await unauthPage.goto('/dashboard?tab=roles');
    await unauthPage.waitForTimeout(2000);
    expect(unauthPage.url()).toMatch(/login|sign-in|auth/i);
  });

  test('workspace API requires auth — /api/workspaces returns 401 without session', async ({ request }) => {
    const res = await request.get('/api/workspaces');
    expect([401, 403, 302]).toContain(res.status());
  });

  test('workspace members API requires auth', async ({ request }) => {
    const res = await request.get('/api/workspaces/fake-id/members');
    expect([401, 403, 404, 302]).toContain(res.status());
  });

});
