# /sproutos-pre-test

Enforce the mandatory pre-test gate before writing any Playwright spec file for Sprout OS.

## Steps

1. Run the gate script:
   ```bash
   bash scripts/pre-spec-gate.sh
   ```
2. Read `AI-CONTEXT.md` in full — 11 QA dimensions, thresholds, edge cases
3. Read `PITFALLS.md` in full — what to avoid when writing tests
4. Ask the user which QA area the spec covers, then read the matching checklist:

   | Area | Checklist |
   |---|---|
   | UI / Design | `checklists/ui-ux-checklist.md` |
   | Functionality | `checklists/functionality-checklist.md` |
   | Responsive | `checklists/responsiveness-checklist.md` |
   | Logic | `checklists/logic-checklist.md` |
   | Security | `checklists/security-checklist.md` |
   | Performance | `checklists/performance-checklist.md` |
   | Accessibility | `checklists/accessibility-checklist.md` |
   | Cross-Browser | `checklists/cross-browser-checklist.md` |
   | Console Errors | `checklists/console-errors-checklist.md` |
   | SEO / Meta | `checklists/seo-meta-checklist.md` |
   | Code Quality | `checklists/code-quality-checklist.md` |

5. Confirm all 5 conditions before writing a single line of test code:
   - [ ] `AI-CONTEXT.md` read in full
   - [ ] `PITFALLS.md` read in full
   - [ ] Relevant checklist(s) read in full
   - [ ] Every automatable item → `test()` assertion planned
   - [ ] Non-automatable items → `// MANUAL CHECK:` comment in spec header

## Rules

- Never skip this gate
- Never write a spec before completing all 5 steps
- If the gate is not complete — stop and complete it first
