# /sproutos-full-qa

Run the full Sprout OS QA pipeline across all 11 dimensions and deliver a release gate verdict.

## Steps

1. Read `CLAUDE.md` in full
2. Read `AI-CONTEXT.md` in full
3. Read `PITFALLS.md` in full
4. Read `checklists/qa-master-checklist.md` in full
5. Run the full QA orchestrator:
   ```bash
   bash scripts/run-full-qa.sh
   ```
6. Read the generated release gate report from `reports/full-qa/`
7. Deliver a final verdict:
   - ✅ **RELEASE APPROVED** — all 11 areas passed, all 8 gate criteria met
   - ❌ **RELEASE BLOCKED** — list every failed area with reason

## Release Gate Criteria (all 8 must pass)

| Criterion | Threshold |
|---|---|
| All functional Playwright tests | Pass |
| Visual diffs reviewed | Approved |
| Lighthouse score | ≥ 80 |
| axe-core violations (critical/serious) | Zero |
| Console errors from product | Zero |
| Critical / High bugs open | Zero |
| LCP | < 2.5s |
| CLS | < 0.1 |

## Output

- Verdict: QA Passed or QA Failed
- Summary of each area: Pass / Fail / Skip
- List of open Critical and High bugs (if any)
- Link to full report: `reports/full-qa/qa-release-gate-<timestamp>.md`
