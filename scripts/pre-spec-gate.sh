#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Pre-Spec Gate (Claude Code PreToolUse Hook)
# Fires before Claude writes or edits a Playwright spec file.
# Reminds Claude of QA checklist obligations before modifying tests.
#
# Hook type : PreToolUse
# Tools     : Write, Edit, MultiEdit
# Register  : Add to .claude/settings.json → hooks.PreToolUse
#
# Usage (from .claude/settings.json):
#   {
#     "hooks": {
#       "PreToolUse": [
#         {
#           "matcher": "Write|Edit|MultiEdit",
#           "hooks": [{ "type": "command", "command": "bash scripts/pre-spec-gate.sh" }]
#         }
#       ]
#     }
#   }
# =============================================================================

FILE_PATH="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"

# Only gate on spec files
if [[ "$FILE_PATH" != *".spec."* ]] && [[ "$FILE_PATH" != *"tests/"* ]]; then
  exit 0
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  🌱 Sprout OS Orbit — Pre-Spec QA Gate               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo " Tool      : $TOOL_NAME"
echo " Spec file : $FILE_PATH"
echo ""
echo " Before writing or editing this spec, confirm:"
echo ""
echo " ☐ 1. UI / UX        — Layout, labels, spacing are verified"
echo " ☐ 2. Functionality  — Core feature behavior is tested"
echo " ☐ 3. Responsive     — Mobile / tablet / desktop viewports considered"
echo " ☐ 4. Logic          — Auth-gating, RBAC, edge cases covered"
echo " ☐ 5. Security       — No hardcoded credentials; auth checks in place"
echo " ☐ 6. Performance    — No unnecessary waits; network timing checked"
echo " ☐ 7. Accessibility  — WCAG 2.1 AA: alt text, ARIA, labels, focus"
echo " ☐ 8. Cross-Browser  — Test runs on Chromium, Firefox, WebKit"
echo " ☐ 9. Console Errors — page.on('console') / page.on('pageerror') wired"
echo " ☐ 10. SEO           — Title, meta, OG tags verified where applicable"
echo " ☐ 11. Code Quality  — No .only(), no console.log(), no hardcoded PW"
echo ""
echo " Checklist : checklists/qa-master-checklist.md"
echo " Run all   : bash scripts/run-full-qa.sh"
echo " Run area  : bash scripts/qa-<area>.sh"
echo ""

# Allow write to proceed (exit 0 = non-blocking reminder)
exit 0
