#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Functionality QA
# Runs functional spec files — auth, projects, sitemap, design, team, manage
#
# Usage:
#   bash scripts/qa-functionality.sh               # all specs
#   bash scripts/qa-functionality.sh --spec=auth   # single spec
#   bash scripts/qa-functionality.sh --spec=sitemap
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
PROJECT="sproutos-desktop"

for arg in "$@"; do
  case $arg in
    --spec=*) SPEC="${arg#*=}" ;;
  esac
done

echo ""
echo "========================================="
echo " Sprout OS Orbit — Functionality QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

run_spec() {
  local LABEL=$1
  local SPECFILE=$2

  if [ ! -f "$SPECFILE" ]; then
    echo "── $LABEL — SKIPPED (not found: $SPECFILE)"
    echo ""
    return
  fi

  echo "── $LABEL ──────────────────────────────"
  npx playwright test "$SPECFILE" --project="$PROJECT" --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: $LABEL"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $LABEL"
  fi
  echo ""
}

if [ "$SPEC" = "all" ]; then
  # Auth & Onboarding
  run_spec "Auth — Login / Signup / Forgot"            "tests/sproutos/auth.spec.js"
  run_spec "Login Pages"                               "tests/sproutos/login-pages.spec.js"

  # Dashboard & Projects
  run_spec "Dashboard"                                 "tests/sproutos/dashboard/dashboard.spec.js"
  run_spec "Dashboard UI"                              "tests/sproutos/dashboard/dashboard-ui.spec.js"
  run_spec "Homepage"                                  "tests/sproutos/homepage.spec.js"

  # Create Mode
  run_spec "Guided Brief Wizard"                       "tests/sproutos/guided-brief.spec.js"
  run_spec "Sitemap Editor (core)"                     "tests/sproutos/sitemap.spec.js"
  run_spec "Sitemap Editor"                            "tests/sproutos/sitemap/editor.spec.js"
  run_spec "Sitemap Pages"                             "tests/sproutos/sitemap/pages.spec.js"
  run_spec "Sitemap Sections"                          "tests/sproutos/sitemap/sections.spec.js"
  run_spec "Sitemap Global Sections"                   "tests/sproutos/sitemap/global-sections.spec.js"
  run_spec "Sitemap AI Chat"                           "tests/sproutos/sitemap/ai-chat.spec.js"
  run_spec "Scope Editor"                              "tests/sproutos/scope.spec.js"
  run_spec "Design Editor"                             "tests/sproutos/design-editor.spec.js"
  run_spec "Design Editor (core)"                      "tests/sproutos/design.spec.js"
  run_spec "Color System"                              "tests/sproutos/color-system.spec.js"
  run_spec "Section Variants"                          "tests/sproutos/section-variants.spec.js"
  run_spec "AI Text Popup"                             "tests/sproutos/ai-text-popup.spec.js"
  run_spec "Image Picker"                              "tests/sproutos/image-picker.spec.js"
  run_spec "Export"                                    "tests/sproutos/export.spec.js"

  # Workspace & Team
  run_spec "Team Management"                           "tests/sproutos/team-management.spec.js"
  run_spec "Token Usage / Billing"                     "tests/sproutos/token-usage.spec.js"
  run_spec "User Settings"                             "tests/sproutos/user-settings.spec.js"

  # Manage Mode
  run_spec "Manage Mode — Overview"                    "tests/sproutos/manage-overview.spec.js"
  run_spec "Manage Mode — Actions"                     "tests/sproutos/manage-actions.spec.js"
  run_spec "Manage Mode — Build"                       "tests/sproutos/manage-build.spec.js"
  run_spec "Manage Mode — MCP Connection"              "tests/sproutos/manage-mcp.spec.js"
  run_spec "Manage Mode — Approvals"                   "tests/sproutos/manage-approvals.spec.js"
else
  # Single spec — try common paths
  if [ -f "tests/sproutos/${SPEC}.spec.js" ]; then
    run_spec "$SPEC" "tests/sproutos/${SPEC}.spec.js"
  elif [ -f "tests/sproutos/sitemap/${SPEC}.spec.js" ]; then
    run_spec "$SPEC" "tests/sproutos/sitemap/${SPEC}.spec.js"
  elif [ -f "tests/sproutos/dashboard/${SPEC}.spec.js" ]; then
    run_spec "$SPEC" "tests/sproutos/dashboard/${SPEC}.spec.js"
  else
    echo "Spec not found: $SPEC"
    FAILED=$((FAILED + 1))
  fi
fi

echo "========================================="
echo " FUNCTIONALITY SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL FUNCTIONALITY TESTS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED SPEC(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
