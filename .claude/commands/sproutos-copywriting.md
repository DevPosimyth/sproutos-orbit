# /sproutos-copywriting

Run a full copywriting and i18n audit of the SproutOS WordPress MCP plugin.

## What this audits

- **A — Copywriting & i18n** — PHP `__()` wrappers, inline JS strings, hardcoded HTML labels, em dash vs hyphen, jargon, duplicate messages, HTML tag mismatches
- **B — WP Coding Standards** — AJAX nonces, capability checks, sanitization, ABSPATH guards, text domain
- **C — Security** — Safety setting handler, sandbox default, path traversal, webhook payload, Safe Mode nonce
- **D — Abilities catalogue** — Label format `[Category] Action`, category descriptions, plugin-gated abilities
- **E — Admin UI consistency** — State labels (enabled/disabled), back-navigation icons, Capabilities Profile descriptions, form placeholders
- **F — readme.txt compliance** — Required fields, short description ≤ 150 chars, External Services section, FAQ quality, changelog format

## Steps

1. Ask the user for the plugin path if not provided (e.g. `~/plugins/sprout-os`)
2. Read the full `skills/sproutos-copywriting/SKILL.md` in this repo for the complete audit rules
3. Read these files from the plugin, in order:
   - `sprout-os.php`
   - `readme.txt`
   - `sprout-core/admin-pages.php`
   - `sprout-core/admin-safety-tab.php`
   - `sprout-core/memory/admin/memory-page.php`
   - `sprout-core/abilities_register/class-abilities-register.php`
4. Run all six audit dimensions (A through F) — flag every issue, nothing is too small
5. Write the full report to `reports/bugs/sproutos-<version>.md`
6. Summarise: total issues by severity (P1 / P2 / P3) and verdict — ready for WP.org or blocked

## Output

Report saved to: `reports/bugs/sproutos-<version>.md`

**Severity scale:**
- **P1** — Broken rendering or security issue. Must fix before release.
- **P2** — Translation failure, jargon, WP standards violation. Fix before WP.org submission.
- **P3** — Polish, inconsistency, minor formatting. Fix before major release.

## Quick run

```bash
claude "/sproutos-copywriting Audit /path/to/sprout-os — full copywriting audit. Output markdown report."
```
