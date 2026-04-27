# Sprout OS — QA Guidelines

> **This document is mandatory reading before performing any QA on SproutOS.**
> Follow every section in order. Do not skip steps. Do not improvise the report format.

**Product:** SproutOS — https://sproutos.ai
**Owner:** POSIMYTH Innovation
**Last Updated:** 2026-04-27

---

## Table of Contents

1. [QA Philosophy](#1-qa-philosophy)
2. [Roles & Responsibilities](#2-roles--responsibilities)
3. [Environment Setup](#3-environment-setup)
4. [Severity & Priority Classification](#4-severity--priority-classification)
5. [QA Execution Process](#5-qa-execution-process)
6. [What to Test — Scope Per Area](#6-what-to-test--scope-per-area)
7. [Pass / Fail Thresholds](#7-pass--fail-thresholds)
8. [Bug Reporting Standard](#8-bug-reporting-standard)
9. [Automated Test Suite Guide](#9-automated-test-suite-guide)
10. [Manual QA Checklist References](#10-manual-qa-checklist-references)
11. [Common Pitfalls — Know Before You Test](#11-common-pitfalls--know-before-you-test)
12. [QA Report Format](#12-qa-report-format)
13. [Sign-off & Release Gate](#13-sign-off--release-gate)

---

## 1. QA Philosophy

### Core Principles

**Test like a real user, think like an attacker.**
Every test session must cover the happy path, the edge case, and the intentional abuse case. A QA run that only verifies buttons click is not QA — it is theatre.

**Automated tests are a floor, not a ceiling.**
The test suite (`tests/sproutos/`) catches regressions. Manual QA catches what automation misses: visual glitches, unclear copy, confusing flows, and anything that "works technically but feels wrong."

**Every failure is a finding, not a blocker.**
Document everything — pass or fail. A QA report with only failures is incomplete. Passing items give the team confidence in what was verified.

**If you can reproduce it, it's a bug.**
Never dismiss an issue because "it only happened once." Log it, note the frequency, and assign a severity. The team decides whether to fix or defer — not the QA engineer.

**Context matters.**
Test on the same environments users actually run: Chrome desktop, Mobile Safari, Firefox. Test with a real account that has real data, not just a fresh empty account.

---

## 2. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| **QA Engineer** | Execute test runs, write bug reports, update QA report file, flag blockers |
| **Senior QA / Lead** | Review reports, assign priorities, sign off on release gate |
| **Developer** | Fix flagged bugs, update test selectors when UI changes |
| **Product** | Triage Medium/Low issues, decide defer vs fix |

> **Rule:** A QA Engineer never closes their own bugs. Another team member must verify the fix.

---

## 3. Environment Setup

### 3.1 Prerequisites

| Tool | Min Version | Purpose |
|---|---|---|
| Node.js | v18+ | Run test suite |
| npm | v8+ | Package management |
| Git | any | Branch tracking |
| Playwright browsers | latest | Automated test execution |

### 3.2 First-Time Setup

```bash
git clone https://github.com/DevPosimyth/sproutos-orbit.git
cd sproutos-orbit
npm install
npx playwright install          # installs Chromium, Firefox, WebKit
cp qa.config.example.json qa.config.json
```

> **Never commit `qa.config.json` or `.env` — both are gitignored. They contain credentials.**

### 3.3 Configuration

Edit `qa.config.json` with real QA credentials:

```json
{
  "environment": {
    "testUserEmail":     "qa-account@yourworkspace.com",
    "testUserPassword":  "SecureQAPassword123!",
    "testAdminEmail":    "admin@yourworkspace.com",
    "testAdminPassword": "SecureAdminPassword123!"
  }
}
```

Create `.env` at repo root:

```
SPROUTOS_URL=https://sproutos.ai
TEST_USER_EMAIL=qa-account@yourworkspace.com
TEST_USER_PASSWORD=SecureQAPassword123!
```

### 3.4 Test Accounts Required

| Account Type | Purpose | Notes |
|---|---|---|
| **QA User** (`tester`) | Standard user flows | Should have 3+ projects, 2+ workspaces |
| **QA Admin** | Admin-level flows, team management | Should own the QA workspace |
| **Fresh account** | First-time onboarding | Use a new yopmail.com address each run |
| **OAuth account** | Google login flow | Separate Google account for QA |

### 3.5 Viewports to Test

| Label | Width × Height | Browser | Notes |
|---|---|---|---|
| Desktop | 1440 × 900 | Chrome | Primary |
| Mobile | 375 × 812 | Chrome (emulated) | Required for all auth + homepage tests |
| Tablet | 768 × 1024 | Safari / WebKit | Required — run `npx playwright install` |

---

## 4. Severity & Priority Classification

### Severity (impact on users)

| Level | Symbol | Definition | Example |
|---|---|---|---|
| **Critical** | 🔴 | App is broken / data loss / security hole | Password reset skips email verification; cross-tenant data leak |
| **High** | 🟠 | Core feature unusable; no workaround | Login button does nothing; session not persisting |
| **Medium** | 🟡 | Feature partially broken; workaround exists | Footer copyright hidden on desktop; error message not visible |
| **Low** | 🔵 | Cosmetic or minor UX issue | Wrong placeholder text; alignment off by 2px |
| **Info** | ⚪ | Observation, not a bug | Route renamed; selector mismatch in test only |

### Priority (fix urgency)

| Priority | SLA | When to use |
|---|---|---|
| **P0 — Blocker** | Fix before next deploy | Critical severity; security; data loss |
| **P1 — Must Fix** | Fix in current sprint | High severity; blocks core user journey |
| **P2 — Should Fix** | Fix in next sprint | Medium severity; noticeable user impact |
| **P3 — Nice to Fix** | Backlog | Low / cosmetic; no user impact |

> **Rule:** Every Critical severity issue is automatically P0. Every issue affecting authentication, billing, or data security is minimum P1.

---

## 5. QA Execution Process

Follow this order every single time. No exceptions.

### Step 1 — Pull Latest Code

```bash
git checkout main && git pull origin main
npm install          # ensure no new deps are missing
```

### Step 2 — Confirm Browser Binaries

```bash
npx playwright install --dry-run
```
If any browser shows "not installed", run `npx playwright install` before proceeding.

### Step 3 — Run the Automated Suite First

Run against the target scope:

```bash
# Full suite
npm test

# Specific area only
npm run test:homepage
npm run test:login
npm run test:dashboard
npm run test:sitemap
npm run test:design
```

**Record:**
- Total passed / failed
- Any new failures vs last run (regressions)
- All error messages verbatim from the output

> Do NOT skip the automated run even if you plan to do full manual QA. Automation catches regressions in under 5 minutes that manual testing would take 2 hours to find.

### Step 4 — Inspect Every Automated Failure

For each failed test:
1. Read the exact error message
2. Check the screenshot in `test-results/`
3. Reproduce manually in a real browser
4. Determine: is it a **real bug** or a **selector/test issue**?
   - Real bug → create a bug report entry
   - Selector issue → fix the test selector, document in report as "Test Updated"

### Step 5 — Manual QA Pass

After automated tests, run through manual checks using the relevant checklists:

| Area Being Tested | Checklist to Use |
|---|---|
| All pages | [`checklists/ui-ux-checklist.md`](../checklists/ui-ux-checklist.md) |
| Auth / Login / Signup | [`checklists/functionality-checklist.md`](../checklists/functionality-checklist.md) §1 |
| Dashboard & Features | [`checklists/functionality-checklist.md`](../checklists/functionality-checklist.md) §2–28 |
| Console errors | [`checklists/console-errors-checklist.md`](../checklists/console-errors-checklist.md) |
| SEO & Meta | [`checklists/seo-meta-checklist.md`](../checklists/seo-meta-checklist.md) |
| Accessibility | [`checklists/accessibility-checklist.md`](../checklists/accessibility-checklist.md) |
| Performance | [`checklists/performance-checklist.md`](../checklists/performance-checklist.md) |
| Security | [`checklists/security-checklist.md`](../checklists/security-checklist.md) |
| Responsiveness | [`checklists/responsiveness-checklist.md`](../checklists/responsiveness-checklist.md) |
| Cross-browser | [`checklists/cross-browser-checklist.md`](../checklists/cross-browser-checklist.md) |
| Logic / Business rules | [`checklists/logic-checklist.md`](../checklists/logic-checklist.md) |
| Pre-release (full) | [`checklists/pre-release-checklist.md`](../checklists/pre-release-checklist.md) |

### Step 6 — Console Error Check

Open DevTools → Console on every page you test:

```
Filter out: analytics | gtag | facebook | hotjar | sentry | paddle | intercom
```

**Any remaining error is a finding.** Log it with the page URL and full error text.

### Step 7 — Network Request Check

Open DevTools → Network on each key page:
- Filter: status ≥ 400
- Any 4xx/5xx on a same-origin request is a bug (not a third-party CDN)
- Log: method, URL, status code, response body snippet

### Step 8 — Write the QA Report

Follow the **Report Format** in Section 12. Save to `docs/{area}-qa-report.md`.

### Step 9 — Push Report to GitHub

```bash
git add docs/{area}-qa-report.md
git commit -m "Add {area} QA report — {X} pass / {Y} fail"
git push origin main
```

---

## 6. What to Test — Scope Per Area

### 6.1 Homepage (`/`)

| Check | How |
|---|---|
| HTTP 200 response | `request.get('/')` |
| Title, meta desc, OG tags, canonical | DevTools → Elements → `<head>` |
| `<header>`, `<nav>`, `<main>`, `<footer>` semantic elements | `document.querySelector('header')` in console |
| `<h1>` present and meaningful | DevTools |
| At least one `<h2>` per section | `document.querySelectorAll('h2').length` |
| CTA button visible and links to `/auth/signup` | Click it |
| All images have non-null `alt` attributes | `document.querySelectorAll('img[alt=""], img:not([alt])')` |
| Footer has Privacy Policy + Terms links | Scroll to bottom |
| Footer contains copyright year | Scroll to bottom |
| No broken links (4xx on nav/footer links) | DevTools → Network |
| Page loads in < 3s (target) | DevTools → Performance tab |
| Mobile layout at 375px | DevTools → Device toolbar |

### 6.2 Auth Pages (`/auth/login`, `/auth/signup`, `/auth/forgot-password`)

| Check | How |
|---|---|
| All three pages return HTTP 200 | Automated |
| Correct page titles | Browser tab |
| Email + password fields present and functional | Fill and submit |
| Password field type is `"password"` by default | DevTools inspect |
| Password eye toggle shows/hides password | Click toggle, inspect type |
| "Remember me" checkbox toggles | Click it |
| Empty submit shows validation | Click submit with empty fields |
| Invalid email format rejected | Enter `bad@@email` |
| Wrong credentials — error message visible | Enter fake credentials |
| Valid login → redirects to `/dashboard` | Login with QA account |
| Session persists on page refresh | Refresh after login |
| Authenticated users redirected away from `/auth/login` and `/auth/signup` | Log in → visit login URL |
| Unauthenticated `/dashboard` access → redirects to login | Open dashboard in incognito |
| Google + Facebook OAuth buttons visible | Visual check |
| "Forgot Password?" button navigates to email request page | Click it |
| "Sign up" / "Log in" navigation buttons work | Click them |
| HTTPS enforced | Check URL bar |
| Password value never in page source | DevTools → Elements, search for typed value |
| Paddle billing JS error is only noise (filtered) | Console |
| Mobile layout at 375px | DevTools device toolbar |

### 6.3 Dashboard (`/dashboard`)

| Check | How |
|---|---|
| Page loads for authenticated user | Login → navigate |
| Workspace name + plan badge visible | Visual |
| Project grid/list toggle works | Click toggle |
| Project search filters correctly | Type in search |
| Create new project (all 5 methods) | Full flow |
| Recent projects in sidebar ≤ 10 items | Count items |
| Right-click context menu on project | Right-click |
| "Get Started" checklist tracks progress | Complete an item |
| Onboarding tour (first login) covers all steps | New account |
| Trial banner shows for new accounts | New account |
| Token usage widget shows correct values | Visual |

### 6.4 Design Editor

| Check | How |
|---|---|
| Canvas renders all sections in order | Open a project |
| Zoom in/out/fit controls work | Click each |
| Section library panel opens | Click + icon |
| Variant picker shows thumbnails | Click section variant |
| Inline text editing works | Double-click any text |
| Desktop / Tablet / Mobile viewport switch | Click viewport icons |
| Color palette applies to all sections | Pick a palette |
| Font change applies globally | Pick a new font |
| Image picker opens on clicking an image | Click image |
| Export panel opens, all options visible | Click Export |

### 6.5 Manage Mode

| Check | How |
|---|---|
| Connect WordPress site (URL + credentials) | Enter site details |
| Overview tab loads summary cards | Visual |
| Trigger site scan | Click scan button |
| Actions tab: run a low-risk action | Pick any low-risk action |
| Build tab: create a module (Quick Prompt) | Fill prompt, submit |
| Demo mode (`?demo=true`) shows mock data | Add query param to URL |

---

## 7. Pass / Fail Thresholds

These numbers come from `qa.config.example.json`. A test run **fails** if any threshold is breached.

### Performance

| Metric | Threshold | Tool |
|---|---|---|
| Lighthouse Performance | ≥ 80 | Lighthouse CLI / DevTools |
| Lighthouse Accessibility | ≥ 90 | Lighthouse |
| Lighthouse Best Practices | ≥ 85 | Lighthouse |
| Lighthouse SEO | ≥ 90 | Lighthouse |
| LCP (Largest Contentful Paint) | ≤ 2,500 ms | CrUX / Lighthouse |
| CLS (Cumulative Layout Shift) | ≤ 0.10 | Lighthouse |
| TBT (Total Blocking Time) | ≤ 300 ms | Lighthouse |
| FCP (First Contentful Paint) | ≤ 2,000 ms | Lighthouse |
| TTFB (Time to First Byte) | ≤ 800 ms | DevTools → Network |
| INP (Interaction to Next Paint) | ≤ 200 ms | CrUX |

### Bundle Size

| Metric | Threshold |
|---|---|
| Initial JS | ≤ 300 KB |
| Initial CSS | ≤ 100 KB |
| Page load time (total) | ≤ 3,000 ms |

### API Latency (p95)

| Endpoint Type | Threshold |
|---|---|
| Default API | ≤ 500 ms |
| AI endpoints | ≤ 4,000 ms |
| MCP endpoints | ≤ 8,000 ms |
| Crawl endpoints | ≤ 8,000 ms |

### Accessibility

| Metric | Threshold |
|---|---|
| Critical axe-core violations | 0 |
| Serious axe-core violations | 0 |

---

## 8. Bug Reporting Standard

Every bug must use this exact format in the QA report. No exceptions.

```markdown
### Issue {N}

**Priority:** {Critical | High | Medium | Low}
**Issue Name:** {Short, specific, action-oriented title}

**Issue:**
{1–3 sentences. What is broken. What the impact is.}

**Steps to Reproduce:**
1. {Exact step 1 — include URL, account type, data used}
2. {Exact step 2}
3. {Exact step 3 — what you did that triggered the bug}

**Expected:**
{What should happen according to design/spec/common sense}

**Actual:**
{Exactly what happens. Quote error messages verbatim. Include console errors.}

**Environment:**
- Browser: {Chrome 124 / Safari 17 / Firefox 125}
- Viewport: {1440×900 / 375×812 / 768×1024}
- Account: {QA User / Admin / Fresh account}
- Reproducible: {Always / Intermittent / Once}

**Attachments:**
- Screenshot: {path or description}
- Console error: {paste verbatim if present}
```

### Bug Reporting Rules

1. **One bug per report entry.** Never combine two different issues into one.
2. **Reproduce before reporting.** If you can't reproduce it twice, mark it "Intermittent" and document the single occurrence.
3. **Quote errors exactly.** Do not paraphrase console errors or network responses.
4. **Include the account state.** Fresh account vs returning user vs admin changes everything.
5. **Never mark a bug as "won't happen in production"** without developer confirmation.
6. **Security bugs go directly to the team lead** — do not log them in a public GitHub issue.

---

## 9. Automated Test Suite Guide

### 9.1 Test File Map

| File | What it covers |
|---|---|
| `tests/sproutos/homepage.spec.js` | Landing page load, meta, nav, hero, footer, performance |
| `tests/sproutos/login-pages.spec.js` | Login, signup, forgot-password, cross-cutting auth |
| `tests/sproutos/dashboard/home.spec.js` | Dashboard home tab |
| `tests/sproutos/dashboard/sidebar.spec.js` | Sidebar, recent projects |
| `tests/sproutos/dashboard/workspace.spec.js` | Workspace switcher |
| `tests/sproutos/dashboard/settings.spec.js` | User settings |
| `tests/sproutos/dashboard/security.spec.js` | Security / session controls |
| `tests/sproutos/sitemap.spec.js` | Sitemap editor |
| `tests/sproutos/design.spec.js` | Design editor |
| `tests/sproutos/scope.spec.js` | Guided brief |

### 9.2 Run Commands

```bash
npm run test:homepage          # Landing page
npm run test:login             # Auth pages
npm run test:dashboard         # All dashboard tabs
npm run test:dashboard-home    # Dashboard home only
npm run test:sitemap           # Sitemap editor
npm run test:design            # Design editor
npm run test:scope             # Guided brief
npm test                       # Everything
```

### 9.3 Viewport Projects

Tests run against three Playwright projects simultaneously:

| Project Name | Viewport | Browser |
|---|---|---|
| `sproutos-desktop` | 1440 × 900 | Chromium |
| `sproutos-mobile` | 375 × 812 | Chromium (Pixel 5 emulation) |
| `sproutos-tablet` | 768 × 1024 | WebKit (iPad gen 7) |

> If tablet tests all fail immediately, run `npx playwright install` to install the WebKit binary.

### 9.4 Reading Test Output

```
✓  = Passed
✘  = Failed — always investigate, never skip
⚠️  = Warning logged inline (BUG documentation tests)
```

After a run, failed tests produce:
- Screenshot → `test-results/{test-name}/test-failed-1.png`
- Video → `test-results/{test-name}/video.webm`
- Error context → `test-results/{test-name}/error-context.md`

Always check the screenshot before writing a bug report.

### 9.5 When Tests Fail — Decision Tree

```
Test fails
    │
    ├─► Reproduce manually in browser?
    │       │
    │       ├─ YES → Real bug → Document in report
    │       │
    │       └─ NO → Check if selector/URL changed
    │                   │
    │                   ├─ Selector changed → Fix test, document as "Test Updated"
    │                   └─ Route changed → Fix test + document route change as Info
    │
    └─► Intermittent (fails 1/3 runs)?
            │
            └─ Document as Intermittent, assign Medium priority minimum
```

### 9.6 Known Non-Critical Noise to Filter

The following errors appear on every page and are **not bugs**:

| Error Pattern | Source | Action |
|---|---|---|
| `[PADDLE BILLING] You must specify your Paddle Seller ID` | Paddle billing init | Ignore in tests — filter in `appErrors()` helper |
| Third-party analytics errors (gtag, Facebook pixel) | Marketing scripts | Ignore |
| Font loading warnings in console | Google Fonts CORS | Ignore |

---

## 10. Manual QA Checklist References

Use these in Step 5 of the QA process. Each checklist is a standalone file:

| Checklist | Path | When to Use |
|---|---|---|
| Pre-release (master gate) | `checklists/pre-release-checklist.md` | Before every production deploy |
| Functionality | `checklists/functionality-checklist.md` | Feature-level QA |
| UI / UX | `checklists/ui-ux-checklist.md` | Visual + interaction QA |
| Accessibility | `checklists/accessibility-checklist.md` | A11y compliance QA |
| SEO & Meta | `checklists/seo-meta-checklist.md` | Public pages SEO QA |
| Performance | `checklists/performance-checklist.md` | Speed + Core Web Vitals |
| Security | `checklists/security-checklist.md` | Security hardening |
| Console Errors | `checklists/console-errors-checklist.md` | JS error sweep |
| Responsiveness | `checklists/responsiveness-checklist.md` | Mobile / tablet layout |
| Cross-browser | `checklists/cross-browser-checklist.md` | Browser compatibility |
| Logic | `checklists/logic-checklist.md` | Business logic / edge cases |

> **Minimum for any QA run:** pre-release + functionality + ui-ux.
> **Full release QA:** all 11 checklists.

---

## 11. Common Pitfalls — Know Before You Test

These are real issues discovered during SproutOS QA. Always check these first.

### HTML Structure

- **No `<header>`, `<nav>`, `<main>` semantic elements on the homepage** — the entire page uses `<div>`. Tests that look for these elements will fail. This is a known issue, not a selector problem.
- **Two `<footer>` elements** (one `md:hidden` for mobile, one `hidden md:flex` for desktop). Selectors using `.first()` will always get the **hidden** one on desktop. Always use `.last()` or `.filter()` to target the visible footer.
- **Zero `<h2>` elements on the homepage** — all section headings are styled `<div>` or `<p>` elements. Tests checking for `h2` will fail correctly.

### Auth Routes

- **"Forgot Password?" button navigates to `/auth/request-email`**, not `/auth/forgot-password`. Update URL patterns accordingly.
- **`/auth/forgot-password`** is the reset form (requires token). **`/auth/request-email`** is where users enter their email.
- **Authenticated users are NOT redirected away from auth pages** — this is a known missing auth guard, a real bug, not a test issue.

### Console Errors

- **Paddle Billing error** fires on every auth page and is non-critical. Always filter it before asserting zero errors.
- **Google Fonts CORS warnings** are expected and harmless.

### Test Accounts

- Always use `tester0107@yopmail.com` as the QA test user (password in `.env`).
- After running login tests, the session may still be active. Start fresh pages or use new browser contexts between test groups.
- Never use real client accounts for automated testing.

### Selector Patterns That Work

```js
// ✅ DO — specific to actual DOM
page.locator('button:has-text("Continue with Google")')
page.locator('input[name="email"]')
page.locator('button[type="submit"]')
page.locator('footer').last()   // gets desktop footer

// ❌ DON'T — too generic, likely to time out on SproutOS
page.locator('header')          // doesn't exist
page.locator('nav')             // doesn't exist
page.locator('h2')              // doesn't exist on homepage
page.locator('footer').first()  // gets hidden mobile footer on desktop
page.locator('[class*="error"]') // error component uses unknown class
```

### Timing

- After login, always use `page.waitForURL(/dashboard/, { timeout: 20000 })` — not `waitForTimeout`. The timeout gives false passes.
- After clicking OAuth buttons, wait for navigation or popup — don't assert on the original page immediately.
- AI-driven operations (sitemap chat, design agent, text generation) are non-deterministic — skip visual snapshot assertions for these.

---

## 12. QA Report Format

Every QA run must produce a markdown report saved to `docs/`. Use this structure exactly.

```markdown
# Sprout OS — {Area} QA Report

**Date:** YYYY-MM-DD
**Tested URL:** https://sproutos.ai/{path}
**Test Suite:** `tests/sproutos/{file}.spec.js`
**Viewport:** Desktop (1440×900) · Mobile (375×812) · Tablet (768×1024)
**Result:** {N} Passed · {N} Failed · {N} Total

---

## Test Run Summary

| Section | Tests | Passed | Failed |
|---|---|---|---|
| {Section Name} | N | N | N |
| **Total** | **N** | **N** | **N** |

---

## Issues Found

{One entry per bug, using the Bug Reporting Standard from Section 8}

---

## What Passes (Confirmed Working)

| # | Test | Area |
|---|---|---|
| 1 | {Test name} | {Category} |

---

## Summary Table

| # | Issue | Priority | Category |
|---|---|---|---|
| 1 | {Issue name} | High | {Category} |

---

## Recommended Actions

### Immediate
{P0/P1 items}

### Short-term
{P2 items}

### Nice-to-have
{P3 items}
```

### Report Naming Convention

| Area | File Name |
|---|---|
| Homepage | `docs/homepage-qa-report.md` |
| Auth pages | `docs/auth-pages-qa-report.md` |
| Dashboard | `docs/dashboard-qa-report.md` |
| Sitemap editor | `docs/sitemap-qa-report.md` |
| Design editor | `docs/design-qa-report.md` |
| Manage mode | `docs/manage-qa-report.md` |
| Full release | `docs/release-{version}-qa-report.md` |

---

## 13. Sign-off & Release Gate

### Release Gate Criteria

A release is **blocked** if any of the following are true:

| Gate | Condition |
|---|---|
| 🔴 Critical bug open | Any Critical severity issue unfixed |
| 🔴 Security issue open | Any auth, data isolation, or input validation bug unfixed |
| 🔴 Core flow broken | Login, signup, or dashboard load fails |
| 🟠 P0/P1 unresolved | Any P0 or P1 bug not fixed or formally deferred by Product |
| 🟠 Tablet tests blocked | WebKit browser not installed (run `npx playwright install`) |
| 🟠 Test suite degraded | Failure count increased vs previous release without explanation |

### Sign-off Template

Add this to the bottom of the release QA report before pushing:

```markdown
## Sign-off

| Role | Name | Status | Date |
|---|---|---|---|
| QA Engineer | _____________ | ☐ Approved / ☐ Blocked | __________ |
| Engineering | _____________ | ☐ Approved / ☐ Blocked | __________ |
| Product | _____________ | ☐ Approved / ☐ Deferred issues noted | __________ |

**Release version:** _____________
**Deploy approved:** ☐ Yes  ☐ No
**Known deferred issues:** {list any P2/P3 intentionally deferred}
```

---

## Quick Reference Card

```
Before QA:         git pull → npm install → npx playwright install
Run automated:     npm test  (or npm run test:{area})
Check failures:    test-results/{name}/test-failed-1.png
Console filter:    paddle | analytics | gtag | facebook | hotjar
Selector rules:    footer → .last()  |  error → role="alert"
Routes:            /auth/login  /auth/signup  /auth/forgot-password
                   "Forgot Password?" → /auth/request-email
Report location:   docs/{area}-qa-report.md
Push:              git add docs/ && git commit && git push origin main
Block release if:  any Critical / any P0 / core flows broken
```

---

*This document is the single source of truth for QA at SproutOS.
If you find a gap, add it here — don't keep it in your head.*
