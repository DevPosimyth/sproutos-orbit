#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Lighthouse Performance Scanner
# Scans: sproutos.ai
# Usage: bash scripts/lighthouse.sh
# =============================================================================

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# URLs to scan
SPROUTOS_URL=${SPROUTOS_URL:-"https://sproutos.ai"}

# Output directory
REPORT_DIR="reports/lighthouse"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Thresholds
PERF_THRESHOLD=75
A11Y_THRESHOLD=85
SEO_THRESHOLD=80
BP_THRESHOLD=80

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "🌱 Sprout OS Orbit — Lighthouse Scanner"
echo "========================================="
echo "Started: $TIMESTAMP"
echo ""

# Check lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
  echo -e "${RED}❌ Lighthouse CLI not installed.${NC}"
  echo "   Install with: npm install -g lighthouse"
  exit 1
fi

mkdir -p "$REPORT_DIR"

# Pages to scan
PAGES=(
  "$SPROUTOS_URL/"
  "$SPROUTOS_URL/login"
  "$SPROUTOS_URL/signup"
  "$SPROUTOS_URL/pricing"
)

FAILED=0

for URL in "${PAGES[@]}"; do
  SAFE=$(echo "$URL" | sed 's|https\?://||; s|/|_|g')
  REPORT_FILE="$REPORT_DIR/${SAFE}_${TIMESTAMP}.html"
  echo -e "${YELLOW}▶ Scanning:${NC} $URL"

  lighthouse "$URL" \
    --output=html \
    --output-path="$REPORT_FILE" \
    --chrome-flags="--headless --no-sandbox" \
    --quiet || { FAILED=1; continue; }

  echo -e "${GREEN}✓ Report:${NC} $REPORT_FILE"
done

echo ""
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Lighthouse scan complete${NC}"
else
  echo -e "${RED}❌ One or more Lighthouse scans failed${NC}"
fi

exit $FAILED
