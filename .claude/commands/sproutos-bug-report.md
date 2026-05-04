# /sproutos-bug-report

Write a structured bug report for a Sprout OS QA finding to the correct MD file.

## Steps

1. Ask the user for the feature area being tested (e.g., `auth`, `sitemap`, `design-editor`)
2. Save the bug to: `reports/bugs/<feature-name>.md`
3. Write each bug using this exact format — one bug per entry, separated by `---`:

```
### [Bug Title — sentence case, no numbering]

**Severity:** P0 / P1 / P2 / P3
**Area:** UI / Functionality / Responsive / Logic / Security / Performance / Accessibility / Cross-Browser / Console / SEO / Code Quality

**Issue:** Concise and clear description of the problem

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:** What should happen

**Actual Result:** What actually happens

---
```

## Severity Guide

| Level | Meaning | Action |
|---|---|---|
| P0 — Critical | Blocks core workflow, data loss, security breach | Fix immediately, block release |
| P1 — High | Major feature broken, no workaround | Fix in this PR, block release |
| P2 — Medium | Feature degraded, workaround exists | Fix if under 30 min, otherwise defer |
| P3 — Low | Minor UI gap, cosmetic issue | Log in tech debt, defer |

## Bug Title Rules

- No numbering (not `#001 — Button missing`)
- Sentence case — only first letter capitalised
- Specific and meaningful (not `Bug in login`)
- Exceptions for proper terms: AI, API, URL, MCP, RBAC

## ClickUp (only if a card link is provided)

If the user provides a ClickUp card link:
- Create one subtask per bug
- Add details **in card activity only** using this format:

```
Issue: [description]

Step to Reproduce:
1.
2.
3.

Expected Result: [expected]
```

If no ClickUp link is provided — MD file only.
