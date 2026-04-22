# Writing Tests

## Where New Specs Go

All Sprout OS specs live in `tests/sproutos/` and must follow the pattern:

```
tests/sproutos/<feature>.spec.js
```

## Minimal Spec Template

```js
const { test, expect } = require('@playwright/test');

test.describe('Sprout OS — <Feature Name>', () => {

  test('<what this test proves>', async ({ page }) => {
    await page.goto('/<route>');
    await expect(page).toHaveTitle(/sprout/i);
  });

});
```

## Best Practices

### Use `baseURL` — not hard-coded URLs
```js
await page.goto('/login');              // ✅
await page.goto('https://sproutos.ai/login'); // ❌
```
`baseURL` comes from `SPROUTOS_URL` env var or `playwright.config.js`.

### Prefer user-facing locators
```js
page.locator('button:has-text("Sign up")')  // ✅
page.locator('.btn-primary-2xl-rounded')    // ❌ fragile
```

### Use `.first()` when multiple matches are possible
Prevents strict-mode violations when the same text appears on the page twice.

### Skip gracefully for optional features
```js
const faq = page.locator('h2:has-text("FAQ")').first();
if (await faq.isVisible({ timeout: 3000 }).catch(() => false)) {
  await expect(faq).toBeVisible();
} else {
  test.skip(true, 'No FAQ section — skipping');
}
```

### Don't hard-code secrets
Read from `process.env.TEST_USER_EMAIL` etc. Never paste a real password into a spec.

## Adding a New Suite

1. Create `tests/sproutos/<name>.spec.js`
2. Add an npm script to `package.json`:
   ```json
   "test:<name>": "playwright test tests/sproutos/<name>.spec.js"
   ```
3. Run it: `npm run test:<name>`
4. Commit & push — CI runs it automatically

## Debugging

```bash
# Headed (watch the browser)
npx playwright test tests/sproutos/auth.spec.js --headed

# Step through with Playwright Inspector
npx playwright test --debug

# Open last trace
npx playwright show-trace
```
