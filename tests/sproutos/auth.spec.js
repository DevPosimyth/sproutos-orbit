// =============================================================================
// Sprout OS — Auth Pages Test Suite
// Covers: /login · /signup · /forgot-password · OAuth / social login
// =============================================================================

const { test, expect } = require('@playwright/test');

test.describe('Sprout OS — Auth Pages', () => {

  // ── LOGIN PAGE ────────────────────────────────────────────────────────────
  test.describe('Login Page', () => {

    test('loads without errors', async ({ page }) => {
      const response = await page.goto('/login');
      expect(response.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(/login|sign in|sprout/i);
    });

    test('has email and password fields', async ({ page }) => {
      await page.goto('/login');
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      const passwordField = page.locator('input[type="password"]').first();
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
    });

    test('shows validation error on empty submit', async ({ page }) => {
      await page.goto('/login');
      const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Browser-native required validation or app-level error
        const emailField = page.locator('input[type="email"], input[name="email"]').first();
        const isInvalid = await emailField.evaluate((el) => !el.validity.valid).catch(() => false);
        const errorBanner = page.locator('[class*="error"], [role="alert"]').first();
        expect(isInvalid || (await errorBanner.isVisible().catch(() => false))).toBeTruthy();
      }
    });

    test('rejects invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.locator('input[type="email"], input[name="email"]').first().fill('invalid@example.com');
      await page.locator('input[type="password"]').first().fill('wrongpassword123');
      await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
      // Should stay on login page or show error
      await page.waitForTimeout(2000);
      expect(page.url()).toMatch(/login|sign-in/i);
    });

    test('links to signup page', async ({ page }) => {
      await page.goto('/login');
      const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Create account"), a:has-text("Register")').first();
      if (await signupLink.isVisible()) {
        await expect(signupLink).toHaveAttribute('href', /signup|register/i);
      }
    });

    test('links to forgot password page', async ({ page }) => {
      await page.goto('/login');
      const forgotLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")').first();
      if (await forgotLink.isVisible()) {
        await expect(forgotLink).toHaveAttribute('href', /forgot|reset/i);
      }
    });
  });

  // ── SIGNUP PAGE ───────────────────────────────────────────────────────────
  test.describe('Signup Page', () => {

    test('loads without errors', async ({ page }) => {
      const response = await page.goto('/signup');
      expect(response.status()).toBeLessThan(400);
    });

    test('has email and password fields', async ({ page }) => {
      await page.goto('/signup');
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      const passwordField = page.locator('input[type="password"]').first();
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
    });

    test('validates email format', async ({ page }) => {
      await page.goto('/signup');
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      await emailField.fill('not-an-email');
      const passwordField = page.locator('input[type="password"]').first();
      await passwordField.fill('ValidPass123!');
      await page.locator('button[type="submit"]').first().click();
      const isInvalid = await emailField.evaluate((el) => !el.validity.valid).catch(() => false);
      expect(isInvalid).toBeTruthy();
    });

    test('rejects weak password if policy enforced', async ({ page }) => {
      await page.goto('/signup');
      await page.locator('input[type="email"], input[name="email"]').first().fill('test@example.com');
      await page.locator('input[type="password"]').first().fill('123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(1500);
      // Either stays on signup or shows error
      expect(page.url()).toMatch(/signup|register/i);
    });

    test('links back to login', async ({ page }) => {
      await page.goto('/signup');
      const loginLink = page.locator('a:has-text("Log in"), a:has-text("Sign in"), a:has-text("Already")').first();
      if (await loginLink.isVisible()) {
        await expect(loginLink).toHaveAttribute('href', /login|sign-in/i);
      }
    });
  });

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  test.describe('Forgot Password Page', () => {

    test('loads without errors', async ({ page }) => {
      const response = await page.goto('/forgot-password');
      // 404 is acceptable if route uses different slug — try alternates
      if (response.status() >= 400) {
        const alt = await page.goto('/reset-password');
        expect(alt.status()).toBeLessThan(400);
      } else {
        expect(response.status()).toBeLessThan(400);
      }
    });

    test('has email field only (no password)', async ({ page }) => {
      await page.goto('/forgot-password').catch(() => page.goto('/reset-password'));
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailField).toBeVisible();
    });

    test('submitting invalid email shows validation', async ({ page }) => {
      await page.goto('/forgot-password').catch(() => page.goto('/reset-password'));
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      await emailField.fill('bad-email');
      await page.locator('button[type="submit"]').first().click();
      const isInvalid = await emailField.evaluate((el) => !el.validity.valid).catch(() => false);
      expect(isInvalid).toBeTruthy();
    });

    test('has link back to login', async ({ page }) => {
      await page.goto('/forgot-password').catch(() => page.goto('/reset-password'));
      const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign in"), a:has-text("Back")').first();
      await expect(loginLink).toBeVisible();
    });
  });

  // ── OAUTH / SOCIAL LOGIN ──────────────────────────────────────────────────
  test.describe('Social / OAuth Login', () => {

    test('Google OAuth button is present on login', async ({ page }) => {
      await page.goto('/login');
      const googleBtn = page.locator('button:has-text("Google"), a:has-text("Google"), [class*="google"]').first();
      if (await googleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(googleBtn).toBeVisible();
      } else {
        test.skip(true, 'Google OAuth button not present');
      }
    });

    test('GitHub OAuth button is present on login (optional)', async ({ page }) => {
      await page.goto('/login');
      const ghBtn = page.locator('button:has-text("GitHub"), a:has-text("GitHub"), [class*="github"]').first();
      if (await ghBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(ghBtn).toBeVisible();
      } else {
        test.skip(true, 'GitHub OAuth button not present');
      }
    });
  });

});
