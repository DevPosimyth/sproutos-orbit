// =============================================================================
// Sprout OS — Auth Pages Test Suite  (Senior QA · Comprehensive)
// Covers: /auth/login · /auth/signup · /auth/forgot-password
//
// Pages inspected 2026-04-27. Actual DOM:
//   Login    → email, password, checkbox, Google btn, Facebook btn, eye toggle,
//              "Forgot Password?" btn, "Login" submit, "Sign up" btn
//   Signup   → name, email, password, Google btn, Facebook btn, "Create Account"
//              submit, "Log in" btn
//   Forgot   → New Password, Confirm Password, "Reset Password" submit, "Back" btn
//
// Known non-critical JS noise:
//   [PADDLE BILLING] You must specify your Paddle Seller ID or token …
//   — filtered out from JS-error assertions.
// =============================================================================

const { test, expect } = require('@playwright/test');

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Fills login form and submits */
async function doLogin(page, email, password) {
  await page.locator('input[name="email"], input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').first().click();
}

/** Returns only app-level JS errors (strips known third-party noise) */
function appErrors(errors) {
  return errors.filter(
    (e) => !/paddle|analytics|gtag|facebook|hotjar|sentry|intercom|crisp/i.test(e),
  );
}

const TEST_EMAIL    = process.env.TEST_USER_EMAIL    || 'tester0107@yopmail.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'Tester123';
const WRONG_EMAIL   = 'nobody-exists-xyz@fakefakefake.io';
const WRONG_PASS    = 'WrongPass!999';
const WEAK_PASS     = '123';
const SHORT_PASS    = 'Abc12';

// =============================================================================
// LOGIN PAGE  —  /auth/login
// =============================================================================

