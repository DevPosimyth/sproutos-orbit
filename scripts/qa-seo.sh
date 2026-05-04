#!/bin/bash
# =============================================================================
# Sprout OS Orbit — SEO / Meta Tags QA
# Checks: page title, meta description, OG tags, canonical, robots.txt,
#         sitemap.xml, Lighthouse SEO score
#
# Usage:
#   bash scripts/qa-seo.sh
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BASE_URL=${SPROUTOS_URL:-"https://sproutos.ai"}
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/seo"
SEO_THRESHOLD=90

mkdir -p "$REPORT_DIR"

echo ""
echo "========================================="
echo " Sprout OS Orbit — SEO / Meta Tags QA"
echo " Target: $BASE_URL"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

# ── Step 1: Playwright SEO spec ───────────────────────────────────────────
echo "STEP 1 — Playwright SEO Spec"
echo "-----------------------------------------"

if [ -f "tests/sproutos/seo.spec.js" ]; then
  npx playwright test "tests/sproutos/seo.spec.js" \
    --project=sproutos-desktop --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: SEO spec"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: SEO spec"
  fi
else
  echo "   INFO  — tests/sproutos/seo.spec.js not found — skipping Playwright check"
fi

echo ""

# ── Step 2: robots.txt & sitemap.xml existence ────────────────────────────
echo "STEP 2 — robots.txt / sitemap.xml"
echo "-----------------------------------------"

check_url() {
  local LABEL=$1
  local URL=$2
  local STATUS

  STATUS=$(curl -sI --max-time 10 "$URL" 2>/dev/null | grep -i "^HTTP/" | awk '{print $2}')

  if [ "$STATUS" = "200" ]; then
    echo "   PASS  — $LABEL accessible (HTTP $STATUS)"
  else
    echo "   FAIL  — $LABEL returned HTTP ${STATUS:-unreachable}"
    FAILED=$((FAILED + 1))
  fi
}

check_url "robots.txt"   "${BASE_URL}/robots.txt"
check_url "sitemap.xml"  "${BASE_URL}/sitemap.xml"

echo ""

# ── Step 3: Basic meta tag check via curl + grep ─────────────────────────
echo "STEP 3 — Meta Tag Presence"
echo "-----------------------------------------"

PAGE_HTML=$(curl -sL --max-time 15 "$BASE_URL" 2>/dev/null)

check_meta() {
  local LABEL=$1
  local PATTERN=$2

  if echo "$PAGE_HTML" | grep -qi "$PATTERN"; then
    echo "   PASS  — $LABEL found"
  else
    echo "   FAIL  — $LABEL MISSING"
    FAILED=$((FAILED + 1))
  fi
}

if [ -z "$PAGE_HTML" ]; then
  echo "   ERROR — Could not fetch $BASE_URL"
  FAILED=$((FAILED + 1))
else
  check_meta "<title> tag"               "<title"
  check_meta "meta description"          'name=["\x27]description["\x27]'
  check_meta "og:title"                  "og:title"
  check_meta "og:description"            "og:description"
  check_meta "og:image"                  "og:image"
  check_meta "canonical link"            'rel=["\x27]canonical["\x27]'
fi

echo ""

# ── Step 4: Lighthouse SEO score ──────────────────────────────────────────
echo "STEP 4 — Lighthouse SEO Score"
echo "-----------------------------------------"

if ! command -v lighthouse &> /dev/null; then
  echo "Lighthouse not installed — skipping"
  echo "To install: npm install -g lighthouse"
else
  scan_seo() {
    local NAME=$1
    local URL=$2
    local SLUG=$3

    echo "Scanning: $NAME ($URL)"
    REPORT_PATH="$REPORT_DIR/${SLUG}-${TIMESTAMP}"

    lighthouse "$URL" \
      --output=html,json \
      --output-path="$REPORT_PATH" \
      --only-categories=seo \
      --chrome-flags="--headless --no-sandbox" \
      --quiet

    JSON_FILE="${REPORT_PATH}.report.json"
    if [ -f "$JSON_FILE" ]; then
      SEO=$(node -e "const d=require('$JSON_FILE'); console.log(Math.round(d.categories.seo.score*100))")
      echo "   SEO: $SEO / 100  (min: $SEO_THRESHOLD)"
      if [ "$SEO" -lt "$SEO_THRESHOLD" ]; then
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

  scan_seo "Sprout OS Homepage" "$BASE_URL"          "sproutos-home"
  scan_seo "Sprout OS Login"    "$BASE_URL/login"    "sproutos-login"
fi

echo "========================================="
echo " SEO SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo " Reports: $REPORT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL SEO CHECKS PASSED"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  exit 1
fi
