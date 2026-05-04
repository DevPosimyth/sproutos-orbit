#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Cross-Browser QA
# Runs core specs across Chromium, Firefox, and WebKit
#
# Usage:
#   bash scripts/qa-cross-browser.sh               # all browsers, core specs
#   bash scripts/qa-cross-browser.sh --spec=auth   # single spec, all browsers
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SPEC="all"
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

for arg in "$@"; do
  case $arg in
    --spec=*) SPEC="${arg#*=}" ;;
  esac
done

if [ "$SPEC" = "all" ]; then
  # Pick first available representative spec for cross-browser checks
  for s in "tests/sproutos/homepage.spec.js" \
            "tests/sproutos/login-pages.spec.js" \
            "tests/sproutos/auth.spec.js"; do
    [ -f "$s" ] && { TESTPATH="$s"; break; }
  done
  TESTPATH="${TESTPATH:-tests/sproutos}"
else
  TESTPATH="tests/sproutos/${SPEC}.spec.js"
fi

echo ""
echo "========================================="
echo " Sprout OS Orbit — Cross-Browser QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Browsers: Chromium · Firefox · WebKit"
echo "========================================="
echo ""

run_browser() {
  local LABEL=$1
  local PROJECT=$2

  echo "── $LABEL ──────────────────────────────"
  npx playwright test "$TESTPATH" --project="$PROJECT" --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: $LABEL"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: $LABEL"
  fi
  echo ""
}

run_browser "Chromium (Desktop)" "sproutos-desktop"
run_browser "Firefox  (Desktop)" "sproutos-firefox"
run_browser "WebKit   (Desktop)" "sproutos-webkit"

echo "========================================="
echo " CROSS-BROWSER SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL BROWSERS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED BROWSER(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
