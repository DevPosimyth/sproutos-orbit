#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Performance QA
# Checks: Lighthouse performance score + key web vitals
#
# Usage:
#   bash scripts/qa-performance.sh
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BASE_URL=${SPROUTOS_URL:-"https://sproutos.ai"}
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/performance"

# Thresholds
PERF_THRESHOLD=80

mkdir -p "$REPORT_DIR"

echo ""
echo "========================================="
echo " Sprout OS Orbit — Performance QA"
echo " Target: $BASE_URL"
echo " Started: $TIMESTAMP"
echo " Threshold: Performance ≥ $PERF_THRESHOLD"
echo "========================================="
echo ""

if ! command -v lighthouse &> /dev/null; then
  echo "Lighthouse not installed."
  echo "Run: npm install -g lighthouse"
  exit 1
fi

run_perf() {
  local NAME=$1
  local URL=$2
  local SLUG=$3

  echo "── Scanning: $NAME"
  echo "   URL: $URL"

  REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

  lighthouse "$URL" \
    --output=html,json \
    --output-path="$REPORT_PATH" \
    --only-categories=performance \
    --chrome-flags="--headless --no-sandbox" \
    --quiet

  JSON_FILE="${REPORT_PATH}.report.json"

  if [ -f "$JSON_FILE" ]; then
    PERF=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.performance.score*100))")
    FCP=$(node -e "const d=require('$JSON_FILE'); const m=d.audits['first-contentful-paint']; console.log(m?m.displayValue:'n/a')" 2>/dev/null)
    LCP=$(node -e "const d=require('$JSON_FILE'); const m=d.audits['largest-contentful-paint']; console.log(m?m.displayValue:'n/a')" 2>/dev/null)
    TBT=$(node -e "const d=require('$JSON_FILE'); const m=d.audits['total-blocking-time']; console.log(m?m.displayValue:'n/a')" 2>/dev/null)
    CLS=$(node -e "const d=require('$JSON_FILE'); const m=d.audits['cumulative-layout-shift']; console.log(m?m.displayValue:'n/a')" 2>/dev/null)

    echo ""
    echo "   Performance Score: $PERF / 100  (min: $PERF_THRESHOLD)"
    echo "   FCP: $FCP"
    echo "   LCP: $LCP"
    echo "   TBT: $TBT"
    echo "   CLS: $CLS"
    echo "   Report: ${REPORT_PATH}.report.html"

    if [ "$PERF" -lt "$PERF_THRESHOLD" ]; then
      echo "   FAILED: performance score below threshold"
      FAILED=$((FAILED + 1))
    else
      echo "   PASSED"
    fi
  else
    echo "   Could not parse scores — check report manually"
    FAILED=$((FAILED + 1))
  fi

  echo ""
}

run_perf "Sprout OS Homepage" "$BASE_URL"          "sproutos-home"
run_perf "Sprout OS Login"    "$BASE_URL/login"    "sproutos-login"
run_perf "Sprout OS Signup"   "$BASE_URL/signup"   "sproutos-signup"

echo "========================================="
echo " PERFORMANCE SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Reports saved to: $REPORT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL PERFORMANCE CHECKS PASSED"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  exit 1
fi
