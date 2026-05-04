# QA Master Checklist
> Central index for all QA checklists. Run every item before tagging a release.
> All sections must show **Pass** before a release is approved.
> Hotfix minimum: Functionality, Security, Console Errors, and Code Quality.

---

## Checklist Index

| # | Area | File | Items |
|---|---|---|---|
| 1 | UI / UX | [ui-ux-checklist.md](ui-ux-checklist.md) | Layout, spacing, animation, forms, depth |
| 2 | Functionality | [functionality-checklist.md](functionality-checklist.md) | Buttons, forms, CRUD, auth, integrations |
| 3 | Responsiveness | [responsiveness-checklist.md](responsiveness-checklist.md) | All breakpoints 320px → 1920px, touch |
| 4 | Logic | [logic-checklist.md](logic-checklist.md) | Business rules, edge cases, state, RBAC |
| 5 | Security | [security-checklist.md](security-checklist.md) | Auth, input handling, data exposure, HTTPS |
| 6 | Performance | [performance-checklist.md](performance-checklist.md) | Core Web Vitals, assets, DB, PHP |
| 7 | Accessibility | [accessibility-checklist.md](accessibility-checklist.md) | WCAG 2.1 AA, keyboard, ARIA, contrast |
| 8 | Cross-Browser | [cross-browser-checklist.md](cross-browser-checklist.md) | Chrome, Firefox, Safari, Edge, mobile |
| 9 | Console Errors | [console-errors-checklist.md](console-errors-checklist.md) | JS errors, 404s, PHP notices, CSP |
| 10 | SEO / Meta Tags | [seo-checklist.md](seo-checklist.md) | OG tags, schema, sitemap, canonicals |
| 11 | Code Quality | [code-quality-checklist.md](code-quality-checklist.md) | Linting, versioning, tests, build |

---

## Release Sign-Off

| # | Area | Reviewer | Date | Status |
|---|---|---|---|---|
| 1 | UI / UX | | | ☐ Pass / ☐ Fail |
| 2 | Functionality | | | ☐ Pass / ☐ Fail |
| 3 | Responsiveness | | | ☐ Pass / ☐ Fail |
| 4 | Logic | | | ☐ Pass / ☐ Fail |
| 5 | Security | | | ☐ Pass / ☐ Fail |
| 6 | Performance | | | ☐ Pass / ☐ Fail |
| 7 | Accessibility | | | ☐ Pass / ☐ Fail |
| 8 | Cross-Browser | | | ☐ Pass / ☐ Fail |
| 9 | Console Errors | | | ☐ Pass / ☐ Fail |
| 10 | SEO / Meta Tags | | | ☐ Pass / ☐ Fail |
| 11 | Code Quality | | | ☐ Pass / ☐ Fail |

**Overall**: ☐ Approved for Release &nbsp;&nbsp; ☐ Blocked — Issues Found

---

## Quick Commands

```bash
# Run automated linting and tests
bash scripts/gauntlet.sh --plugin /path/to/plugin
npx playwright test

# Run Lighthouse performance audit
lighthouse http://localhost:8881 \
  --output=html \
  --output-path=reports/lighthouse/report.html \
  --chrome-flags="--headless"

# PHP debug mode (wp-config.php)
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```
