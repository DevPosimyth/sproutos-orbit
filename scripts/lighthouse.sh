#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Lighthouse Extreme QA Scanner
# Runs desktop + mobile Lighthouse on all key pages, enforces thresholds,
# extracts Core Web Vitals, and generates a markdown scorecard.
#
# Usage  : bash scripts/lighthouse.sh [OPTIONS]
#
# Options:
#   --url <url>          Override base URL (default: SPROUTOS_URL or sproutos.ai)
#   --desktop-only       Skip mobile Lighthouse runs
#   --mobile-only        Skip desktop Lighthouse runs
#   --no-threshold       Run scans but don't fail on threshold violations
#   --pages <p1,p2,...>  Comma-separated page paths to scan (default: preset list)
# =============================================================================

set -euo pipefail

# ── Load .env ─────────────────────────────────────────────────────────────────
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs -d '\n') 2>/dev/null || true
fi

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL="${SPROUTOS_URL:-https://sproutos.ai}"
REPORT_DIR="reports/lighthouse"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SCORECARD="$REPORT_DIR/scorecard-$TIMESTAMP.md"

# Flags
RUN_DESKTOP=true
RUN_MOBILE=true
ENFORCE_THRESHOLDS=true
CUSTOM_PAGES=""

for arg in "$@"; do
  case $arg in
    --url)            shift; BASE_URL="$1" ;;
    --desktop-only)   RUN_MOBILE=false ;;
    --mobile-only)    RUN_DESKTOP=false ;;
    --no-threshold)   ENFORCE_THRESHOLDS=false ;;
    --pages)          shift; CUSTOM_PAGES="$1" ;;
  esac
done

# ── Thresholds (PM-approved minimum scores out of 100) ────────────────────────
THRESH_PERF=75      # Performance
THRESH_A11Y=85      # Accessibility
THRESH_BP=80        # Best Practices
THRESH_SEO=85       # SEO
THRESH_LCP=4000     # Largest Contentful Paint (ms)
THRESH_CLS=0.1      # Cumulative Layout Shift
THRESH_TBT=600      # Total Blocking Time (ms)
THRESH_FCP=3000     # First Contentful Paint (ms)

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

