#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Lighthouse Performance Scanner
# Scans: sproutos.ai
# Usage: bash scripts/lighthouse.sh
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BASE_URL=${SPROUTOS_URL:-"https://sproutos.ai"}
REPORT_DIR="reports/lighthouse"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Thresholds
PERF_THRESHOLD=80
A11Y_THRESHOLD=90
SEO_THRESHOLD=90
BP_THRESHOLD=85

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "========================================="
echo " Sprout OS Orbit — Lighthouse Scanner"
echo " Target: $BASE_URL"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

if ! command -v lighthouse &> /dev/null; then
  echo "Lighthouse not installed."
  echo "Run: npm install -g lighthouse"
  exit 1
fi

mkdir -p "$REPORT_DIR"

run_lighthouse() {
  local NAME=$1
  local URL=$2
  local SLUG=$3

  echo "Scanning: $NAME"
  echo "   URL: $URL"

  REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

  lighthouse "$URL" \
    --output=html,json \
    --output-path="$REPORT_PATH" \
    --chrome-flags="--headless --no-sandbox" \
    --quiet

  JSON_FILE="${REPORT_PATH}.report.json"

  if [ -f "$JSON_FILE" ]; then
    PERF=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.performance.score*100))")
    A11Y=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.accessibility.score*100))")
    SEO=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.seo.score*100))")
    BP=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories['best-practices'].score*100))")

    echo ""
    echo "   Results for $NAME:"
    echo "   Performance:    $PERF / 100  (min: $PERF_THRESHOLD)"
    echo "   Accessibility:  $A11Y / 100  (min: $A11Y_THRESHOLD)"
    echo "   SEO:            $SEO / 100   (min: $SEO_THRESHOLD)"
    echo "   Best Practices: $BP / 100    (min: $BP_THRESHOLD)"
    echo "   Report: ${REPORT_PATH}.report.html"
  else
    echo "   Could not parse scores — check report manually"
  fi

  echo ""
}

run_lighthouse "Sprout OS" "$BASE_URL" "sproutos"
run_lighthouse "Login"     "$BASE_URL/login"  "sproutos-login"
run_lighthouse "Signup"    "$BASE_URL/signup" "sproutos-signup"

echo "========================================="
echo " Lighthouse scans complete"
echo " All reports saved to: $REPORT_DIR"
echo ""
