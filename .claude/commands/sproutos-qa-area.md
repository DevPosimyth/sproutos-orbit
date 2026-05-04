# /sproutos-qa-area

Run a targeted QA check for a specific Sprout OS area or feature.

## Usage

```
/sproutos-qa-area <area> [--spec=<name>]
```

**Examples:**
```
/sproutos-qa-area security
/sproutos-qa-area functionality --spec=auth
/sproutos-qa-area responsive --spec=homepage
/sproutos-qa-area accessibility
```

## Steps

1. Read `AI-CONTEXT.md` — focus on the dimension being tested
2. Read the matching checklist for the area:

   | Area | Checklist | Script |
   |---|---|---|
   | `ui` | `checklists/ui-ux-checklist.md` | `bash scripts/qa-ui.sh` |
   | `functionality` | `checklists/functionality-checklist.md` | `bash scripts/qa-functionality.sh` |
   | `responsive` | `checklists/responsiveness-checklist.md` | `bash scripts/qa-responsive.sh` |
   | `logic` | `checklists/logic-checklist.md` | `bash scripts/qa-logic.sh` |
   | `security` | `checklists/security-checklist.md` | `bash scripts/qa-security.sh` |
   | `performance` | `checklists/performance-checklist.md` | `bash scripts/qa-performance.sh` |
   | `accessibility` | `checklists/accessibility-checklist.md` | `bash scripts/qa-accessibility.sh` |
   | `cross-browser` | `checklists/cross-browser-checklist.md` | `bash scripts/qa-cross-browser.sh` |
   | `console` | `checklists/console-errors-checklist.md` | `bash scripts/qa-console.sh` |
   | `seo` | `checklists/seo-meta-checklist.md` | `bash scripts/qa-seo.sh` |
   | `code-quality` | `checklists/code-quality-checklist.md` | `bash scripts/qa-code-quality.sh` |

3. Run the matching script — with `--spec=<name>` if provided:
   ```bash
   bash scripts/qa-<area>.sh [--spec=<name>]
   ```
4. Report results:
   - ✅ PASSED or ❌ FAILED
   - List any failures with file + line reference
   - Write bugs to `reports/bugs/<feature>.md` using the bug format from `CLAUDE.md`

## Rules

- Never run all specs for every task — match spec to feature
- Always read the checklist for the area before reporting
- If `--spec` is not provided, run the full area script
