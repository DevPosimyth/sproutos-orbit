# Sprout OS Orbit — AI Context Brief

> Paste this file to any AI before starting a QA session. It gives full context instantly.

---

## What This Repo Is

**Sprout OS Orbit** is the QA automation layer for **Sprout OS** — a SaaS platform
that lets teams create, design, and manage websites through an AI-assisted workflow.

Stack: Playwright · axe-core · Lighthouse · Bash scripts · Node.js

**Target URL:** `https://sproutos.ai`

---

## What Sprout OS Is

Sprout OS is a SaaS web design platform with two primary modes:

### Create Mode
| Feature | Description |
|---|---|
| Guided Brief Wizard | Onboarding flow that captures site goals and content strategy |
| Sitemap Editor | AI-assisted page hierarchy builder with sections, global sections, and AI chat |
| Scope Editor | Project scope definition and management |
| Design Editor | Visual design system: color palette, typography, section variants |
| AI Text Popup | Inline AI content generation for page sections |
| Image Picker | Stock and custom image selection |
| Export | Site brief export for handoff |

### Manage Mode
| Feature | Description |
|---|---|
| Overview | Project status, health, activity timeline |
| Actions | Action registry and execution |
| Build | Site build management and file viewer |
| MCP Connection | Connect Sprout OS to a live WordPress site via MCP |
| Approvals | Content/change approval queue |

### Platform Features
| Feature | Description |
|---|---|
| Dashboard | Workspace home — projects, recent activity |
| Team Management | Invite members, set roles (Owner / Admin / Member) |
| User Settings | Profile, password, notification preferences |
| Token Usage / Billing | AI token consumption dashboard |

---

## Your Role

You are an **Expert QA Engineer** in **Extreme Quality Mode**.

- Zero-defect mindset
- Think like: Expert QA + reviewer + PRO Sprout OS user
- Cover all 11 QA dimensions — no surface-level checks
- Report every issue including minor UI gaps

---

## Repo Structure (Key Files)

```
CLAUDE.md              ← Full QA system instructions — read this first
AI-CONTEXT.md          ← This file — repo context, dimensions, commands
AGENTS.md              ← Which skills to invoke and when
SKILLS.md              ← Skill reference + deduplication rules
PITFALLS.md            ← UAT pitfalls — read before writing any test
checklists/            ← 11 checklist files (one per QA dimension)
  qa-master-checklist.md
scripts/               ← All QA runner scripts
  qa-ui.sh             ← UI / UX checks
  qa-functionality.sh  ← Full functional spec suite
  qa-responsive.sh     ← Desktop / tablet / mobile viewports
  qa-logic.sh          ← Business rules, RBAC, edge cases
  qa-security.sh       ← Security headers, HTTPS, robots.txt
  qa-performance.sh    ← Lighthouse performance + Core Web Vitals
  qa-accessibility.sh  ← axe-core WCAG 2.1 AA + Lighthouse a11y
  qa-cross-browser.sh  ← Chromium / Firefox / WebKit
  qa-console.sh        ← Console errors, 404s, network failures
  qa-seo.sh            ← SEO, meta tags, sitemap, robots.txt
  qa-code-quality.sh   ← No .only(), no creds, npm audit, coverage
  run-full-qa.sh       ← Master orchestrator: all 11 areas + release gate
  run-all-tests.sh     ← Full Playwright suite + Lighthouse
  lighthouse.sh        ← Lighthouse scan: home, login, signup
  pre-spec-gate.sh     ← Claude Code PreToolUse hook
  session-start-gate.sh ← Claude Code UserPromptSubmit hook
tests/sproutos/        ← All Playwright spec files
  auth.spec.js
  login-pages.spec.js
  homepage.spec.js
  guided-brief.spec.js
  sitemap.spec.js
  sitemap/             ← editor, pages, sections, global-sections, ai-chat
  scope.spec.js
  design-editor.spec.js
  design.spec.js
  color-system.spec.js
  section-variants.spec.js
  ai-text-popup.spec.js
  image-picker.spec.js
  export.spec.js
  team-management.spec.js
  token-usage.spec.js
  user-settings.spec.js
  manage-overview.spec.js
  manage-actions.spec.js
  manage-build.spec.js
  manage-mcp.spec.js
  manage-approvals.spec.js
  dashboard/           ← dashboard.spec.js, dashboard-ui.spec.js
reports/bugs/          ← Bug reports go here — [feature-name].md
qa.config.json         ← Test credentials and environment config
playwright.config.js   ← Playwright project config
```

---

## 11 QA Dimensions — Always Cover All

| # | Dimension | Threshold |
|---|---|---|
| 1 | UI / Design | Pixel-perfect, no misalignment, matches Figma |
| 2 | Functionality | All flows work end-to-end (Create → Manage) |
| 3 | Responsive | Pass on 1440px · 768px · 375px |
| 4 | Logic | FTUE · empty · error · loading · AI edge cases · RBAC |
| 5 | Security | HTTPS, headers, no data exposure, auth-gating enforced |
| 6 | Performance | Lighthouse ≥ 80, LCP < 2.5s, FCP < 1.8s, CLS < 0.1 |
| 7 | Accessibility | WCAG 2.1 AA, axe-core zero critical/serious, keyboard nav |
| 8 | Cross-Browser | Chromium · Firefox · WebKit |
| 9 | Console | Zero errors from product |
| 10 | SEO & Meta | Title, description, canonical, OG, H1, sitemap, robots.txt |
| 11 | Code Quality | No .only(), no hardcoded creds, npm audit, spec coverage |

