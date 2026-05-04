#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Accessibility QA
# Checks: axe-core WCAG 2.1 AA via Playwright + Lighthouse accessibility score
#
# Usage:
#   bash scripts/qa-accessibility.sh               # all a11y specs
#   bash scripts/qa-accessibility.sh --spec=auth   # single spec
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
PROJECT="sproutos-desktop"
REPORT_DIR="reports/accessibility"
BASE_URL=${SPROUTOS_URL:-"https://sproutos.ai"}
A11Y_THRESHOLD=90

for arg in "$@"; do
  case $arg in
    --spec=*) SPEC="${arg#*=}" ;;
  esac
done

mkdir -p "$REPORT_DIR"

echo ""
echo "========================================="
echo " Sprout OS Orbit — Accessibility QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Standard: WCAG 2.1 AA"
echo "========================================="
echo ""

# ── Step 1: Playwright + axe-core specs ───────────────────────────────────
echo "STEP 1 — Playwright / axe-core Accessibility Specs"
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
  run_spec "Homepage — Accessibility"          "tests/sproutos/homepage.spec.js"
  run_spec "Login Pages — Accessibility"       "tests/sproutos/login-pages.spec.js"
  run_spec "Dashboard — Accessibility"         "tests/sproutos/dashboard/dashboard-ui.spec.js"
  run_spec "Sitemap Editor — Accessibility"    "tests/sproutos/sitemap/editor.spec.js"
  run_spec "Design Editor — Accessibility"     "tests/sproutos/design-editor.spec.js"

  # Dedicated accessibility spec (if present)
  if [ -f "tests/sproutos/accessibility.spec.js" ]; then
    run_spec "Accessibility Spec (axe-core)"   "tests/sproutos/accessibility.spec.js"
  fi
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

# ── Step 2: Lighthouse Accessibility Score ────────────────────────────────
echo "STEP 2 — Lighthouse Accessibility Score"
echo "-----------------------------------------"

if ! command -v lighthouse &> /dev/null; then
  echo "Lighthouse not installed — skipping"
  echo "To install: npm install -g lighthouse"
else
  scan_a11y() {
    local NAME=$1
    local URL=$2
    local SLUG=$3

    echo "Scanning: $NAME ($URL)"
    REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

    lighthouse "$URL" \
      --output=html,json \
      --output-path="$REPORT_PATH" \
      --only-categories=accessibility \
      --chrome-flags="--headless --no-sandbox" \
      --quiet

    JSON_FILE="${REPORT_PATH}.report.json"
    if [ -f "$JSON_FILE" ]; then
      A11Y=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.accessibility.score*100))")
      echo "   Accessibility: $A11Y / 100  (min: $A11Y_THRESHOLD)"
      if [ "$A11Y" -lt "$A11Y_THRESHOLD" ]; then
        echo "   FAILED: score below threshold"
        FAILED=$((FAILED + 1))
      else
        echo "   PASSED"
      fi
      echo "   Report: ${REPORT_PATH}.report.html"
    else
      echo "   Could not parse scores — check report manually"
    fi
    echo ""
  }

  scan_a11y "Sprout OS Homepage" "$BASE_URL"          "sproutos-home"
  scan_a11y "Sprout OS Login"    "$BASE_URL/login"    "sproutos-login"
  scan_a11y "Sprout OS Signup"   "$BASE_URL/signup"   "sproutos-signup"
fi

echo "========================================="
echo " ACCESSIBILITY SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Reports: $REPORT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL ACCESSIBILITY CHECKS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
