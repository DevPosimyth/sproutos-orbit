# Sprout OS — Homepage QA Report

**Date:** 2026-04-27
**Tested URL:** https://sproutos.ai/
**Test Suite:** `tests/sproutos/homepage.spec.js`
**Viewports Tested:** Desktop (1440×900) · Mobile (375×812) · Tablet (WebKit — blocked, see Issue 14)
**Result:** 34 Passed · 41 Failed (17 genuine issues + 24 blocked by missing WebKit browser)

---

## Automated Test Summary

| Viewport | Passed | Failed | Notes |
|---|---|---|---|
| Desktop (Chromium) | 14 | 11 | Genuine page issues |
| Mobile (Chromium) | 18 | 7 | Some tests pass that fail on desktop (responsive footer) |
| Tablet (WebKit) | 0 | 25 | All blocked — WebKit browser not installed |

> **Fix tablet:** Run `npx playwright install` to install the missing WebKit browser binary.

---

## Issues Found

---

### Issue 1

**Priority:** High
**Issue Name:** No Semantic `<header>` / `<nav>` / `<main>` Elements

**Issue:**
The entire page is built with `<div>` elements. There is no `<header>`, `<nav>`, `<main>`, `role="navigation"`, or `role="main"` landmark. This violates WCAG 2.1 (landmark regions), hurts screen reader navigation, and causes 5 automated test failures.

**What's there:** `header_count: 0`, `nav_count: 0`, `main_count: 0`, `role_navigation: 0`, `role_main: 0`

**Steps to Reproduce:**
1. Open https://sproutos.ai/ in any browser
2. Open DevTools → Elements and search for `<header>`, `<nav>`, `<main>`
3. None exist

**Expected:**
- Top navigation bar wrapped in `<header>`
- Navigation links wrapped in `<nav aria-label="Primary navigation">`
- Page content body wrapped in `<main>`

**Actual:**
All structural regions are plain `<div>` elements with no ARIA roles.

**Failing Tests:** Navigation › site header/navbar is visible, logo is present, Performance Baseline › page has `<main>` landmark

---

### Issue 2

**Priority:** High
**Issue Name:** No `<h2>` Headings — Broken Heading Hierarchy

**Issue:**
The page has exactly 1 `<h1>` ("The AI Operating System for Modern WordPress Agencies") and **zero `<h2>` or `<h3>` headings**. All section headings appear to use custom `<div>` or `<p>` elements styled to look like headings. This breaks heading structure for screen readers and SEO.

**DOM evidence:** `h1_count: 1`, `h2_count: 0`, `h3_count: 0`

**Steps to Reproduce:**
1. Open https://sproutos.ai/
2. Run in console: `document.querySelectorAll('h2').length` → returns `0`
3. Scroll through the page — visually there appear to be multiple section headings

**Expected:**
Each major content section (Features, How it works, Pricing, etc.) should use `<h2>` for its heading, with `<h3>` for sub-items.

**Actual:**
All section headings are unsemantic `<div>` or `<p>` elements.

**Failing Tests:** Features Section › page has at least one h2 section heading

---

### Issue 3

**Priority:** High
**Issue Name:** Logo Image Not Linked to Homepage

**Issue:**
There are 146 `<img>` elements on the page, but **zero images are wrapped in an `<a>` tag** (`logo_with_link: 0`). The SproutOS logo in the header does not link back to the homepage, which is a universal web convention and accessibility expectation.

**Steps to Reproduce:**
1. Open https://sproutos.ai/
2. Click the SproutOS logo in the top-left header
3. Nothing happens / page does not navigate to homepage

**Expected:**
Logo should be an `<a href="/">` wrapping the `<img>`, allowing users to return to the homepage by clicking the logo.

**Actual:**
Logo is a plain `<img>` inside a `<div>`, with no anchor element.

**Failing Tests:** Navigation › logo is present and links to homepage

---

### Issue 4

**Priority:** High
**Issue Name:** Hero CTA Button Uses Non-Standard Text — No "Get Started" / "Sign Up" Variant

