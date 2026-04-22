#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Run All Tests
# Runs: Playwright tests + Lighthouse scans for sproutos.ai
# Usage: bash scripts/run-all-tests.sh
#        bash scripts/run-all-tests.sh --skip-lighthouse
# =============================================================================

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SKIP_LIGHTHOUSE=false
FAILED=0

# Parse arguments
for arg in "$@"; do
  case $arg in
    --skip-lighthouse) SKIP_LIGHTHOUSE=true; shift ;;
  esac
done

echo "🌱 Sprout OS Orbit — Run All Tests ($TIMESTAMP)"
echo "================================================"

# Playwright
echo ""
echo "▶ Playwright E2E tests"
npx playwright test || FAILED=1

# Lighthouse (optional)
if [ "$SKIP_LIGHTHOUSE" = false ]; then
  echo ""
  echo "▶ Lighthouse scan"
  bash scripts/lighthouse.sh || FAILED=1
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed"
else
  echo "❌ One or more test suites failed"
fi

exit $FAILED