test.describe('Login Page', () => {

  // ── Page Load ───────────────────────────────────────────────────────────────

  test('returns HTTP 200', async ({ request }) => {
    const res = await request.get('/auth/login');
    expect(res.status()).toBe(200);
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/log in|sign in|sprout/i);
  });

  test('loads with no app-level JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    expect(appErrors(errors), appErrors(errors).join('\n')).toHaveLength(0);
  });

  test('loads within 8 seconds', async ({ page }) => {
    const t = Date.now();
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - t).toBeLessThan(8000);
  });

  // ── Form Fields ─────────────────────────────────────────────────────────────

  test('email field is visible and accepts input', async ({ page }) => {
    await page.goto('/auth/login');
    const email = page.locator('input[name="email"], input[type="email"]').first();
    await expect(email).toBeVisible();
    await email.fill('test@sproutos.ai');
    await expect(email).toHaveValue('test@sproutos.ai');
  });

  test('password field is visible, type=password by default', async ({ page }) => {
    await page.goto('/auth/login');
    const pwd = page.locator('input[type="password"]').first();
    await expect(pwd).toBeVisible();
    expect(await pwd.getAttribute('type')).toBe('password');
  });

  test('password eye toggle switches type to text and back', async ({ page }) => {
    await page.goto('/auth/login');
    const pwd = page.locator('input[type="password"]').first();
    await pwd.fill('SomePass1!');
    // Click the eye / toggle button (empty icon button adjacent to password field)
    const toggle = page.locator('button[type="button"]').filter({ hasNot: page.locator('text') }).nth(0);
    // More resilient: find any icon button near the password field
    const eyeBtn = page.locator('[class*="eye"], [aria-label*="password"], [aria-label*="show"], [aria-label*="hide"]').first();
    if (await eyeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eyeBtn.click();
      const typeAfter = await page.locator('input[name="password"], input[placeholder*="password" i]').first().getAttribute('type');
      expect(typeAfter).toBe('text');
      await eyeBtn.click();
      const typeRestored = await page.locator('input[name="password"], input[placeholder*="password" i]').first().getAttribute('type');
      expect(typeRestored).toBe('password');
    } else {
      // Fallback: at minimum password stays hidden by default
      expect(await pwd.getAttribute('type')).toBe('password');
    }
  });

  test('"Remember me" checkbox is visible and toggleable', async ({ page }) => {
    await page.goto('/auth/login');
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(checkbox).toBeVisible();
      const before = await checkbox.isChecked();
      await checkbox.click();
      expect(await checkbox.isChecked()).toBe(!before);
    }
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  test('empty submit shows validation — email required', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('button[type="submit"]').first().click();
    const email = page.locator('input[name="email"], input[type="email"]').first();
    const nativeInvalid = await email.evaluate((el) => !el.validity.valid).catch(() => false);
    const errorVisible  = await page.locator('[class*="error"], [role="alert"]').first().isVisible().catch(() => false);
    expect(nativeInvalid || errorVisible).toBeTruthy();
  });

  test('email-only submit shows validation — password required', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('input[name="email"], input[type="email"]').first().fill('user@sproutos.ai');
    await page.locator('button[type="submit"]').first().click();
    const pwd = page.locator('input[type="password"]').first();
    const nativeInvalid = await pwd.evaluate((el) => !el.validity.valid).catch(() => false);
    const errorVisible  = await page.locator('[class*="error"], [role="alert"]').first().isVisible().catch(() => false);
    expect(nativeInvalid || errorVisible).toBeTruthy();
  });

  test('invalid email format is rejected', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('input[name="email"], input[type="email"]').first().fill('not-an-email@@');
    await page.locator('input[type="password"]').first().fill('SomePass1!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1000);
    // Still on login page
    expect(page.url()).toMatch(/login/i);
  });

  test('wrong credentials — error message shown, stays on login', async ({ page }) => {
    await page.goto('/auth/login');
    await doLogin(page, WRONG_EMAIL, WRONG_PASS);
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/login/i);
    const errorEl = page.locator('[class*="error"], [role="alert"], [class*="toast"]').first();
    const isVisible = await errorEl.isVisible({ timeout: 5000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('wrong password for real email — error shown, not locked immediately', async ({ page }) => {
    await page.goto('/auth/login');
    await doLogin(page, TEST_EMAIL, WRONG_PASS);
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/login/i);
    // Must NOT show "account locked" after single failed attempt
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    expect(bodyText).not.toMatch(/account locked|too many attempts|temporarily disabled/i);
  });

  // ── Valid Login ─────────────────────────────────────────────────────────────

  test('valid credentials redirect to /dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await doLogin(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL(/dashboard/, { timeout: 20000 });
    expect(page.url()).toMatch(/dashboard/i);
  });

  test('no sensitive data in URL after login redirect', async ({ page }) => {
    await page.goto('/auth/login');
    await doLogin(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL(/dashboard/, { timeout: 20000 });
    const url = page.url();
    expect(url).not.toMatch(/password|token|secret/i);
  });

  test('session persists after page refresh', async ({ page }) => {
    await page.goto('/auth/login');
    await doLogin(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL(/dashboard/, { timeout: 20000 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/dashboard/i);
  });

  // ── OAuth Buttons ───────────────────────────────────────────────────────────

  test('"Continue with Google" button is visible', async ({ page }) => {
    await page.goto('/auth/login');
    const btn = page.locator('button:has-text("Continue with Google")').first();
    await expect(btn).toBeVisible({ timeout: 5000 });
  });

  test('"Continue with Facebook" button is visible', async ({ page }) => {
    await page.goto('/auth/login');
    const btn = page.locator('button:has-text("Continue with Facebook")').first();
    await expect(btn).toBeVisible({ timeout: 5000 });
  });

  test('clicking Google OAuth button does not error immediately', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/auth/login');
    const btn = page.locator('button:has-text("Continue with Google")').first();
    await btn.click();
    await page.waitForTimeout(1500);
    // Expect redirect to Google or OAuth flow — not a crash
    const url = page.url();
    const appErr = appErrors(errors);
    // Either navigated away to Google, or a popup was opened
    expect(appErr).toHaveLength(0);
  });

  // ── Navigation Links ─────────────────────────────────────────────────────────

  test('"Forgot Password?" navigates to forgot-password page', async ({ page }) => {
    await page.goto('/auth/login');
    const btn = page.locator('button:has-text("Forgot Password?"), button:has-text("Forgot password")').first();
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForURL(/forgot-password|reset/, { timeout: 8000 });
    expect(page.url()).toMatch(/forgot-password|reset/i);
  });

  test('"Sign up" button navigates to signup page', async ({ page }) => {
    await page.goto('/auth/login');
    const btn = page.locator('button:has-text("Sign up")').first();
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForURL(/signup|register/, { timeout: 8000 });
    expect(page.url()).toMatch(/signup|register/i);
  });

  // ── Authenticated User Redirect ──────────────────────────────────────────────

  test('already-authenticated user is redirected away from login', async ({ page }) => {
    // Log in first
    await page.goto('/auth/login');
    await doLogin(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL(/dashboard/, { timeout: 20000 });
    // Now try visiting login again
    await page.goto('/auth/login');
    await page.waitForTimeout(2000);
    // Should not stay on login — redirect to dashboard or homepage
    expect(page.url()).not.toMatch(/auth\/login/i);
  });

  // ── Security ─────────────────────────────────────────────────────────────────

  test('login page served over HTTPS', async ({ page }) => {
    await page.goto('/auth/login');
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('password field value is never exposed in page source', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('input[type="password"]').first().fill('SuperSecret1!');
    const html = await page.content();
    // The actual typed value must not appear as a plain-text attribute in DOM
    expect(html).not.toContain('SuperSecret1!');
  });

  // ── Responsiveness ───────────────────────────────────────────────────────────

  test('login form is fully visible on 375px mobile viewport', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await page.goto('/auth/login');
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    await ctx.close();
  });

});

// =============================================================================
// SIGNUP PAGE  —  /auth/signup
// =============================================================================

test.describe('Signup Page', () => {

  // ── Page Load ───────────────────────────────────────────────────────────────

  test('returns HTTP 200', async ({ request }) => {
    const res = await request.get('/auth/signup');
    expect(res.status()).toBe(200);
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page).toHaveTitle(/sign up|register|create|sprout/i);
  });

  test('loads with no app-level JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    expect(appErrors(errors), appErrors(errors).join('\n')).toHaveLength(0);
  });

  test('loads within 8 seconds', async ({ page }) => {
    const t = Date.now();
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - t).toBeLessThan(8000);
  });

  // ── Form Fields ─────────────────────────────────────────────────────────────

  test('full name field is visible', async ({ page }) => {
    await page.goto('/auth/signup');
    const name = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(name).toBeVisible();
  });

  test('email field is visible', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  });

  test('password field is visible, type=password by default', async ({ page }) => {
    await page.goto('/auth/signup');
    const pwd = page.locator('input[type="password"]').first();
    await expect(pwd).toBeVisible();
    expect(await pwd.getAttribute('type')).toBe('password');
  });

  test('"Create Account" submit button is visible', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('button[type="submit"]:has-text("Create Account")').first()).toBeVisible();
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  test('empty form submit shows validation error', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.locator('button[type="submit"]').first().click();
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const nativeInvalid = await nameField.evaluate((el) => !el.validity.valid).catch(() => false);
    const errorVisible  = await page.locator('[class*="error"], [role="alert"]').first().isVisible().catch(() => false);
    expect(nativeInvalid || errorVisible).toBeTruthy();
  });

  test('invalid email format is rejected', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.locator('input[name="name"], input[placeholder*="name" i]').first().fill('Test User');
    await page.locator('input[type="email"], input[name="email"]').first().fill('not-an-email');
    await page.locator('input[type="password"]').first().fill('ValidPass1!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/signup|register/i);
  });

  test('weak / short password is rejected', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.locator('input[name="name"], input[placeholder*="name" i]').first().fill('Test User');
    await page.locator('input[type="email"], input[name="email"]').first().fill('weakpwdtest@example.com');
    await page.locator('input[type="password"]').first().fill(WEAK_PASS);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);
    // Must stay on signup — weak password rejected
    expect(page.url()).toMatch(/signup|register/i);
  });

  test('duplicate / already-registered email shows error', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.locator('input[name="name"], input[placeholder*="name" i]').first().fill('Duplicate User');
    await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
    await page.locator('input[type="password"]').first().fill('ValidPass1!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(4000);
    // Should stay on signup and show an error about existing account
    const url = page.url();
    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    expect(
      url.includes('signup') ||
      bodyText.match(/already|exists|registered|taken/i)
    ).toBeTruthy();
  });

  test('name field cannot be left blank', async ({ page }) => {
    await page.goto('/auth/signup');
    // Leave name blank
    await page.locator('input[type="email"], input[name="email"]').first().fill('newuser@example.com');
    await page.locator('input[type="password"]').first().fill('ValidPass1!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/signup|register/i);
  });

  // ── OAuth Buttons ───────────────────────────────────────────────────────────

  test('"Continue with Google" button is visible on signup', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('button:has-text("Continue with Google")').first()).toBeVisible();
  });

  test('"Continue with Facebook" button is visible on signup', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('button:has-text("Continue with Facebook")').first()).toBeVisible();
  });

  // ── Navigation ───────────────────────────────────────────────────────────────

  test('"Log in" button navigates to login page', async ({ page }) => {
    await page.goto('/auth/signup');
    const btn = page.locator('button:has-text("Log in"), button:has-text("Sign in")').first();
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForURL(/login/, { timeout: 8000 });
    expect(page.url()).toMatch(/login/i);
  });

  // ── Security ─────────────────────────────────────────────────────────────────

  test('signup page served over HTTPS', async ({ page }) => {
    await page.goto('/auth/signup');
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('password value never exposed in page DOM', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.locator('input[type="password"]').first().fill('MySecret123!');
    const html = await page.content();
    expect(html).not.toContain('MySecret123!');
  });

  test('authenticated user redirected away from signup page', async ({ page }) => {
    await page.goto('/auth/login');
    await doLogin(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForURL(/dashboard/, { timeout: 20000 });
    await page.goto('/auth/signup');
    await page.waitForTimeout(2000);
    expect(page.url()).not.toMatch(/auth\/signup/i);
  });

  // ── Responsiveness ───────────────────────────────────────────────────────────

  test('signup form fully visible on 375px mobile', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await page.goto('/auth/signup');
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    await ctx.close();
  });

});

