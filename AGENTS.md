# Sprout OS Orbit — Agent Instructions

> This file is read automatically by Claude Code. It defines which skills to
> always invoke, in what order, and under what conditions for every Orbit QA run.
> Never skip these. Surface-level or skill-free audits are not useful.

---

## Hard Rule: Always Use These Skills

When asked to run any audit, review, test, or analysis on Sprout OS via Orbit —
**always invoke the skills below**. Do not skip them, do not summarize without
running them, do not give surface-level output without them.

---

## The Five Core Sproutos Skills

These five are mandatory for every full audit. Run them in parallel.

| # | Skill | What it checks |
|---|---|---|
| 1 | `/sproutos-full-qa` | Runs all 11 QA dimensions via `run-full-qa.sh` + release gate verdict |
| 2 | `/sproutos-pre-test` | Enforces reading AI-CONTEXT.md → PITFALLS.md → checklist before writing any spec |
| 3 | `/sproutos-bug-report` | Writes bugs to `reports/bugs/[feature].md` in correct format with severity + steps |
| 4 | `/sproutos-release-gate` | Validates all 8 release gate criteria — delivers final QA verdict |
| 5 | `/sproutos-qa-area` | Runs a targeted QA area script (e.g., `--area=security`, `--spec=auth`) |

---

## The Six Core External Skills

These external skills are mandatory for every full audit. Run in parallel.

| # | Skill | What it checks |
|---|---|---|
| 1 | `/e2e-testing-patterns` | E2E test coverage — assertions, helper patterns, edge case coverage, page objects |
| 2 | `/security-auditor` | Application security — headers, auth flows, token handling, input validation |
| 3 | `/api-security-testing` | API endpoint security — auth, rate limiting, CORS, input validation, error handling |
| 4 | `/accessibility-compliance-accessibility-audit` | WCAG 2.1 AA — keyboard nav, ARIA, color contrast, focus management, semantic HTML |
| 5 | `/web-performance-optimization` | Core Web Vitals — LCP, FCP, CLS, TBT, bundle size, API latency, caching |
| 6 | `/vibe-code-auditor` | Code quality — dead code, complexity, no .only(), no hardcoded credentials |

### How to Invoke

```bash
# Full audit — all 6 external skills in parallel
claude "/e2e-testing-patterns Review tests/sproutos/ — coverage, assertions, edge cases, helper patterns. Output full markdown report."
claude "/security-auditor Audit sproutos.ai — headers, auth, HTTPS, token handling, input validation. Output full markdown report."
claude "/api-security-testing Audit sproutos.ai API endpoints — auth, rate limiting, CORS, error handling. Output full markdown report."
claude "/accessibility-compliance-accessibility-audit Audit sproutos.ai — WCAG 2.1 AA, keyboard nav, ARIA, contrast. Output full markdown report."
claude "/web-performance-optimization Analyze sproutos.ai — Core Web Vitals, bundle size, API latency, caching headers. Output full markdown report."
claude "/vibe-code-auditor Review tests/sproutos/ — code quality, no .only(), no hardcoded creds, complexity. Output full markdown report."
```

Or run all QA areas via orchestrator:

```bash
bash scripts/run-full-qa.sh
```

---

## Skill Selection by Feature Area

Add these on top of the core skills based on what area is being audited:

| Feature Area | Extra Skills to Add |
|---|---|
| Create Mode — Design Editor | `/antigravity-design-expert` — spacing, 44px hit areas, visual polish, color contrast |
| Manage Mode — MCP Connection | `/api-security-testing` — MCP auth, token validation, endpoint security |
| AI Features (text popup, sitemap chat) | `/api-security-testing` — AI API auth, prompt injection, token exhaustion |
| Auth flows (login, signup, forgot) | `/security-auditor` — session management, CSRF, brute-force, token leaks |
| SEO / public pages | `/web-performance-optimization` — Core Web Vitals, SEO-affecting performance |
| Accessibility deep dive | `/accessibility-compliance-accessibility-audit` + `/fixing-accessibility` |

---

## Skill Deduplication Reference

When multiple skills overlap, use these and only these:

| Task | Use This | NOT These |
|---|---|---|
| E2E test coverage review | `/e2e-testing-patterns` | ~~`/playwright-java`~~, ~~`/e2e-testing`~~ (too generic) |
| Application security | `/security-auditor` | ~~`/security-scanning-security-sast`~~ (PHP/SAST focused, not SaaS) |
| API security | `/api-security-testing` | ~~`/security-auditor`~~ alone (misses API-specific patterns) |
| Performance | `/web-performance-optimization` | ~~`/performance-engineer`~~ (cloud infra skill, wrong domain) |
| Accessibility | `/accessibility-compliance-accessibility-audit` | ~~`/accessibility`~~ (too generic), ~~`/accessibility-review`~~ |
| Code quality | `/vibe-code-auditor` | ~~`/code-review-excellence`~~ (no context for spec-file anti-patterns) |
| UI / visual polish | `/antigravity-design-expert` | ~~`/ui-review`~~ (too generic) |

---

## What Never Goes in This Repo

- Real credentials or tokens (use `.env` — excluded via `.gitignore`)
- `reports/`, `.auth/`, `test-results/` directories (gitignored)
- Any file referencing internal staging URLs or internal API keys
- Plugin-specific or WordPress-specific configs (Sprout OS is SaaS only)

---

## Output Rules for All Skill Runs

All skill output must be written to a file. Never output only to terminal.

| Output Type | Format | Location |
|---|---|---|
| External skill audits | Markdown with severity table | `reports/skill-audits/<skill>.md` |
| Playwright test run | HTML report (auto-generated) | `reports/playwright-html/index.html` |
| Playwright test run | Terminal summary | stdout (line reporter) |
| Full QA run | Markdown release gate report | `reports/full-qa/qa-release-gate-<timestamp>.md` |
| Lighthouse | JSON + HTML | `reports/lighthouse/` |
| Bug reports | Markdown | `reports/bugs/[feature-name].md` |

View reports after any run:

```bash
# HTML test report
npx playwright show-report

# Full QA release gate report
ls reports/full-qa/

# Skill audit markdown reports
ls reports/skill-audits/

# Bug reports
ls reports/bugs/
```

---

## QA Session Workflow

Follow this order for every full QA session:

```
1. Read CLAUDE.md              ← QA system rules
2. Read AI-CONTEXT.md          ← Sprout OS context + 11 dimensions
3. Read PITFALLS.md            ← What to avoid
4. Read the relevant checklist ← checklists/<area>-checklist.md
5. Run pre-spec gate           ← bash scripts/pre-spec-gate.sh
6. Run targeted QA area(s)     ← bash scripts/qa-<area>.sh
7. Write bugs to MD            ← reports/bugs/[feature].md
8. Re-test fixed bugs          ← Original steps + regression check
9. Run release gate            ← bash scripts/run-full-qa.sh
10. Deliver verdict            ← QA Passed or QA Failed
```

---

## Severity Triage (Apply to All Skill Output)

| Level | Action |
|---|---|
| Critical (P0) | Block release. Fix immediately. |
| High (P1) | Block release. Fix in this PR. |
| Medium (P2) | Fix in this release if < 30 min. Otherwise log and defer. |
| Low / Info (P3) | Log in tech debt. Defer. |