**Issue:**
The hero section uses `"Join Early Access"` as the primary CTA (3 instances found). The test suite and standard marketing conventions expect a CTA with text like "Get Started", "Try Free", "Start Free", or "Sign Up". While "Join Early Access" is intentional branding, there is no secondary CTA with standard onboarding language, which can reduce conversion for users unfamiliar with the product.

**Failing Tests:** Hero Section › hero has a primary CTA button

**Note:** Test 15 (CTA link points to signup route) passes because the "Join Early Access" link correctly targets `/auth/signup`. The test selector is the issue here — the test suite should be updated to include "Join Early Access" as a valid CTA text.

**Recommended Action (Two-track):**
- Update `homepage.spec.js` line 148 to add `a:has-text("Join Early Access")` to the selector
- Consider adding a secondary CTA with "Log in" or "Get Started" text for returning users

---

### Issue 5

**Priority:** High
**Issue Name:** Desktop Footer Hidden by Responsive CSS — Tests See Hidden Mobile Footer

**Issue:**
There are **two `<footer>` elements** on the page — one for mobile (`md:hidden`) and one for desktop (`hidden md:flex`). On desktop (1440px), the first footer element has Tailwind class `md:hidden` which means it is `display:none`. Tests that use `footer` or `footer a` and `.first()` always get the **mobile footer which is invisible on desktop**, causing "element is hidden" failures.

**DOM evidence:**
```
Footer 1 (mobile): class="md:hidden ..." → hidden on desktop
Footer 2 (desktop): class="hidden md:flex ..." → visible on desktop
```

**Steps to Reproduce:**
1. Open https://sproutos.ai/ at 1440px viewport
2. Inspect DOM for `footer` elements
3. First `<footer>` has `display:none` on desktop

**Expected:**
Either one responsive footer, or both footers should have appropriate `role="contentinfo"` and tests should target the visible one explicitly.

**Actual:**
Two footers exist; the DOM order causes test selectors to always find the hidden one first on desktop.

**Failing Tests (Desktop):** Footer › footer is present, footer has Privacy Policy link, footer has Terms link

---

### Issue 6

**Priority:** Medium
**Issue Name:** Footer Copyright Text Present but Unreachable by Tests

**Issue:**
The copyright text "SproutOS © 2026" and "© POSIMYTH Innovation 2026" are present in both footers, but the test `footer.innerText()` returns an empty string because Playwright's `innerText()` returns `""` for elements with `display:none`. The test regex `/©|copyright|\d{4}/i` then fails on the empty string. The data exists — the test targeting is wrong.

**Steps to Reproduce:**
1. Inspect the desktop footer (second `footer` element): contains "SproutOS © 2026"
2. The test targets `page.locator('footer')` which resolves to the first (hidden) footer on desktop

**Expected:**
Copyright text "© 2026" / "© POSIMYTH Innovation 2026" correctly detected.

**Actual:**
`innerText()` on the hidden footer returns `""`.

**Recommended Fix:**
```js
// In homepage.spec.js — target the visible footer
const footer = page.locator('footer').filter({ hasNotCSS: 'display', value: 'none' }).first();
// Or simply target by content:
const footer = page.locator('footer').last();
```

**Failing Tests (Desktop):** Footer › footer contains copyright text

---

### Issue 7

**Priority:** Medium
**Issue Name:** No Skip Navigation Link

**Issue:**
The homepage has no "Skip to main content" link, which is a WCAG 2.1 Level A requirement (Success Criterion 2.4.1 — Bypass Blocks). Screen reader and keyboard-only users must tab through the entire header before reaching content on every page.

**DOM evidence:** `skip_nav: 0`

**Expected:**
An `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>` as the first element in `<body>`, visible on keyboard focus.

**Actual:**
No skip navigation link exists.

---

### Issue 8

**Priority:** Medium
**Issue Name:** All Images Missing Explicit `width` and `height` Attributes

**Issue:**
146 images are present on the page; none of the first 30 checked had explicit `width` and `height` attributes (`imgs_without_dimensions: 30`). This causes Cumulative Layout Shift (CLS) as the browser cannot reserve space for images before they load, potentially degrading Core Web Vitals scores.

**Expected:**
All `<img>` elements should have `width` and `height` attributes matching the intrinsic image size, or use CSS aspect-ratio to reserve space.

**Actual:**
`<img src="..." alt="...">` — no dimensions.

