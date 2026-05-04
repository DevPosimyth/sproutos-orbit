#!/bin/bash
# =============================================================================
# Sprout OS Orbit — UI / UX QA
# Checks: Visual layout, responsive viewports, Lighthouse best-practices
#
# Usage:
#   bash scripts/qa-ui.sh                    # all specs, desktop
#   bash scripts/qa-ui.sh --spec=sitemap     # single spec area
#   bash scripts/qa-ui.sh --update-snapshots # approve new baselines
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SPEC="all"
UPDATE_SNAPSHOTS=false
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/ui"
BASE_URL=${SPROUTOS_URL:-"https://sproutos.ai"}

for arg in "$@"; do
  case $arg in
    --spec=*) SPEC="${arg#*=}" ;;
    --update-snapshots) UPDATE_SNAPSHOTS=true ;;
  esac
done

mkdir -p "$REPORT_DIR"

echo ""
echo "========================================="
echo " Sprout OS Orbit — UI / UX QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Viewport: Desktop (1440px)"
echo "========================================="
echo ""

# ── Step 1: Playwright UI specs ───────────────────────────────────────────────
echo "STEP 1 — Playwright UI Specs (Desktop)"
echo "-----------------------------------------"

run_spec() {
  local LABEL=$1
  local SPECFILE=$2

  if [ ! -f "$SPECFILE" ]; then
    echo "── $LABEL — SKIPPED (not found: $SPECFILE)"
    return
  fi

  echo "── $LABEL"
  if [ "$UPDATE_SNAPSHOTS" = true ]; then
    npx playwright test "$SPECFILE" --project=sproutos-desktop --update-snapshots --reporter=list
  else
    npx playwright test "$SPECFILE" --project=sproutos-desktop --reporter=list
  fi

  if [ $? -ne 0 ]; then
    echo "FAILED: $LABEL"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $LABEL"
  fi
  echo ""
}

if [ "$SPEC" = "all" ]; then
  run_spec "Homepage"              "tests/sproutos/homepage.spec.js"
  run_spec "Dashboard UI"         "tests/sproutos/dashboard/dashboard-ui.spec.js"
  run_spec "Sitemap Editor"       "tests/sproutos/sitemap/editor.spec.js"
  run_spec "Design Editor"        "tests/sproutos/design-editor.spec.js"
  run_spec "Login Pages"          "tests/sproutos/login-pages.spec.js"
else
  run_spec "$SPEC" "tests/sproutos/${SPEC}.spec.js"
fi

# ── Step 2: Lighthouse best-practices ────────────────────────────────────────
echo "STEP 2 — Lighthouse Best Practices"
echo "-----------------------------------------"

if ! command -v lighthouse &> /dev/null; then
  echo "Lighthouse not installed — skipping"
  echo "To install: npm install -g lighthouse"
else
  BP_THRESHOLD=85

  scan_ui() {
    local NAME=$1
    local URL=$2
    local SLUG=$3

    echo "Scanning: $NAME ($URL)"
    REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

    lighthouse "$URL" \
      --output=html,json \
      --output-path="$REPORT_PATH" \
      --only-categories=best-practices \
      --chrome-flags="--headless --no-sandbox" \
      --quiet

    JSON_FILE="${REPORT_PATH}.report.json"
    if [ -f "$JSON_FILE" ]; then
      BP=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories['best-practices'].score*100))")
      echo "   Best Practices: $BP / 100  (min: $BP_THRESHOLD)"
      if [ "$BP" -lt "$BP_THRESHOLD" ]; then
        echo "   FAILED: score below threshold"
        FAILED=$((FAILED + 1))
      else
        echo "   PASSED"
      fi
    fi
    echo ""
  }

  scan_ui "Sprout OS Homepage" "$BASE_URL"         "sproutos-home"
  scan_ui "Sprout OS Login"    "$BASE_URL/login"   "sproutos-login"
fi

echo "========================================="
echo " UI SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Reports saved to: $REPORT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL UI CHECKS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