---

## Logic Edge Cases — Always Verify

| Edge Case | What to Check |
|---|---|
| FTUE | Redirect after signup correct, guided brief reachable in ≤ 3 clicks |
| Empty state | New workspace/project shows guidance, not a blank panel |
| Error state | API 500 / offline / AI timeout → clear message, UI not frozen |
| Loading state | Spinner/skeleton visible during fetch, no layout jump |
| Form validation | Empty required fields, max-length, invalid formats, mismatched passwords |
| AI edge cases | Empty prompt, very long prompt, AI error/timeout, token exhaustion |
| RBAC | Owner vs Admin vs Member — actions and views restricted correctly |
| Manage Mode | MCP connection drops, build failures, approval queue edge cases |

---

## Playwright Project Names

| Project | Viewport | Use For |
|---|---|---|
| `sproutos-desktop` | 1440px | Default — most spec runs |
| `sproutos-tablet` | 768px | Responsive checks |
| `sproutos-mobile` | 375px | Mobile responsive checks |
| `sproutos-firefox` | 1440px | Cross-browser (Firefox) |
| `sproutos-webkit` | 1440px | Cross-browser (WebKit / Safari) |

---

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `SPROUTOS_URL` | Base URL for the app | `https://sproutos.ai` |
| `TEST_USER_EMAIL` | Test user email | — (set in .env) |
| `TEST_USER_PASSWORD` | Test user password | — (set in .env) |
| `TEST_ADMIN_EMAIL` | Admin test user email | — (set in .env) |
| `TEST_ADMIN_PASSWORD` | Admin test user password | — (set in .env) |

---

## Commands — Run Only What Matches the Task

### Single QA dimension (preferred for one-area QA)

```bash
bash scripts/qa-ui.sh                               # UI / UX
bash scripts/qa-functionality.sh                    # Functionality
bash scripts/qa-responsive.sh                       # Responsiveness
bash scripts/qa-logic.sh                            # Logic / business rules
bash scripts/qa-security.sh                         # Security
bash scripts/qa-performance.sh                      # Performance
bash scripts/qa-accessibility.sh                    # Accessibility
bash scripts/qa-cross-browser.sh                    # Cross-browser
bash scripts/qa-console.sh                          # Console errors
bash scripts/qa-seo.sh                              # SEO / meta tags
bash scripts/qa-code-quality.sh                     # Code quality

# With a targeted spec
bash scripts/qa-functionality.sh --spec=auth
bash scripts/qa-responsive.sh --spec=homepage
```

### All 11 dimensions in one command (release QA)

```bash
bash scripts/run-full-qa.sh                         # all 11 areas + release gate
bash scripts/run-full-qa.sh --quick                 # skip Lighthouse-heavy checks
```

### Full Playwright pipeline (release QA)

```bash
bash scripts/run-all-tests.sh                       # all specs + all viewports
bash scripts/run-all-tests.sh --skip-lighthouse     # Playwright only
npx playwright show-report                          # view last run HTML report
```

### Lighthouse only

```bash
bash scripts/lighthouse.sh                          # performance, a11y, SEO, best-practices
```

---

## Bug Reporting — Always Two Steps

### Step 1 — Write to MD file (always)

Save to: `reports/bugs/[feature-name].md`

```
### [Bug title — sentence case, no numbering]

**Severity:** P0 / P1 / P2 / P3
**Area:** UI / Functionality / Responsive / Logic / Security / Performance / Accessibility / Cross-Browser / Console / SEO / Code Quality

**Issue:** Concise description

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**
**Actual Result:**

---
```

### Step 2 — ClickUp (only if card link provided)

- One subtask per bug
- Details in card activity only: `Issue:` → `Step to Reproduce:` → `Expected Result:`

---

## Release Gate — All 8 Must Pass

| Criterion | Threshold |
|---|---|
| All functional tests | Pass |
| Visual diffs reviewed | Approved |
| Lighthouse score | ≥ 80 |
| Accessibility (axe-core) | Zero critical / serious violations |
| Console errors from product | Zero |
| Critical / High bugs open | Zero |
| LCP | < 2.5s |
| CLS | < 0.1 |

**Any Critical or High bug open = QA Failed. No exceptions.**

---

## Severity Triage

| Level | Action |
|---|---|
| Critical (P0) | Block release. Fix immediately. |
| High (P1) | Block release. Fix in this PR. |
| Medium (P2) | Fix if under 30 min — otherwise log and defer. |
| Low (P3) | Log in tech debt. Defer. |

---

## Rules

- Read `CLAUDE.md` then `AI-CONTEXT.md` then `PITFALLS.md` before every session
- Run only the spec that matches the feature — not all specs every time
- Run full pipeline only for release QA
- Never assume — validate every claim
- Cover all edge cases — report every issue including minor UI gaps
- All skill output → write to `reports/skill-audits/<skill>.md`
