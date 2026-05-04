# /sproutos-release-gate

Validate all 8 release gate criteria for Sprout OS and deliver a final QA verdict.

## Steps

1. Read `CLAUDE.md` release gate section
2. Read the latest report from `reports/full-qa/` (most recent timestamp)
3. Read `reports/bugs/` — check for any open Critical or High bugs
4. Evaluate all 8 criteria:

## Gate Criteria

| # | Criterion | Threshold | Status |
|---|---|---|---|
| 1 | All functional Playwright tests | Pass | — |
| 2 | Visual diffs reviewed | Approved | — |
| 3 | Lighthouse score | ≥ 80 | — |
| 4 | axe-core violations (critical/serious) | Zero | — |
| 5 | Console errors from product | Zero | — |
| 6 | Critical / High bugs open | Zero | — |
| 7 | LCP | < 2.5s | — |
| 8 | CLS | < 0.1 | — |

## Verdict Rules

- **All 8 pass** → ✅ RELEASE APPROVED
- **Any 1 fails** → ❌ RELEASE BLOCKED
- **Any Critical or High bug open** → ❌ RELEASE BLOCKED (regardless of other results)

## Output Format

```
## Sprout OS — Release Gate Verdict

**Date:** [today]
**Run:** [timestamp]

| # | Criterion | Threshold | Result |
|---|---|---|---|
| 1 | Functional tests | Pass | ✅ / ❌ |
| 2 | Visual diffs | Approved | ✅ / ❌ |
| 3 | Lighthouse | ≥ 80 | ✅ [score] / ❌ [score] |
| 4 | axe-core violations | Zero | ✅ / ❌ [count] |
| 5 | Console errors | Zero | ✅ / ❌ [count] |
| 6 | Open Critical/High bugs | Zero | ✅ / ❌ [count] |
| 7 | LCP | < 2.5s | ✅ [value] / ❌ [value] |
| 8 | CLS | < 0.1 | ✅ [value] / ❌ [value] |

### Verdict: ✅ RELEASE APPROVED / ❌ RELEASE BLOCKED

[If blocked — list exact reasons and what must be fixed before re-gate]
```