pass() { echo -e "${GREEN}  ✓ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
info() { echo -e "    $1"; }

# ── Pages to scan ─────────────────────────────────────────────────────────────
if [ -n "$CUSTOM_PAGES" ]; then
  IFS=',' read -ra PAGE_PATHS <<< "$CUSTOM_PAGES"
else
  PAGE_PATHS=(
    "/"
    "/auth/login"
    "/auth/signup"
    "/auth/forgot-password"
  )
fi

# ── Dependency check ──────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   🔦  Sprout OS Orbit — Lighthouse QA Scanner        ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo -e "   Target  : ${CYAN}$BASE_URL${NC}"
echo -e "   Started : $TIMESTAMP"
echo ""

if ! command -v lighthouse &>/dev/null; then
  echo -e "${RED}❌ Lighthouse CLI not found.${NC}"
  echo "   Install: npm install -g lighthouse"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  warn "jq not found — score extraction will be skipped. Install: brew install jq"
  JQ_OK=false
else
  JQ_OK=true
fi

mkdir -p "$REPORT_DIR"

# ── Scorecard header ──────────────────────────────────────────────────────────
cat > "$SCORECARD" <<MDEOF
# Sprout OS — Lighthouse QA Scorecard

**Date:** $(date)
**Target:** $BASE_URL
**Run ID:** $TIMESTAMP

---

## Thresholds

| Metric | Threshold |
|--------|-----------|
| Performance | ≥ $THRESH_PERF |
| Accessibility | ≥ $THRESH_A11Y |
| Best Practices | ≥ $THRESH_BP |
| SEO | ≥ $THRESH_SEO |
| LCP | ≤ ${THRESH_LCP}ms |
| CLS | ≤ $THRESH_CLS |
| TBT | ≤ ${THRESH_TBT}ms |
| FCP | ≤ ${THRESH_FCP}ms |

---

## Results

MDEOF

TOTAL_SCANS=0
FAILED_SCANS=0

# ── Scan function ─────────────────────────────────────────────────────────────
run_scan() {
  local url="$1"
  local profile="$2"    # desktop | mobile
  local safe_name
  safe_name=$(echo "$url" | sed 's|https\?://||; s|[/:]|_|g; s|_$||')
  local json_out="$REPORT_DIR/${safe_name}_${profile}_${TIMESTAMP}.json"
  local html_out="$REPORT_DIR/${safe_name}_${profile}_${TIMESTAMP}.html"
  local scan_fail=0

  echo ""
  echo -e "${CYAN}${BOLD}  ▶ [$profile] $url${NC}"

  # Build Lighthouse flags
  local LH_FLAGS="--chrome-flags='--headless --no-sandbox --disable-dev-shm-usage'"
  local LH_PRESET=""
  if [ "$profile" = "mobile" ]; then
    LH_PRESET="--preset=perf --emulated-form-factor=mobile --throttling-method=simulate"
  else
    LH_PRESET="--preset=desktop --emulated-form-factor=desktop --throttling-method=simulate"
  fi

  lighthouse "$url" \
    $LH_PRESET \
    --output=html,json \
    --output-path="${json_out%.json}" \
    --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
    --quiet 2>&1 | grep -v "^$" || {
      fail "Lighthouse scan failed for $url [$profile]"
      FAILED_SCANS=$((FAILED_SCANS + 1))
      TOTAL_SCANS=$((TOTAL_SCANS + 1))
      return
    }

  TOTAL_SCANS=$((TOTAL_SCANS + 1))

  # ── Parse scores with jq ──────────────────────────────────────────────────
  if [ "$JQ_OK" = true ] && [ -f "$json_out" ]; then

    SCORE_PERF=$(jq '(.categories.performance.score // 0) * 100 | round'     "$json_out" 2>/dev/null || echo 0)
    SCORE_A11Y=$(jq '(.categories.accessibility.score // 0) * 100 | round'   "$json_out" 2>/dev/null || echo 0)
    SCORE_BP=$(jq '(.categories."best-practices".score // 0) * 100 | round'  "$json_out" 2>/dev/null || echo 0)
    SCORE_SEO=$(jq '(.categories.seo.score // 0) * 100 | round'              "$json_out" 2>/dev/null || echo 0)

    # Core Web Vitals
    LCP_MS=$(jq '.audits["largest-contentful-paint"].numericValue // 9999 | round'     "$json_out" 2>/dev/null || echo 9999)
    CLS_VAL=$(jq '.audits["cumulative-layout-shift"].numericValue // 9 | . * 1000 | round | . / 1000' "$json_out" 2>/dev/null || echo 9)
    TBT_MS=$(jq '.audits["total-blocking-time"].numericValue // 9999 | round'          "$json_out" 2>/dev/null || echo 9999)
    FCP_MS=$(jq '.audits["first-contentful-paint"].numericValue // 9999 | round'       "$json_out" 2>/dev/null || echo 9999)
    TTI_MS=$(jq '.audits["interactive"].numericValue // 9999 | round'                  "$json_out" 2>/dev/null || echo 9999)
    SI_MS=$(jq '.audits["speed-index"].numericValue // 9999 | round'                   "$json_out" 2>/dev/null || echo 9999)

    # ── Display scores ──────────────────────────────────────────────────────
    echo ""
    echo -e "    ${BOLD}Category Scores${NC}"
    score_line() {
      local label="$1" score="$2" threshold="$3"
      if [ "$score" -ge "$threshold" ] 2>/dev/null; then
        echo -e "    ${GREEN}✓${NC} $label: ${GREEN}$score${NC} / 100  (min $threshold)"
      else
        echo -e "    ${RED}✗${NC} $label: ${RED}$score${NC} / 100  (min $threshold)"
        scan_fail=$((scan_fail + 1))
      fi
    }

    score_line "Performance   " "$SCORE_PERF" "$THRESH_PERF"
    score_line "Accessibility " "$SCORE_A11Y" "$THRESH_A11Y"
    score_line "Best Practices" "$SCORE_BP"   "$THRESH_BP"
    score_line "SEO           " "$SCORE_SEO"  "$THRESH_SEO"

    echo ""
    echo -e "    ${BOLD}Core Web Vitals${NC}"

    cwv_line() {
      local label="$1" value="$2" threshold="$3" unit="$4"
      if echo "$value <= $threshold" | bc -l 2>/dev/null | grep -q 1; then
        echo -e "    ${GREEN}✓${NC} $label: ${GREEN}${value}${unit}${NC}  (max ${threshold}${unit})"
      else
        echo -e "    ${RED}✗${NC} $label: ${RED}${value}${unit}${NC}  (max ${threshold}${unit})"
        scan_fail=$((scan_fail + 1))
      fi
    }

    cwv_line "LCP (Largest Contentful Paint)" "$LCP_MS" "$THRESH_LCP" "ms"
    cwv_line "TBT (Total Blocking Time)      " "$TBT_MS" "$THRESH_TBT" "ms"
    cwv_line "FCP (First Contentful Paint)   " "$FCP_MS" "$THRESH_FCP" "ms"
    cwv_line "CLS (Cumulative Layout Shift)  " "$CLS_VAL" "$THRESH_CLS" ""
    info     "TTI (Time to Interactive)      : ${TTI_MS}ms"
    info     "SI  (Speed Index)              : ${SI_MS}ms"

    # ── SEO-specific Lighthouse audit items ───────────────────────────────────
    echo ""
    echo -e "    ${BOLD}Key SEO Audits${NC}"

    lh_audit() {
      local id="$1" label="$2"
      local score
      score=$(jq --arg id "$id" '.audits[$id].score // -1' "$json_out" 2>/dev/null || echo -1)
      if [ "$score" = "1" ]; then
        echo -e "    ${GREEN}✓${NC} $label"
      elif [ "$score" = "0" ]; then
        echo -e "    ${RED}✗${NC} $label"
        scan_fail=$((scan_fail + 1))
      else
        echo -e "    ${YELLOW}~${NC} $label (score: $score)"
      fi
    }

    lh_audit "document-title"            "Document has a <title> element"
    lh_audit "meta-description"          "Document has meta description"
    lh_audit "http-status-code"          "Page has successful HTTP status code"
    lh_audit "link-text"                 "Links have descriptive text"
    lh_audit "crawlable-anchors"         "Links are crawlable"
    lh_audit "robots-txt"                "robots.txt is valid"
    lh_audit "image-alt"                 "Image elements have alt attributes"
    lh_audit "hreflang"                  "hreflang is valid"
    lh_audit "canonical"                 "Document has a valid rel=canonical"
    lh_audit "font-size"                 "Document uses legible font sizes"
    lh_audit "tap-targets"               "Touch targets are sized appropriately"
    lh_audit "uses-text-compression"     "Text resources are compressed (gzip)"
    lh_audit "uses-https"                "Uses HTTPS"
    lh_audit "no-vulnerable-libraries"   "No front-end JS libraries with known vulns"
    lh_audit "csp-xss"                   "CSP is effective against XSS attacks"

    # ── Scorecard row ─────────────────────────────────────────────────────────
    STATUS_ICON="✅"
    [ "$scan_fail" -gt 0 ] && STATUS_ICON="❌"

    cat >> "$SCORECARD" <<ROWEOF
### $STATUS_ICON [$profile] $url

| Metric | Score | Threshold | Status |
|--------|-------|-----------|--------|
| Performance | $SCORE_PERF | ≥$THRESH_PERF | $([ "$SCORE_PERF" -ge "$THRESH_PERF" ] && echo "✅" || echo "❌") |
| Accessibility | $SCORE_A11Y | ≥$THRESH_A11Y | $([ "$SCORE_A11Y" -ge "$THRESH_A11Y" ] && echo "✅" || echo "❌") |
| Best Practices | $SCORE_BP | ≥$THRESH_BP | $([ "$SCORE_BP" -ge "$THRESH_BP" ] && echo "✅" || echo "❌") |
| SEO | $SCORE_SEO | ≥$THRESH_SEO | $([ "$SCORE_SEO" -ge "$THRESH_SEO" ] && echo "✅" || echo "❌") |
| LCP | ${LCP_MS}ms | ≤${THRESH_LCP}ms | $(echo "$LCP_MS <= $THRESH_LCP" | bc -l 2>/dev/null | grep -q 1 && echo "✅" || echo "❌") |
| CLS | $CLS_VAL | ≤$THRESH_CLS | $(echo "$CLS_VAL <= $THRESH_CLS" | bc -l 2>/dev/null | grep -q 1 && echo "✅" || echo "❌") |
| TBT | ${TBT_MS}ms | ≤${THRESH_TBT}ms | $(echo "$TBT_MS <= $THRESH_TBT" | bc -l 2>/dev/null | grep -q 1 && echo "✅" || echo "❌") |
| FCP | ${FCP_MS}ms | ≤${THRESH_FCP}ms | $(echo "$FCP_MS <= $THRESH_FCP" | bc -l 2>/dev/null | grep -q 1 && echo "✅" || echo "❌") |

- HTML report: \`$html_out\`

---

ROWEOF

  else
    warn "jq not available or JSON missing — displaying HTML report path only"
    info "HTML: $html_out"
    cat >> "$SCORECARD" <<ROWEOF
### [$profile] $url

- HTML report: \`$html_out\`
- Score extraction skipped (jq not available)

---

ROWEOF
  fi

  # Apply threshold failures
  if [ "$ENFORCE_THRESHOLDS" = true ] && [ "$scan_fail" -gt 0 ]; then
    fail "$scan_fail threshold violation(s) on [$profile] $url"
    FAILED_SCANS=$((FAILED_SCANS + 1))
  elif [ "$scan_fail" -gt 0 ]; then
    warn "$scan_fail threshold violation(s) on [$profile] $url (thresholds not enforced)"
  else
    pass "All thresholds passed for [$profile] $url"
  fi
}

# ── Run scans ─────────────────────────────────────────────────────────────────
for PATH_SUFFIX in "${PAGE_PATHS[@]}"; do
  FULL_URL="${BASE_URL}${PATH_SUFFIX}"
  [ "$RUN_DESKTOP" = true ] && run_scan "$FULL_URL" "desktop"
  [ "$RUN_MOBILE"  = true ] && run_scan "$FULL_URL" "mobile"
done

# ── Footer ─────────────────────────────────────────────────────────────────────
cat >> "$SCORECARD" <<MDEOF
## Summary

- **Total scans:** $TOTAL_SCANS
- **Failed:** $FAILED_SCANS
- **Passed:** $((TOTAL_SCANS - FAILED_SCANS))

MDEOF

# ── Final output ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Scans run : $TOTAL_SCANS"
echo -e "  ${GREEN}Passed${NC}    : $((TOTAL_SCANS - FAILED_SCANS))"
echo -e "  ${RED}Failed${NC}    : $FAILED_SCANS"
echo -e "  Scorecard : ${CYAN}$SCORECARD${NC}"
echo -e "  Reports   : ${CYAN}$REPORT_DIR/${NC}"

if [ $FAILED_SCANS -eq 0 ]; then
  echo ""
  echo -e "  ${GREEN}${BOLD}✅ All Lighthouse scans passed thresholds.${NC}"
  exit 0
else
  echo ""
  echo -e "  ${RED}${BOLD}❌ $FAILED_SCANS scan(s) failed thresholds — see scorecard.${NC}"
  exit 1
fi
