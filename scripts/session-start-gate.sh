#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Session Start Gate (Claude Code UserPromptSubmit Hook)
# Fires at the start of a Claude Code session when QA-related prompts are detected.
# Reminds Claude of QA standards and available scripts before beginning work.
#
# Hook type : UserPromptSubmit
# Register  : Add to .claude/settings.json → hooks.UserPromptSubmit
#
# Usage (from .claude/settings.json):
#   {
#     "hooks": {
#       "UserPromptSubmit": [
#         {
#           "hooks": [{ "type": "command", "command": "bash scripts/session-start-gate.sh" }]
#         }
#       ]
#     }
#   }
# =============================================================================

PROMPT="${CLAUDE_USER_PROMPT:-}"

# Only fire for QA / test-related prompts
if ! echo "$PROMPT" | grep -qiE \
  "qa|test|spec|playwright|checklist|bug|fix|responsive|a11y|accessibility|seo|lighthouse|console error|cross.browser|security|performance|release"; then
  exit 0
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  🌱 Sprout OS Orbit — QA Session Gate                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo " Detected a QA-related session. Before starting, remember:"
echo ""
echo " 11 QA AREAS TO COVER:"
echo "  1.  UI / UX          — bash scripts/qa-ui.sh"
echo "  2.  Functionality    — bash scripts/qa-functionality.sh"
echo "  3.  Responsiveness   — bash scripts/qa-responsive.sh"
echo "  4.  Logic            — bash scripts/qa-logic.sh"
echo "  5.  Security         — bash scripts/qa-security.sh"
echo "  6.  Performance      — bash scripts/qa-performance.sh"
echo "  7.  Accessibility    — bash scripts/qa-accessibility.sh"
echo "  8.  Cross-Browser    — bash scripts/qa-cross-browser.sh"
echo "  9.  Console Errors   — bash scripts/qa-console.sh"
echo "  10. SEO / Meta Tags  — bash scripts/qa-seo.sh"
echo "  11. Code Quality     — bash scripts/qa-code-quality.sh"
echo ""
echo " QUICK COMMANDS:"
echo "  Full QA run   : bash scripts/run-full-qa.sh"
echo "  All tests     : bash scripts/run-all-tests.sh"
echo "  Single area   : bash scripts/qa-<area>.sh [--spec=<name>]"
echo "  HTML report   : npx playwright show-report"
echo "  Lighthouse    : bash scripts/lighthouse.sh"
echo ""
echo " CHECKLIST     : checklists/qa-master-checklist.md"
echo " TEST PATH     : tests/sproutos/"
echo " ENV VARS      : SPROUTOS_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD"
echo ""
echo " Remember: Zero .only() · Zero hardcoded credentials · WCAG 2.1 AA"
echo ""

exit 0
