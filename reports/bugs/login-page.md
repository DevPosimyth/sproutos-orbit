# Sprout OS — Login Page Bug Report
**Date:** 2026-05-04
**Spec:** `tests/sproutos/login-pages.spec.js`
**Run:** Docker · `sproutos-desktop` (Chromium 1440px)
**Result:** 50 passed · 14 failed

---

## Summary

| Category | Count |
|---|---|
| Real product bugs | 7 |
| Account / environment issue | 1 |
| Spec logic issues (no product defect) | 3 |

---

## Real Product Bugs

---

### Login redirects to email verification instead of dashboard

**Severity:** P1 — High
**Area:** Functionality / Logic

**Issue:** Submitting valid credentials for `tester0107@yopmail.com` navigates to `/auth/verify-email?email=tester0107%40yopmail.com` instead of `/dashboard`. The account email has not been verified, so all post-login flows (session persistence, authenticated redirect, URL safety check) are also broken.

**Steps to Reproduce:**
1. Go to `https://sproutos.ai/auth/login`
2. Enter `tester0107@yopmail.com` and correct password
3. Click Login

**Expected Result:** Redirect to `/dashboard` after successful login
**Actual Result:** Redirect to `/auth/verify-email?email=tester0107%40yopmail.com`

**Note:** The test account's email needs to be verified before QA can run login-dependent tests. Alternatively, provide a pre-verified test account in `.env`.

---

### Password eye-toggle does not reveal the password

**Severity:** P2 — Medium
**Area:** UI / Functionality

**Issue:** The eye-toggle button is present on the login page but clicking it does not change the password field type from `password` to `text`. The password remains hidden after toggle click.

**Steps to Reproduce:**
1. Go to `https://sproutos.ai/auth/login`
2. Type any text into the password field
3. Click the eye-toggle icon next to the password field

**Expected Result:** Password field type changes to `text` — entered text becomes visible
**Actual Result:** Password field type remains `password` — text stays hidden

---

### axe-core WCAG 2.1 AA accessibility violations on /auth/login

**Severity:** P1 — High
**Area:** Accessibility

**Issue:** Running `axe-core` with WCAG 2.1 AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) on the login page produces critical or serious violations. The release gate requires zero critical/serious violations.

**Steps to Reproduce:**
1. Navigate to `https://sproutos.ai/auth/login`
2. Run: `npx axe https://sproutos.ai/auth/login --tags wcag2a,wcag2aa`

**Expected Result:** Zero critical or serious axe-core violations
**Actual Result:** One or more critical/serious violations detected (see Playwright HTML report for full violation list)

---

### Submit button touch target below 44px on mobile

**Severity:** P2 — Medium
**Area:** Responsive / Accessibility

**Issue:** The Login submit button height is less than 44px on a 375px mobile viewport, violating WCAG 2.5.5 (Target Size) and Sprout OS minimum touch target requirement of 44×44px.

**Steps to Reproduce:**
1. Open `https://sproutos.ai/auth/login` at 375px viewport width
2. Inspect the bounding box of the `button[type="submit"]`

**Expected Result:** Button height ≥ 44px
**Actual Result:** Button height < 44px

---

### Login page missing a single H1 heading

**Severity:** P2 — Medium
**Area:** SEO / Accessibility

**Issue:** The login page does not have exactly one `<h1>` element. The page either has zero H1s or more than one, violating both SEO best practice (one descriptive H1 per page) and WCAG 1.3.1 (Info and Relationships).

**Steps to Reproduce:**
1. Navigate to `https://sproutos.ai/auth/login`
2. Run in console: `document.querySelectorAll('h1').length`

**Expected Result:** Exactly 1 `<h1>` element present (e.g., "Log in to Sprout OS")
**Actual Result:** H1 count ≠ 1

---

### Login page missing noindex meta tag

**Severity:** P2 — Medium
**Area:** SEO

**Issue:** The `/auth/login` page is an auth-gated route that should not be indexed by search engines. It is missing a `<meta name="robots" content="noindex">` tag, meaning it may appear in search results.

**Steps to Reproduce:**
1. Navigate to `https://sproutos.ai/auth/login`
2. Run in console: `document.querySelector('meta[name="robots"]')`

**Expected Result:** `<meta name="robots" content="noindex, nofollow">` present in `<head>`
**Actual Result:** No robots meta tag found

---

### Forgot Password button does not navigate to forgot-password page

**Severity:** P2 — Medium
**Area:** Functionality

**Issue:** Clicking the "Forgot Password?" button on the login page does not navigate to the forgot-password route within 8 seconds. The URL pattern `/forgot.?password|reset/i` is not matched after the click.

**Steps to Reproduce:**
1. Go to `https://sproutos.ai/auth/login`
2. Click "Forgot Password?"

**Expected Result:** Navigate to `/auth/forgot-password` or similar reset URL within 2 seconds
**Actual Result:** Navigation timeout — URL does not change to a forgot-password route

---

## Account / Environment Issue

---

### Test account email unverified — blocks all post-login test coverage

**Severity:** P0 — Blocker (environment, not product)
**Area:** Test Infrastructure

**Issue:** The test account `tester0107@yopmail.com` in `.env` has not verified its email. Every test that submits valid credentials and waits for `/dashboard` will timeout at 25 seconds. This blocks 6 tests across Functionality, Logic, and Security dimensions.

**Action Required:**
1. Go to `yopmail.com` inbox for `tester0107`
2. Find the Sprout OS verification email and click the link
3. Confirm account reaches `/dashboard` manually
4. Re-run: `docker compose run --rm sproutos-qa npx playwright test tests/sproutos/login-pages.spec.js --project=sproutos-desktop`

**Affected tests:**
- `valid credentials redirect to /dashboard`
- `session persists after page refresh`
- `already-authenticated user is redirected away from /auth/login`
- `no sensitive data leaks into URL after login`
- `wrong password for valid email — error shown, not locked after 1 attempt`

---

## Spec Logic Issues (No Product Defect)

| Test | Issue | Fix |
|---|---|---|
| `SproutOS logo or brand name is visible` | Selector `img[alt*="Sprout" i], [class*="logo"]` matches nothing — actual logo class unknown | Inspect DOM and update selector |
| `focus is not trapped on page load` | `activeElement === BODY` on fresh page load is normal, not a focus trap — assertion logic is wrong | Fix: check focus trap on Tab press, not on load |
| `keyboard: Tab reaches email → password → submit in order` | First Tab lands on a link/element not in the expected type set | Relax assertion or inspect actual first-tab target |

