#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Responsiveness QA
# Runs specs across desktop (1440px), tablet (768px), and mobile (375px)
#
# Usage:
#   bash scripts/qa-responsive.sh               # all specs, all viewports
#   bash scripts/qa-responsive.sh --spec=auth   # single spec, all viewports
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
  # Pick a broadly applicable spec for viewport checks
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
echo " Sprout OS Orbit — Responsiveness QA"
echo " Spec: $SPEC"
echo " Started: $TIMESTAMP"
echo " Viewports: 1440px · 768px · 375px"
echo "========================================="
echo ""

run_viewport() {
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

run_viewport "Desktop  (1440px)" "sproutos-desktop"
run_viewport "Tablet   (768px)"  "sproutos-tablet"
run_viewport "Mobile   (375px)"  "sproutos-mobile"

echo "========================================="
echo " RESPONSIVENESS SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL VIEWPORTS PASSED"
  echo " View report: npx playwright show-report"
  exit 0
else
  echo " $FAILED VIEWPORT(S) FAILED"
  echo " View report: npx playwright show-report"
  exit 1
fi
