# Sprout OS Orbit — Skill Reference

> **Hard rule**: Orbit never runs surface-level analysis. Every audit, test, or
> review MUST invoke the skills defined here. See `AGENTS.md` for the
> enforcement rules Claude follows automatically.

---

## Sproutos Custom Skills (sproutos-*)

Five custom Claude Code skills for Sprout OS Orbit.

| Skill | Invoke | What It Does |
|---|---|---|
| `sproutos-full-qa` | `/sproutos-full-qa` | Runs `run-full-qa.sh` — all 11 QA dimensions + 8-criteria release gate |
| `sproutos-bug-report` | `/sproutos-bug-report` | Writes bugs in correct MD format with severity / area / steps / ClickUp rules |
| `sproutos-pre-test` | `/sproutos-pre-test` | Enforces reading `AI-CONTEXT.md` → `PITFALLS.md` → checklist before writing any test |
| `sproutos-release-gate` | `/sproutos-release-gate` | Validates all 8 release gate criteria and delivers final QA verdict |
| `sproutos-qa-area` | `/sproutos-qa-area` | Runs a targeted QA area script with optional `--spec=<name>` flag |

---

## The Six Core External Skills (Always Run)

These are mandatory for every Orbit full audit. Run in parallel.

| # | Skill | When | What it covers |
|---|---|---|---|
| 1 | `/e2e-testing-patterns` | Every audit | E2E test coverage — assertions, page objects, helper patterns, edge case coverage, no .only() |
| 2 | `/security-auditor` | Every audit | Application security — auth flows, headers, HTTPS, token handling, session management, CSRF |
| 3 | `/api-security-testing` | Every audit | API endpoint security — auth, rate limiting, CORS, input validation, AI API security |
| 4 | `/accessibility-compliance-accessibility-audit` | Every audit | WCAG 2.1 AA — keyboard nav, ARIA, color contrast, focus management, semantic HTML, alt text |
| 5 | `/web-performance-optimization` | Every audit | Core Web Vitals (LCP, FCP, CLS, TBT), bundle size, API latency, caching, Lighthouse ≥ 80 |
| 6 | `/vibe-code-auditor` | Every audit | Code quality — dead code, complexity, no .only(), no hardcoded credentials, AI-gen code risks |

---

## Add-on Skills (by Feature Area)

Run these on top of the core 6 based on what is being audited.

| Feature Area | Skill | What it adds |
|---|---|---|
| Design Editor / UI-heavy features | `/antigravity-design-expert` | 44px hit areas, spacing consistency, motion quality, visual polish, concentric radius |
| Auth flows (login, signup, forgot) | `/security-auditor` (focused run) | Session tokens, CSRF, brute-force protection, password requirements |
| MCP Connection / API features | `/api-security-testing` (focused run) | MCP auth, token validation, endpoint exposure, rate limiting |
| AI Text Popup / Sitemap AI Chat | `/api-security-testing` (focused run) | Prompt handling, AI API auth, token exhaustion, error states |
| Accessibility deep dive | `/accessibility-compliance-accessibility-audit` + `/fixing-accessibility` | Full WCAG audit + remediation suggestions |

---

## Output Rules

All skill output — whether from Playwright, scripts, or a direct skill call —
must be written to a file. Never output only to terminal.

| Skill type | Output format | Location |
|---|---|---|
| External skill audits | Markdown with severity table | `reports/skill-audits/<skill-name>.md` |
| Playwright test run (HTML) | Auto-generated HTML report | `reports/playwright-html/index.html` |
| Playwright test run (terminal) | Line reporter summary | stdout |
| Full QA run | Markdown release gate report | `reports/full-qa/qa-release-gate-<timestamp>.md` |
| Lighthouse scans | JSON + HTML | `reports/lighthouse/` |
| Accessibility audit | Markdown with violation list | `reports/accessibility/a11y-audit-<timestamp>.md` |
| SEO audit | Markdown with check results | `reports/seo/seo-audit-<timestamp>.md` |
| Bug reports | Markdown per feature | `reports/bugs/[feature-name].md` |

View reports after any run:

```bash
# Playwright HTML report
npx playwright show-report

# Full QA release gate
ls reports/full-qa/

# Skill audit markdown reports
ls reports/skill-audits/

# Bug reports
ls reports/bugs/

# Accessibility reports
ls reports/accessibility/
```

---

## Running Skills

### Full orchestrator (recommended)

```bash
bash scripts/run-full-qa.sh
```

Runs all 11 QA areas via individual scripts + generates release gate markdown.
Output goes to `reports/full-qa/` automatically.

### Single QA area script