---

### Issue 9

**Priority:** Medium
**Issue Name:** Generic `alt="Preview"` on All Inspected Images

**Issue:**
The first 5 images checked all have `alt="Preview"` — a non-descriptive placeholder that provides no context to screen reader users. All content images should have meaningful alt text describing what the image depicts.

**DOM evidence:**
```
{ "alt": "Preview", "src": "/images/trimhouse.png" }
{ "alt": "Preview", "src": "/images/hopebridge.png" }
```

**Expected:**
Descriptive alt text such as `"Trim House website preview"` or the project/business name shown.

**Actual:**
All images use `alt="Preview"`.

---

### Issue 10

**Priority:** Medium
**Issue Name:** No Feature Cards or Section Structure Detectable

**Issue:**
The page has only 1 `<section>` element. Feature content appears in nested `<div>` chains with custom class names (not containing `feature`, `card`, or `benefit`). This is a markup quality issue: content sections should use `<section>` or `<article>` elements with accessible headings.

**DOM evidence:** `section_count: 1`, `feature_class_count: 0`, `ul_li_count: 0`

**Failing Tests:** Features Section › feature cards or list items are rendered

---

### Issue 11

**Priority:** Medium
**Issue Name:** `robots.txt` Missing `/scope`, `/design`, `/manage` Paths

**Issue:**
The `robots.txt` disallows `/api/`, `/admin/`, `/project/`, `/dashboard/`, but is missing auth-gated app paths: `/scope/`, `/design/`, and `/manage/`. These paths should also be disallowed to prevent indexing of private app pages.

**Current robots.txt:**
```
Disallow: /api/
Disallow: /admin/
Disallow: /project/
Disallow: /dashboard/
```

**Missing:**
```
Disallow: /scope/
Disallow: /design/
Disallow: /manage/
```

---

### Issue 12

**Priority:** Medium
**Issue Name:** `og:description` Shorter than `meta description` — Inconsistency

**Issue:**
The `og:description` (`"Plan, build, automate, and scale WordPress websites from one unified AI-powered platform."` — ~90 chars) is noticeably shorter than the `meta description` (`"SproutOS is an AI-powered operating system..."` — 152 chars). While not broken, for best social-sharing previews the OG description should be a polished standalone pitch, not just a truncated variant.

---

### Issue 13

**Priority:** Low
**Issue Name:** OG Image URL Points to a PNG — Dimensions Unverified

**Issue:**
`og:image` points to `https://sproutos.ai/LandingPageImage.png`. The recommended OG image size is 1200×630px. The dimensions of this image were not verified in this test run. An incorrectly sized OG image can result in poor link previews on social platforms.

**Action:** Verify `/LandingPageImage.png` is at least 1200×630px using an image inspection tool.

---

### Issue 14 (Test Infrastructure)

**Priority:** High (Blocks all tablet/Safari tests)
**Issue Name:** WebKit Browser Not Installed — All Tablet Tests Fail

**Issue:**
All 25 tablet (`sproutos-tablet`) test cases fail immediately with:
```
Error: browserType.launch: Executable doesn't exist at
/Users/devpanchal/Library/Caches/ms-playwright/webkit-2272/pw_run.sh
```

This blocks all Safari/iPad rendering verification.

**Fix:**
```bash
npx playwright install
```

---

## What Passes (Confirmed Working)

