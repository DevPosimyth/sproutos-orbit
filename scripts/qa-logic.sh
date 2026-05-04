#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Logic / Business Rules QA
# Covers: auth-gating, RBAC, edge cases, API error handling, create-mode flows
#
# Usage:
#   bash scripts/qa-logic.sh               # all logic specs
#   bash scripts/qa-logic.sh --spec=auth   # single spec
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
echo " Sprout OS Orbit — Logic / Business Rules QA"
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
  # Auth-gating & Session Management
  run_spec "Auth — Login / Signup / Forgot"       "tests/sproutos/auth.spec.js"
  run_spec "Login Pages"                          "tests/sproutos/login-pages.spec.js"

  # RBAC — role-based access control
  run_spec "Team Management (RBAC)"               "tests/sproutos/team-management.spec.js"
  run_spec "User Settings"                        "tests/sproutos/user-settings.spec.js"

  # Create Mode business logic
  run_spec "Guided Brief Wizard"                  "tests/sproutos/guided-brief.spec.js"
  run_spec "Sitemap — Core Logic"                 "tests/sproutos/sitemap.spec.js"
  run_spec "Sitemap — Pages Logic"                "tests/sproutos/sitemap/pages.spec.js"
  run_spec "Sitemap — Sections Logic"             "tests/sproutos/sitemap/sections.spec.js"
  run_spec "Sitemap — Global Sections"            "tests/sproutos/sitemap/global-sections.spec.js"
  run_spec "Sitemap — AI Chat"                    "tests/sproutos/sitemap/ai-chat.spec.js"
  run_spec "Scope Editor"                         "tests/sproutos/scope.spec.js"
  run_spec "Design Editor — Core Logic"           "tests/sproutos/design.spec.js"
  run_spec "Color System Logic"                   "tests/sproutos/color-system.spec.js"
  run_spec "Section Variants Logic"               "tests/sproutos/section-variants.spec.js"
  run_spec "AI Text Popup"                        "tests/sproutos/ai-text-popup.spec.js"
  run_spec "Image Picker"                         "tests/sproutos/image-picker.spec.js"
  run_spec "Export Logic"                         "tests/sproutos/export.spec.js"

  # Manage Mode logic
  run_spec "Manage Mode — Overview"               "tests/sproutos/manage-overview.spec.js"
  run_spec "Manage Mode — Actions"                "tests/sproutos/manage-actions.spec.js"
  run_spec "Manage Mode — Build"                  "tests/sproutos/manage-build.spec.js"
  run_spec "Manage Mode — MCP Connection"         "tests/sproutos/manage-mcp.spec.js"
  run_spec "Manage Mode — Approvals"              "tests/sproutos/manage-approvals.spec.js"

  # Billing & token usage
  run_spec "Token Usage / Billing"                "tests/sproutos/token-usage.spec.js"
else
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
echo " LOGIC QA SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL LOGIC TESTS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED SPEC(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