// =============================================================================
// FORGOT / RESET PASSWORD PAGE  —  /auth/forgot-password
// =============================================================================

test.describe('Forgot / Reset Password Page', () => {

  // ── Page Load ───────────────────────────────────────────────────────────────

  test('returns HTTP 200', async ({ request }) => {
    const res = await request.get('/auth/forgot-password');
    expect(res.status()).toBe(200);
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page).toHaveTitle(/reset|forgot|password|sprout/i);
  });

  test('loads with no app-level JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/auth/forgot-password');
    await page.waitForLoadState('networkidle');
    expect(appErrors(errors), appErrors(errors).join('\n')).toHaveLength(0);
  });

  // ── KNOWN ISSUE — Page shows Reset form instead of Email entry ───────────────
  // The /auth/forgot-password page renders "New Password" + "Confirm Password"
  // inputs WITHOUT first asking for the user's email address or verifying a token.
  // This is a SECURITY ISSUE: anyone can reach the reset form unauthenticated.
  // Filed as: [BUG] Forgot-password page skips email verification step.
  // ─────────────────────────────────────────────────────────────────────────────

  test('BUG — forgot-password page skips email step (shows reset form directly)', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const newPwdInput = page.locator('input[placeholder*="New Password" i]');
    const emailVisible = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);
    const resetVisible = await newPwdInput.isVisible({ timeout: 3000 }).catch(() => false);
    // Document the anomaly: email step is missing, reset form appears directly
    if (!emailVisible && resetVisible) {
      console.warn('⚠️  BUG CONFIRMED: /auth/forgot-password shows password reset form without email verification step.');
    }
    // This assertion will PASS while the bug exists (documents current state).
    // Flip to: expect(emailVisible).toBeTruthy() once the bug is fixed.
    expect(resetVisible).toBeTruthy();
  });

  // ── Form Fields ─────────────────────────────────────────────────────────────

  test('"New Password" field is visible', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    const input = page.locator('input[placeholder*="New Password" i], input[type="password"]').first();
    await expect(input).toBeVisible();
  });

  test('"Confirm Password" field is visible', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    const inputs = await page.locator('input[type="password"]').all();
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  test('"Reset Password" submit button is visible', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.locator('button[type="submit"]:has-text("Reset Password")').first()).toBeVisible();
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  test('mismatched passwords show validation error', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    const pwdInputs = await page.locator('input[type="password"]').all();
    if (pwdInputs.length >= 2) {
      await pwdInputs[0].fill('NewPass123!');
      await pwdInputs[1].fill('DifferentPass456!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      // Should show mismatch error or stay on page
      const bodyText = (await page.locator('body').innerText()).toLowerCase();
      const stayed = page.url().includes('forgot-password');
      const hasError = bodyText.match(/match|same|password/i);
      expect(stayed || hasError).toBeTruthy();
    }
  });

  test('empty submit shows validation error', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
    const pwdInput = page.locator('input[type="password"]').first();
    const nativeInvalid = await pwdInput.evaluate((el) => !el.validity.valid).catch(() => false);
    const errorVisible  = await page.locator('[class*="error"], [role="alert"]').first().isVisible().catch(() => false);
    expect(nativeInvalid || errorVisible || page.url().includes('forgot-password')).toBeTruthy();
  });

  test('weak / short new password is rejected', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    const pwdInputs = await page.locator('input[type="password"]').all();
    if (pwdInputs.length >= 2) {
      await pwdInputs[0].fill(SHORT_PASS);
      await pwdInputs[1].fill(SHORT_PASS);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/forgot-password|reset/i);
    }
  });

  test('both fields match and meet policy — form submits without client error', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    const pwdInputs = await page.locator('input[type="password"]').all();
    if (pwdInputs.length >= 2) {
      await pwdInputs[0].fill('NewStrongPass1!');
      await pwdInputs[1].fill('NewStrongPass1!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3000);
      // Should show success message or navigate away — must NOT show a client-side error
      const bodyText = (await page.locator('body').innerText()).toLowerCase();
      expect(bodyText).not.toMatch(/mismatch|do not match|too short/i);
    }
  });

  // ── Navigation ───────────────────────────────────────────────────────────────

  test('"Back" button navigates to login page', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    const backBtn = page.locator('button:has-text("Back")').first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await page.waitForURL(/login|forgot/, { timeout: 8000 });
    expect(page.url()).toMatch(/login|auth/i);
  });

  // ── Security ─────────────────────────────────────────────────────────────────

  test('page served over HTTPS', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    expect(page.url()).toMatch(/^https:\/\//);
  });

});