| Area | Check | Result |
|---|---|---|
| Page Load | HTTP 200 response | ✅ Pass |
| Page Load | Non-empty `<title>` (54 chars, within 50–60 range) | ✅ Pass |
| Page Load | No uncaught JS errors | ✅ Pass |
| Page Load | No 4xx/5xx asset requests | ✅ Pass |
| Performance | Page load < 10s (actual: ~1.3s) | ✅ Pass |
| Meta / SEO | `meta[name="description"]` present (152 chars) | ✅ Pass |
| Meta / SEO | `og:title` present and non-empty | ✅ Pass |
| Meta / SEO | `og:image` present | ✅ Pass |
| Meta / SEO | `og:description` present | ✅ Pass |
| Meta / SEO | `og:url` present (`https://sproutos.ai`) | ✅ Pass |
| Meta / SEO | `og:type` = `website` | ✅ Pass |
| Meta / SEO | `og:site_name` = `SproutOS` | ✅ Pass |
| Meta / SEO | Canonical URL points to https | ✅ Pass |
| Meta / SEO | `meta[name="robots"]` = `index, follow` | ✅ Pass |
| Meta / SEO | Twitter card `summary_large_image` | ✅ Pass |
| Meta / SEO | Twitter title present | ✅ Pass |
| Meta / SEO | JSON-LD structured data (Organization schema) | ✅ Pass |
| Meta / SEO | `robots.txt` returns 200 | ✅ Pass |
| Meta / SEO | `sitemap.xml` returns 200 | ✅ Pass |
| Accessibility | `<html lang="en">` present | ✅ Pass |
| Accessibility | `<meta name="viewport">` present | ✅ Pass |
| Navigation | Primary nav links reachable (no 4xx) | ✅ Pass |
| Navigation | Mobile menu toggle visible on 375px viewport | ✅ Pass |
| Hero | `<h1>` heading visible with non-empty text | ✅ Pass |
| Hero | CTA link (`Join Early Access`) targets `/auth/signup` | ✅ Pass |
| Images | All `<main>` images have non-null `alt` attributes | ✅ Pass |
| Footer | Footer links not broken (spot check — 200 responses) | ✅ Pass |
| Footer | Privacy Policy link visible on mobile viewport | ✅ Pass (mobile) |
| Footer | Terms link visible on mobile viewport | ✅ Pass (mobile) |
| Footer | Footer visible on mobile viewport | ✅ Pass (mobile) |
| Footer | Copyright "© 2026" present in DOM | ✅ Present (test selector issue) |

---

## Summary Table

| # | Issue | Priority | Category |
|---|---|---|---|
| 1 | No `<header>` / `<nav>` / `<main>` semantic elements | High | Accessibility / Semantic HTML |
| 2 | No `<h2>` headings — broken heading hierarchy | High | SEO / Accessibility |
| 3 | Logo not linked to homepage | High | UX / Accessibility |
| 4 | Hero CTA uses "Join Early Access" — test selector mismatch | High | UX / Test Coverage |
| 5 | Two responsive footers — hidden mobile footer caught first by tests | High | Semantic HTML / Testing |
| 6 | Footer copyright unreachable by tests (display:none on desktop) | Medium | Testing |
| 7 | No skip navigation link | Medium | Accessibility (WCAG 2.4.1) |
| 8 | All images missing `width`/`height` attributes (CLS risk) | Medium | Performance / CLS |
| 9 | Generic `alt="Preview"` on content images | Medium | Accessibility |
| 10 | No `<section>` / semantic feature cards | Medium | Semantic HTML |
| 11 | `robots.txt` missing `/scope`, `/design`, `/manage` | Medium | SEO / Security |
| 12 | `og:description` shorter than `meta description` | Low | SEO |
| 13 | OG image dimensions unverified | Low | SEO |
| 14 | WebKit browser not installed — all tablet tests blocked | High | Test Infrastructure |

---

## Recommended Actions

### Immediate (before next release)

1. **Install WebKit browser:** `npx playwright install` — unblocks all tablet test runs.
2. **Add semantic landmarks:** Wrap the top nav in `<header>`, navigation links in `<nav>`, page content in `<main>`. This single change resolves Issues 1 and clears 5 test failures.
3. **Link the logo:** Wrap the logo `<img>` in `<a href="/">...</a>`.
4. **Add `<h2>` headings to all feature sections.** Required for both SEO and accessibility.
5. **Update test CTA selector:** Add `a:has-text("Join Early Access")` to the `homepage.spec.js` line 148 locator.

### Short-term

6. **Add skip nav link** at top of `<body>`.
7. **Fix `robots.txt`** to disallow `/scope/`, `/design/`, `/manage/`.
8. **Add `width`/`height`** attributes to all `<img>` elements to prevent CLS.
9. **Replace generic `alt="Preview"`** with descriptive alt text for all content images.
10. **Fix footer test selectors** to target the last/desktop footer or use `.filter()`.

### Nice-to-have

11. Verify OG image dimensions are ≥ 1200×630px.
12. Align `og:description` with `meta description`.
