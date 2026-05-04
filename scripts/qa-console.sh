#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Console Errors QA
# Checks: JS console errors, 404s, failed network requests via Playwright
#
# Usage:
#   bash scripts/qa-console.sh               # all specs
#   bash scripts/qa-console.sh --spec=auth   # single spec
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
PROJECT="sproutos-desktop"
BASE_URL=${SPROUTOS_URL:-"https://sproutos.ai"}

for arg in "$@"; do
  case $arg in
    --spec=*) SPEC="${arg#*=}" ;;
  esac
done

echo ""
echo "========================================="
echo " Sprout OS Orbit — Console Errors QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

# ── Step 1: Playwright specs (console error interception) ─────────────────
echo "STEP 1 — Playwright Console / Network Error Specs"
echo "-----------------------------------------"

run_spec() {
  local LABEL=$1
  local SPECFILE=$2

  if [ ! -f "$SPECFILE" ]; then
    echo "── $LABEL — SKIPPED (not found: $SPECFILE)"
    echo ""
    return
  fi

  echo "── $LABEL"
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
  # If a dedicated console-errors spec exists, run it first
  if [ -f "tests/sproutos/console-errors.spec.js" ]; then
    run_spec "Console Errors (dedicated spec)" "tests/sproutos/console-errors.spec.js"
  fi

  # Run all main specs — each should have page.on('console') guards
  run_spec "Homepage"              "tests/sproutos/homepage.spec.js"
  run_spec "Login Pages"          "tests/sproutos/login-pages.spec.js"
  run_spec "Dashboard"            "tests/sproutos/dashboard/dashboard.spec.js"
  run_spec "Dashboard UI"         "tests/sproutos/dashboard/dashboard-ui.spec.js"
  run_spec "Sitemap Editor"       "tests/sproutos/sitemap/editor.spec.js"
  run_spec "Design Editor"        "tests/sproutos/design-editor.spec.js"
  run_spec "Manage Overview"      "tests/sproutos/manage-overview.spec.js"
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

# ── Step 2: Quick curl 404 check on key routes ────────────────────────────
echo "STEP 2 — Key Route Availability (HTTP status)"
echo "-----------------------------------------"

check_route() {
  local LABEL=$1
  local URL=$2
  local STATUS

  STATUS=$(curl -sI --max-time 10 "$URL" 2>/dev/null | grep -i "^HTTP/" | awk '{print $2}')

  if [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
    echo "   PASS  — $LABEL ($STATUS)"
  else
    echo "   FAIL  — $LABEL returned HTTP ${STATUS:-unreachable}"
    FAILED=$((FAILED + 1))
  fi
}

check_route "Homepage"   "$BASE_URL"
check_route "Login"      "$BASE_URL/login"
check_route "Signup"     "$BASE_URL/signup"

echo ""

# ── Summary ───────────────────────────────────────────────────────────────
echo "========================================="
echo " CONSOLE ERRORS SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL CONSOLE / NETWORK CHECKS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
