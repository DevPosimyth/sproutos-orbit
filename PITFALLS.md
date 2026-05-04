# Sprout OS Orbit — Test Writing Guide & Common Pitfalls

> Before you write a test, ask: "Would a real Sprout OS user care about this?"
> If the answer is no, it's a shallow check — not a meaningful QA test.

---

## The Core Difference

**Good QA tests what the user experiences. Bad QA tests that HTML elements exist.**

| Good QA | Bad QA |
|---|---|
| Can I complete the Guided Brief in under 3 minutes? | Does the guided brief page return 200? |
| Does the AI chat in the Sitemap Editor actually generate pages? | Does the AI chat input field exist in the DOM? |
| Does my color palette apply across all section variants? | Does the color picker render? |
| Can a Member role NOT access team management? | Does the team management route return a response? |
| Does the MCP connection persist after page refresh? | Does the MCP connect button exist? |

---

## Common Pitfalls

### 1. Testing presence, not behavior

**Wrong**: Assert that a button exists.
**Right**: Click the button, wait for the result, assert the outcome is correct.

If your test only checks `toBeVisible()` and never clicks anything — it adds no QA value.

---

### 2. Static page loads as "tests"

**Wrong**: Navigate to `/design` → take a screenshot → done.
**Right**: Navigate → wait for content to load → interact with the color palette → change a variant → verify the change persisted.

A test with no `click()`, `fill()`, or `waitFor()` after navigation is a health check, not a QA test.

---

### 3. Asserting settings exist, not that they work

**Wrong**: "Color palette is set = pass."
**Right**: "Color palette primary color appears correctly on the homepage hero section and button components = pass."

A value being saved in a form means nothing if it doesn't render correctly in the output.

---

### 4. Testing broken states as valid flows

Never write assertions against:
- Loading spinners frozen mid-state
- Blank pages with no content (empty project, no workspace)
- Auth error pages (`401 Unauthorized`, redirect loops)
- AI error responses ("Something went wrong. Please try again.")
- Toast errors that appear immediately on page load

These are **environment failures or setup issues** — not valid test outcomes. Mark the test as needing setup and fix the environment first.

---

### 5. Assuming app state

Every test must set up the state it needs before asserting:
- User is logged in (use stored auth state via `storageState`)
- At least one project exists in the workspace
- The Guided Brief is completed before testing the Sitemap Editor
- The sitemap has pages before testing the Design Editor
- MCP is connected before testing Manage Mode Build

Never test a feature that depends on a prior step without completing that step first. Sprout OS is a sequential workflow — test it that way.

---

### 6. Hardcoding credentials in spec files

**Wrong**: `await page.fill('#email', 'dev@sproutos.ai')` directly in the spec.
**Right**: `await page.fill('#email', process.env.TEST_USER_EMAIL)`

All credentials must come from `.env` (loaded via `qa.config.json`). Any hardcoded email, password, or token in a spec file is a security violation and will fail the code quality gate.

---

### 7. Using `test.only()` and forgetting to remove it

**Wrong**: Leaving `test.only('debug this flow', ...)` committed to the repo.
**Right**: Never commit `.only()`. Use `--grep` flags or run the specific spec file directly.

`test.only()` silently skips every other test in the file. The code quality gate (`scripts/qa-code-quality.sh`) will catch and fail any `.only()` in the codebase.

---

### 8. Measuring dynamic DOM incorrectly

Counting DOM elements on a React/Next.js page may return 0 if done before hydration.

**Fix**: Always use `page.waitForSelector()` or `page.waitForLoadState('networkidle')` before asserting dynamic content. Use `page.evaluate()` for counts inside fully-rendered DOM.

```js
// Wrong — runs before React hydrates
const count = await page.locator('.section-card').count();

// Right — waits for at least one item to appear
await page.waitForSelector('.section-card');
const count = await page.locator('.section-card').count();
```

---

### 9. Ignoring error states

Good QA always tests what happens when things go wrong:
- What does the user see if the AI times out mid-generation?
- What happens if they submit the Guided Brief with required fields empty?
- What if MCP loses connection during a Manage Mode build?
- What does the approval queue show when there are no pending approvals?

Every feature has a failure path. Test it.

---

### 10. Missing RBAC coverage