```bash
bash scripts/qa-security.sh
bash scripts/qa-accessibility.sh --spec=homepage
bash scripts/qa-functionality.sh --spec=auth
```

### All 6 external skills in parallel (manual)

```bash
claude "/e2e-testing-patterns Review tests/sproutos/ — coverage, assertions, edge cases. Output markdown." > reports/skill-audits/e2e-patterns.md &
claude "/security-auditor Audit sproutos.ai — auth, headers, HTTPS, tokens. Output markdown." > reports/skill-audits/security.md &
claude "/api-security-testing Audit sproutos.ai API — auth, rate limiting, CORS. Output markdown." > reports/skill-audits/api-security.md &
claude "/accessibility-compliance-accessibility-audit Audit sproutos.ai — WCAG 2.1 AA. Output markdown." > reports/skill-audits/a11y.md &
claude "/web-performance-optimization Analyze sproutos.ai — Core Web Vitals, bundle. Output markdown." > reports/skill-audits/performance.md &
claude "/vibe-code-auditor Review tests/sproutos/ — quality, no .only(), no creds. Output markdown." > reports/skill-audits/code-quality.md &
wait
echo "All skill audits complete. Reports in reports/skill-audits/"
```

### Single skill (targeted)

```bash
claude "/security-auditor Audit sproutos.ai/login — session tokens, CSRF, brute-force. Rate every finding Critical/High/Medium/Low. Output full markdown report."
```

---

## QA Script → Dimension Mapping

| # | QA Area | Script | Plays Well With |
|---|---|---|---|
| 1 | UI / UX | `bash scripts/qa-ui.sh` | `/antigravity-design-expert` |
| 2 | Functionality | `bash scripts/qa-functionality.sh` | `/e2e-testing-patterns` |
| 3 | Responsiveness | `bash scripts/qa-responsive.sh` | `/antigravity-design-expert` |
| 4 | Logic | `bash scripts/qa-logic.sh` | `/e2e-testing-patterns` |
| 5 | Security | `bash scripts/qa-security.sh` | `/security-auditor` · `/api-security-testing` |
| 6 | Performance | `bash scripts/qa-performance.sh` | `/web-performance-optimization` |
| 7 | Accessibility | `bash scripts/qa-accessibility.sh` | `/accessibility-compliance-accessibility-audit` |
| 8 | Cross-Browser | `bash scripts/qa-cross-browser.sh` | `/e2e-testing-patterns` |
| 9 | Console Errors | `bash scripts/qa-console.sh` | `/vibe-code-auditor` |
| 10 | SEO / Meta Tags | `bash scripts/qa-seo.sh` | `/web-performance-optimization` |
| 11 | Code Quality | `bash scripts/qa-code-quality.sh` | `/vibe-code-auditor` |

---

## Deduplication: Which Skill Wins

Multiple similar skills exist in the Claude ecosystem. Use only these for Sprout OS:

| Task | Use | Skip |
|---|---|---|
| E2E test review | `/e2e-testing-patterns` | ~~`/e2e-testing`~~ (too generic), ~~`/playwright-java`~~ |
| Application security | `/security-auditor` | ~~`/security-scanning-security-sast`~~ (PHP/SAST, wrong domain) |
| API security | `/api-security-testing` | ~~`/security-auditor`~~ alone (misses API patterns) |
| Performance | `/web-performance-optimization` | ~~`/performance-engineer`~~ (cloud infra, wrong domain) |
| Accessibility | `/accessibility-compliance-accessibility-audit` | ~~`/accessibility`~~ (too generic), ~~`/wcag-audit-patterns`~~ |
| Code quality | `/vibe-code-auditor` | ~~`/code-review-excellence`~~ (no spec-file context) |
| UI visual polish | `/antigravity-design-expert` | ~~`/ui-review`~~ (too generic) |

---

## Severity Triage

Apply this to all skill output before releasing:

| Level | Action before release |
|---|---|
| **Critical (P0)** | Block release. Fix immediately. |
| **High (P1)** | Block release. Fix in this PR. |
| **Medium (P2)** | Fix if under 30 min. Otherwise log and defer. |
| **Low / Info (P3)** | Log in tech debt. Defer. |

---

## Release Gate Reminder

All skill runs feed into the release gate. Gate passes only when:

| Criterion | Threshold |
|---|---|
| All functional Playwright tests | Pass |
| Visual diffs | Reviewed and approved |
| Lighthouse score | ≥ 80 |
| axe-core violations (critical/serious) | Zero |
| Console errors from product | Zero |
| Critical / High bugs open | Zero |
| LCP | < 2.5s |
| CLS | < 0.1 |

Run the full gate:

```bash
bash scripts/run-full-qa.sh
```
