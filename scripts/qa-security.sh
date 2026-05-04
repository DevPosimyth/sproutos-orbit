#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Security QA
# Checks: HTTP security headers, HTTPS redirect, mixed content, robots.txt
#
# Usage:
#   bash scripts/qa-security.sh
# =============================================================================

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BASE_URL=${SPROUTOS_URL:-"https://sproutos.ai"}
FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo ""
echo "========================================="
echo " Sprout OS Orbit — Security QA"
echo " Target: $BASE_URL"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

# ── Helper: fetch headers ──────────────────────────────────────────────────
get_headers() {
  curl -sI --max-time 10 "$1" 2>/dev/null
}

check_header() {
  local LABEL=$1
  local HEADERS=$2
  local HEADER_NAME=$3
  local SHOULD_EXIST=${4:-true}

  if [ "$SHOULD_EXIST" = true ]; then
    if echo "$HEADERS" | grep -qi "^${HEADER_NAME}:"; then
      echo "   PASS  — $LABEL present"
    else
      echo "   FAIL  — $LABEL MISSING"
      FAILED=$((FAILED + 1))
    fi
  else
    if echo "$HEADERS" | grep -qi "^${HEADER_NAME}:"; then
      echo "   FAIL  — $LABEL should NOT be present (found)"
      FAILED=$((FAILED + 1))
    else
      echo "   PASS  — $LABEL absent (expected)"
    fi
  fi
}

# ── Step 1: Security Headers ───────────────────────────────────────────────
echo "STEP 1 — Security Headers ($BASE_URL)"
echo "-----------------------------------------"

HEADERS=$(get_headers "$BASE_URL")

if [ -z "$HEADERS" ]; then
  echo "ERROR: Could not reach $BASE_URL — skipping header checks"
  FAILED=$((FAILED + 1))
else
  check_header "Strict-Transport-Security (HSTS)"   "$HEADERS" "strict-transport-security"
  check_header "X-Frame-Options"                     "$HEADERS" "x-frame-options"
  check_header "X-Content-Type-Options"              "$HEADERS" "x-content-type-options"
  check_header "Referrer-Policy"                     "$HEADERS" "referrer-policy"
  check_header "Permissions-Policy"                  "$HEADERS" "permissions-policy"
  check_header "Content-Security-Policy"             "$HEADERS" "content-security-policy"
  check_header "X-Powered-By (should be absent)"     "$HEADERS" "x-powered-by" false
fi

echo ""

# ── Step 2: HTTPS Redirect ─────────────────────────────────────────────────
echo "STEP 2 — HTTPS Redirect Check"
echo "-----------------------------------------"

HTTP_URL=$(echo "$BASE_URL" | sed 's|^https://|http://|')
REDIRECT=$(curl -sI --max-time 10 "$HTTP_URL" 2>/dev/null | grep -i "^location:")

if echo "$REDIRECT" | grep -qi "https://"; then
  echo "   PASS  — HTTP redirects to HTTPS"
else
  echo "   FAIL  — HTTP does NOT redirect to HTTPS"
  FAILED=$((FAILED + 1))
fi

echo ""

# ── Step 3: robots.txt ────────────────────────────────────────────────────
echo "STEP 3 — robots.txt"
echo "-----------------------------------------"

ROBOTS_STATUS=$(curl -sI --max-time 10 "${BASE_URL}/robots.txt" 2>/dev/null | grep -i "^HTTP/" | awk '{print $2}')

if [ "$ROBOTS_STATUS" = "200" ]; then
  echo "   PASS  — robots.txt accessible (HTTP $ROBOTS_STATUS)"
else
  echo "   WARN  — robots.txt returned HTTP ${ROBOTS_STATUS:-unreachable}"
fi

echo ""

# ── Step 4: Mixed Content (CSP check via Playwright) ──────────────────────
echo "STEP 4 — Mixed Content / Playwright Security Spec"
echo "-----------------------------------------"

if [ -f "tests/sproutos/security.spec.js" ]; then
  npx playwright test "tests/sproutos/security.spec.js" \
    --project=sproutos-desktop --reporter=list

  if [ $? -ne 0 ]; then
    echo "FAILED: Security spec"
    FAILED=$((FAILED + 1))
  else
    echo "PASSED: Security spec"
  fi
else
  echo "   INFO  — tests/sproutos/security.spec.js not found — skipping Playwright check"
fi

echo ""

# ── Summary ───────────────────────────────────────────────────────────────
echo "========================================="
echo " SECURITY SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL SECURITY CHECKS PASSED"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  exit 1
fi