Sprout OS has three roles: **Owner**, **Admin**, **Member**.

Every spec that touches team-restricted features must verify:
- Owner can perform the action
- Member is blocked from performing the action (or sees a restricted view)

If your spec only tests as the Owner — RBAC is untested.

---

### 11. Not checking console errors

Every spec should listen for console errors on the pages it visits:

```js
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', err => consoleErrors.push(err.message));

// At the end of the test:
expect(consoleErrors.filter(e => !isAllowedError(e))).toHaveLength(0);
```

A test that passes visually but leaves JS errors in the console is not a clean pass.

---

### 12. Making claims without context

**Wrong**: "The Sitemap Editor has no keyboard shortcut — FAIL."
**Right**: "The Sitemap Editor has no keyboard shortcut for adding a page. For power users working on large sitemaps, this is a friction point worth surfacing."

QA notes must explain WHO is affected and WHY it matters — not just WHAT is missing.

---

## Writing Good Test Flows

### Structure of a good Sprout OS test

```
TEST ID | Feature Area | What real user is trying to accomplish
────────────────────────────────────────────────────────────────
1. Setup   : Ensure user is logged in, workspace + project exist
2. Navigate: Start from where the user would start (dashboard, not direct URL)
3. Interact: Do what the user would do (click, type, select, submit)
4. Verify  : Check the outcome the user cares about (not just HTTP status)
5. Cleanup : Reset state if the test mutates shared data
```

---

### Checklist before marking a test complete

- [ ] Does the test perform at least one meaningful user interaction?
- [ ] Is the app in a realistic state before assertions begin?
- [ ] Are `waitForSelector` / `waitForLoadState` used before dynamic assertions?
- [ ] Are credentials loaded from environment, not hardcoded?
- [ ] Is there no `.only()` left in the file?
- [ ] Does the test handle the error path, not just the happy path?
- [ ] Are console errors checked (or explicitly allowed)?
- [ ] Is RBAC covered if the feature is role-restricted?

---

## Auth State Setup

Never log in via UI on every test — it's slow and fragile. Use Playwright's stored auth state:

```js
// In playwright.config.js — already configured
use: {
  storageState: '.auth/user.json',  // pre-authenticated session
}
```

Generate the auth state once:

```bash
npx playwright test tests/sproutos/auth.setup.js
```

If `.auth/user.json` doesn't exist — auth-gated tests will redirect to login and fail. Run the setup first.

---

## Sprout OS Flow Dependencies

Sprout OS is a sequential creation workflow. Tests for later steps depend on earlier steps being complete:

```
Guided Brief Wizard
      ↓
Sitemap Editor (requires completed brief)
      ↓
Scope Editor (requires sitemap)
      ↓
Design Editor (requires scope)
      ↓
Export (requires design)
      ↓
Manage Mode (requires exported / connected site)
```

If you're testing the Design Editor — the Guided Brief and Sitemap must already exist in the test workspace. Set this up in `beforeAll` or use a seeded test account.

---

## AI Feature Testing Rules

When testing AI-powered features (Sitemap AI Chat, AI Text Popup):

- Always set a **timeout** long enough for real AI responses (≥ 30s)
- Always test the **error path**: what shows when AI returns an error
- Never assert the exact wording of AI-generated content — it's non-deterministic
- Assert the **structure** of the output (number of pages generated, presence of headings) not the exact text
- Always test what happens when the **token limit is reached**

```js
// Wrong — AI text is non-deterministic
await expect(page.locator('.ai-output')).toHaveText('About Us page for a tech startup');

// Right — assert structure
await expect(page.locator('.sitemap-page-item')).toHaveCount.greaterThan(0);
await expect(page.locator('.ai-output')).not.toBeEmpty();
```

---

## What Goes in This Repo vs What Stays Local

**Repo (committed to GitHub):**
- Framework code (config, scripts, checklists, docs)
- Generic spec files (no real credentials, no hardcoded workspace IDs)
- This PITFALLS guide
- QA runner scripts

**Local only (gitignored):**
- `.env` (real credentials)
- `.auth/` (stored Playwright auth sessions)
- `reports/` (all test output — screenshots, videos, HTML reports)
- `test-results/` (Playwright artifacts)

This keeps Orbit reusable across environments — not tied to any specific workspace or account.