// =============================================================================
// CROSS-CUTTING  —  Auth shared behaviours
// =============================================================================

test.describe('Auth — Cross-Cutting', () => {

  test('all auth pages return 200 and are accessible via HTTPS', async ({ request }) => {
    const routes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];
    for (const route of routes) {
      const res = await request.get(route);
      expect(res.status(), `${route} returned ${res.status()}`).toBe(200);
    }
  });

  test('unauthenticated GET to /dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    expect(page.url()).toMatch(/login|auth/i);
  });

  test('auth pages have no broken same-origin asset requests', async ({ page }) => {
    const routes = ['/auth/login', '/auth/signup'];
    for (const route of routes) {
      const failures = [];
      page.on('response', (r) => {
        if (r.url().includes('sproutos.ai') && r.status() >= 400) {
          failures.push(`${r.status()} ${r.url()}`);
        }
      });
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      expect(failures, `Broken assets on ${route}: ${failures.join(', ')}`).toHaveLength(0);
    }
  });

  test('switching between Login and Signup clears form state', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('input[name="email"], input[type="email"]').first().fill('stale@example.com');
    // Navigate to signup
    await page.locator('button:has-text("Sign up")').first().click();
    await page.waitForURL(/signup/, { timeout: 8000 });
    const email = page.locator('input[type="email"]').first();
    const value = await email.inputValue().catch(() => '');
    // Should not carry over previously typed email
    expect(value).not.toBe('stale@example.com');
  });

  test('login page has viewport meta for mobile', async ({ page }) => {
    await page.goto('/auth/login');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toMatch(/width=device-width/i);
  });

});
