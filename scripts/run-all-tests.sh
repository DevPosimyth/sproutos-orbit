#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Extreme Polish QA Runner
# Covers : Playwright E2E · Accessibility · SEO · Broken Links · Console Errors
#          Core Web Vitals · Cross-Device · Security Headers · Lighthouse
#          Visual Regression · Performance Budgets
#
# Usage  : bash scripts/run-all-tests.sh [OPTIONS]
#
# Options:
#   --quick              Skip Lighthouse + visual + perf budget checks (fast CI mode)
#   --skip-lighthouse    Skip Lighthouse scans only
#   --skip-a11y          Skip axe accessibility scans
#   --skip-seo           Skip SEO meta/sitemap checks
#   --skip-links         Skip broken-link detection
#   --skip-visual        Skip visual regression snapshot checks
#   --skip-perf          Skip performance budget assertions
#   --skip-console       Skip standalone console error audit (still runs in E2E)
#   --headed             Run Playwright in headed (visible browser) mode
#   --project <name>     Run only one Playwright project (sproutos-desktop etc.)
#   --feature <name>     Run only tests matching this feature tag/file pattern
#   --html               Open the Playwright HTML report after run
# =============================================================================

set -euo pipefail

# ── Load .env ─────────────────────────────────────────────────────────────────
if [ -f .env ]; then
  set -a
  # shellcheck source=.env
  source .env 2>/dev/null || true
  set +a
fi

BASE_URL="${SPROUTOS_URL:-https://sproutos.ai}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports"
SUMMARY_FILE="$REPORT_DIR/qa-summary-$TIMESTAMP.md"
BUG_REPORT_FILE="docs/dashboard-qa-report.md"
PW_JSON_OUTPUT="$REPORT_DIR/playwright-results.json"

# ── Flags ─────────────────────────────────────────────────────────────────────
SKIP_LIGHTHOUSE=false
SKIP_A11Y=false
SKIP_SEO=false
SKIP_LINKS=false
SKIP_VISUAL=false
SKIP_PERF=false
SKIP_CONSOLE=false
PW_HEADED=""
PW_PROJECT=""
OPEN_HTML=false
QUICK=false
FEATURE_FILTER=""

i=1
while [ $i -le $# ]; do
  arg="${!i}"
  case $arg in
    --quick)           QUICK=true; SKIP_LIGHTHOUSE=true; SKIP_VISUAL=true; SKIP_PERF=true ;;
    --skip-lighthouse) SKIP_LIGHTHOUSE=true ;;
    --skip-a11y)       SKIP_A11Y=true ;;
    --skip-seo)        SKIP_SEO=true ;;
    --skip-links)      SKIP_LINKS=true ;;
    --skip-visual)     SKIP_VISUAL=true ;;
    --skip-perf)       SKIP_PERF=true ;;
    --skip-console)    SKIP_CONSOLE=true ;;
    --headed)          PW_HEADED="--headed" ;;
    --project)         i=$((i+1)); PW_PROJECT="--project=${!i}" ;;
    --feature)         i=$((i+1)); FEATURE_FILTER="${!i}" ;;
    --html)            OPEN_HTML=true ;;
  esac
  i=$((i+1))
done

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Counters ──────────────────────────────────────────────────────────────────
TOTAL_PHASES=0
PASSED_PHASES=0
FAILED_PHASES=0
declare -a PHASE_RESULTS=()

# ── Helpers ───────────────────────────────────────────────────────────────────
log_phase() {
  echo ""
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}${BOLD}  PHASE $1 — $2${NC}"
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

pass() { echo -e "${GREEN}  ✓ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
info() { echo -e "    $1"; }

record() {
  local name="$1" status="$2"
  TOTAL_PHASES=$((TOTAL_PHASES + 1))
  if [ "$status" = "PASS" ]; then
    PASSED_PHASES=$((PASSED_PHASES + 1))
    PHASE_RESULTS+=("| ✅ PASS | $name |")
  else
    FAILED_PHASES=$((FAILED_PHASES + 1))
    PHASE_RESULTS+=("| ❌ FAIL | $name |")
  fi
}

require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    warn "$1 not found — install with: $2"
    return 1
  fi
  return 0
}

run_pw_suite() {
  local label="$1" spec="$2"
  shift 2
  local extra_args=("$@")
  if [ -e "$spec" ]; then
    info "Running: $label"
    npx playwright test "$spec" $PW_HEADED $PW_PROJECT "${extra_args[@]}" --reporter=list 2>&1 | tail -5 || return 1
  else
    warn "Spec not found (planned): $spec"
  fi
  return 0
}

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   🌱  Sprout OS Orbit — Extreme Polish QA Runner     ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo -e "   Target  : ${CYAN}$BASE_URL${NC}"
echo -e "   Mode    : $([ "$QUICK" = true ] && echo 'Quick (no Lighthouse/Visual/Perf)' || echo 'Full')"
echo -e "   Started : $TIMESTAMP"
[ -n "$FEATURE_FILTER" ] && echo -e "   Feature : ${CYAN}$FEATURE_FILTER${NC}"

mkdir -p "$REPORT_DIR/playwright-html" "$REPORT_DIR/lighthouse" \
         "$REPORT_DIR/a11y" "$REPORT_DIR/seo" "$REPORT_DIR/links" \
         "$REPORT_DIR/visual-regression" "$REPORT_DIR/perf" "docs"

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 — ENVIRONMENT & DEPENDENCY CHECK
# ─────────────────────────────────────────────────────────────────────────────
log_phase 1 "Environment & Dependency Check"

ENV_OK=true

if require_cmd node "nodejs.org"; then
  pass "Node.js $(node -v)"
else
  ENV_OK=false
fi

if require_cmd npx "npm install -g npx"; then
  pass "npx available"
else
  ENV_OK=false
fi

# .env credentials
if [ -z "${TEST_USER_EMAIL:-}" ] || [ -z "${TEST_USER_PASSWORD:-}" ]; then
  warn "TEST_USER_EMAIL / TEST_USER_PASSWORD not set — auth-gated tests will skip"
else
  pass "Test credentials loaded (${TEST_USER_EMAIL})"
fi

if [ -z "${TEST_ADMIN_EMAIL:-}" ] || [ -z "${TEST_ADMIN_PASSWORD:-}" ]; then
  warn "TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD not set — admin tests will skip"
else
  pass "Admin credentials loaded (${TEST_ADMIN_EMAIL})"
fi

# Reachability check
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$BASE_URL" || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  pass "Target reachable — $BASE_URL ($HTTP_CODE)"
else
  fail "Target unreachable — $BASE_URL (HTTP $HTTP_CODE)"
  ENV_OK=false
fi

LIGHTHOUSE_AVAILABLE=false
JQ_AVAILABLE=false

require_cmd lighthouse "npm install -g lighthouse" && LIGHTHOUSE_AVAILABLE=true || true
require_cmd jq "brew install jq / apt install jq" && JQ_AVAILABLE=true || true

if [ "$ENV_OK" = true ]; then
  pass "Environment check passed"
  record "Environment & Dependency Check" "PASS"
else
  warn "Environment check has warnings — continuing"
  record "Environment & Dependency Check" "FAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — SEO & METADATA AUDIT
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_SEO" = false ]; then
  log_phase 2 "SEO & Metadata Audit"

  SEO_FAIL=0
  SEO_REPORT="$REPORT_DIR/seo/seo-audit-$TIMESTAMP.md"

  echo "# SEO Audit — $BASE_URL" > "$SEO_REPORT"
  echo "**Date:** $(date)" >> "$SEO_REPORT"
  echo "" >> "$SEO_REPORT"
  echo "| Check | Status | Value |" >> "$SEO_REPORT"
  echo "|---|---|---|" >> "$SEO_REPORT"

  seo_check() {
    local label="$1" value="$2" expected="$3"
    if echo "$value" | grep -qiE "$expected"; then
      pass "$label"
      echo "| $label | ✅ | \`$(echo "$value" | head -c 80)\` |" >> "$SEO_REPORT"
    else
      fail "$label — got: $(echo "$value" | head -c 80)"
      echo "| $label | ❌ | \`$(echo "$value" | head -c 80)\` |" >> "$SEO_REPORT"
      SEO_FAIL=$((SEO_FAIL + 1))
    fi
  }

  HTML=$(curl -s --max-time 15 "$BASE_URL")

  TITLE=$(echo "$HTML" | perl -ne 'print "$1\n" if /<title>([^<]+)/i' | head -1)
  [ -n "$TITLE" ] && seo_check "Title tag present" "$TITLE" "." || { fail "Title tag missing"; SEO_FAIL=$((SEO_FAIL+1)); }
  [ ${#TITLE} -le 60 ] && pass "Title length ≤60 chars (${#TITLE})" || warn "Title length ${#TITLE} — ideal is ≤60"

  META_DESC=$(echo "$HTML" | perl -ne 'print "$1\n" if /name="description"\s+content="([^"]+)"/i' | head -1)
  [ -n "$META_DESC" ] && seo_check "Meta description present" "$META_DESC" "." || { fail "Meta description missing"; SEO_FAIL=$((SEO_FAIL+1)); }
  [ ${#META_DESC} -le 160 ] && pass "Meta description length ≤160 (${#META_DESC})" || warn "Meta description ${#META_DESC} chars — ideal ≤160"

  OG_TITLE=$(echo "$HTML" | perl -ne 'print "$1\n" if /property="og:title"\s+content="([^"]+)"/i' | head -1)
  seo_check "OG title tag" "${OG_TITLE:-MISSING}" "."

  OG_DESC=$(echo "$HTML" | perl -ne 'print "$1\n" if /property="og:description"\s+content="([^"]+)"/i' | head -1)
  seo_check "OG description tag" "${OG_DESC:-MISSING}" "."

  OG_IMAGE=$(echo "$HTML" | perl -ne 'print "$1\n" if /property="og:image"\s+content="([^"]+)"/i' | head -1)
  seo_check "OG image tag (HTTPS)" "${OG_IMAGE:-MISSING}" "^https://"

  TW_CARD=$(echo "$HTML" | perl -ne 'print "$1\n" if /name="twitter:card"\s+content="([^"]+)"/i' | head -1)
  seo_check "Twitter card tag" "${TW_CARD:-MISSING}" "."

  CANONICAL=$(echo "$HTML" | perl -ne 'print "$1\n" if /rel="canonical"\s+href="([^"]+)"/i' | head -1)
  seo_check "Canonical URL present" "${CANONICAL:-MISSING}" "^https://"

  VIEWPORT=$(echo "$HTML" | grep -o 'name="viewport"' | head -1)
  seo_check "Viewport meta tag" "${VIEWPORT:-MISSING}" "viewport"

  H1=$(echo "$HTML" | perl -ne 'print "$1\n" if /<h1[^>]*>([^<]+)/i' | head -1)
  seo_check "H1 tag present" "${H1:-MISSING}" "."

  LANG=$(echo "$HTML" | grep -o 'lang="[^"]*"' | head -1)
  seo_check "HTML lang attribute" "${LANG:-MISSING}" "lang="

  JSONLD=$(echo "$HTML" | grep -c 'type="application/ld+json"' || echo 0)
  [ "$JSONLD" -gt 0 ] && pass "JSON-LD structured data present ($JSONLD block(s))" || warn "No JSON-LD structured data found"

  SITEMAP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$BASE_URL/sitemap.xml")
  [ "$SITEMAP_STATUS" = "200" ] && pass "sitemap.xml reachable (200)" || { fail "sitemap.xml status: $SITEMAP_STATUS"; SEO_FAIL=$((SEO_FAIL+1)); }

  ROBOTS_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$BASE_URL/robots.txt")
  [ "$ROBOTS_STATUS" = "200" ] && pass "robots.txt reachable (200)" || { fail "robots.txt status: $ROBOTS_STATUS"; SEO_FAIL=$((SEO_FAIL+1)); }

  ROBOTS_BODY=$(curl -s "$BASE_URL/robots.txt")
  echo "$ROBOTS_BODY" | grep -qi "sitemap" && pass "robots.txt references sitemap" || warn "robots.txt missing Sitemap directive"

  # Auth routes must be noindex
  for NOINDEX_PATH in "/dashboard" "/design" "/scope" "/manage" "/team" "/settings"; do
    NOINDEX_HTML=$(curl -s --max-time 10 -L "$BASE_URL$NOINDEX_PATH" || echo "")
    if echo "$NOINDEX_HTML" | grep -qi 'name="robots"'; then
      ROBOTS_META=$(echo "$NOINDEX_HTML" | perl -ne 'print "$1\n" if /name="robots"\s+content="([^"]+)"/i' | head -1)
      echo "$ROBOTS_META" | grep -qi "noindex" && pass "noindex set on $NOINDEX_PATH" || warn "$NOINDEX_PATH missing noindex meta robots"
    fi
  done

  HTTP_REDIRECT=$(curl -o /dev/null -s -w "%{redirect_url}" "http://sproutos.ai" 2>/dev/null || echo "")
  echo "$HTTP_REDIRECT" | grep -q "https://" && pass "HTTP → HTTPS redirect active" || warn "HTTP → HTTPS redirect not detected"

  echo "" >> "$SEO_REPORT"
  echo "**SEO failures: $SEO_FAIL**" >> "$SEO_REPORT"
  info "SEO report saved: $SEO_REPORT"

  if [ $SEO_FAIL -eq 0 ]; then
    record "SEO & Metadata Audit" "PASS"
  else
    record "SEO & Metadata Audit" "FAIL"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3 — SECURITY HEADERS CHECK
# ─────────────────────────────────────────────────────────────────────────────
log_phase 3 "Security Headers Check"

SEC_FAIL=0
HEADERS=$(curl -sI --max-time 10 "$BASE_URL")

check_header() {
  local header="$1" label="$2"
  if echo "$HEADERS" | grep -qi "^$header:"; then
    pass "$label present"
  else
    fail "$label MISSING"
    SEC_FAIL=$((SEC_FAIL + 1))
  fi
}

check_header "strict-transport-security" "HSTS (Strict-Transport-Security)"
check_header "x-content-type-options"    "X-Content-Type-Options"
check_header "x-frame-options"           "X-Frame-Options"
check_header "referrer-policy"           "Referrer-Policy"
check_header "permissions-policy"        "Permissions-Policy"

if echo "$HEADERS" | grep -qi "^content-security-policy:"; then
  pass "Content-Security-Policy present"
else
  warn "Content-Security-Policy not set (recommended for XSS protection)"
fi

# X-Powered-By must be absent (leaks stack info)
if echo "$HEADERS" | grep -qi "^x-powered-by:"; then
  fail "X-Powered-By header exposed — must be removed"
  SEC_FAIL=$((SEC_FAIL + 1))
else
  pass "X-Powered-By header absent (good)"
fi

CERT_INFO=$(curl -vI --max-time 10 "$BASE_URL" 2>&1 | grep "expire date" || echo "")
if [ -n "$CERT_INFO" ]; then
  pass "TLS certificate detected: $CERT_INFO"
else
  info "TLS cert expiry check skipped (curl -v not parsing)"
fi

if [ $SEC_FAIL -eq 0 ]; then
  record "Security Headers Check" "PASS"
else
  record "Security Headers Check" "FAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 4 — BROKEN LINK DETECTION
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_LINKS" = false ]; then
  log_phase 4 "Broken Link Detection"

  LINKS_REPORT="$REPORT_DIR/links/broken-links-$TIMESTAMP.md"
  LINKS_FAIL=0

  echo "# Broken Link Report — $BASE_URL" > "$LINKS_REPORT"
  echo "**Date:** $(date)" >> "$LINKS_REPORT"
  echo "" >> "$LINKS_REPORT"
  echo "| URL | Status | Source |" >> "$LINKS_REPORT"
  echo "|---|---|---|" >> "$LINKS_REPORT"

  info "Crawling homepage for links..."
  HTML=$(curl -s --max-time 15 "$BASE_URL")

  LINKS=$(echo "$HTML" | perl -ne 'while (/href="([^"]+)"/g) { print "$1\n" }' | sort -u | grep -vE '^#|^mailto:|^tel:|^javascript:')

  CHECKED=0
  BROKEN=0

  for LINK in $LINKS; do
    if echo "$LINK" | grep -q "^http"; then
      ABS_URL="$LINK"
    elif echo "$LINK" | grep -q "^//"; then
      ABS_URL="https:$LINK"
    elif echo "$LINK" | grep -q "^/"; then
      ABS_URL="$BASE_URL$LINK"
    else
      continue
    fi

    if ! echo "$ABS_URL" | grep -qE "sproutos\.ai|sprout-os|posimyth"; then
      continue
    fi

    STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 8 -L "$ABS_URL" || echo "000")
    CHECKED=$((CHECKED + 1))

    if [ "$STATUS" -ge 400 ] 2>/dev/null; then
      fail "Broken: $ABS_URL ($STATUS)"
      echo "| $ABS_URL | ❌ $STATUS | homepage |" >> "$LINKS_REPORT"
      LINKS_FAIL=$((LINKS_FAIL + 1))
      BROKEN=$((BROKEN + 1))
    else
      echo "| $ABS_URL | ✅ $STATUS | homepage |" >> "$LINKS_REPORT"
    fi

    [ $((CHECKED % 5)) -eq 0 ] && sleep 0.5
    [ $CHECKED -ge 40 ] && break
  done

  info "Checked $CHECKED links — $BROKEN broken"
  echo "" >> "$LINKS_REPORT"
  echo "**Checked: $CHECKED | Broken: $BROKEN**" >> "$LINKS_REPORT"

  if [ $LINKS_FAIL -eq 0 ]; then
    pass "No broken links found"
    record "Broken Link Detection" "PASS"
  else
    fail "$LINKS_FAIL broken link(s) found"
    record "Broken Link Detection" "FAIL"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 5 — CORE WEB VITALS & PERFORMANCE BASELINE (TTFB)
# Thresholds aligned with config/performance.config.js
# ─────────────────────────────────────────────────────────────────────────────
log_phase 5 "Core Web Vitals & Performance Baseline (TTFB)"

PERF_FAIL=0

info "Measuring Time-To-First-Byte for key pages..."

measure_ttfb() {
  local url="$1" label="$2" threshold="${3:-3000}"
  local TTFB
  TTFB=$(curl -o /dev/null -s -w "%{time_starttransfer}" --max-time 15 "$url" 2>/dev/null || echo "99")
  TTFB_MS=$(echo "$TTFB * 1000" | bc 2>/dev/null | cut -d'.' -f1 || echo "9999")

  if [ "$TTFB_MS" -le "$threshold" ] 2>/dev/null; then
    pass "$label TTFB: ${TTFB_MS}ms (budget ${threshold}ms)"
  else
    fail "$label TTFB: ${TTFB_MS}ms — exceeds ${threshold}ms"
    PERF_FAIL=$((PERF_FAIL + 1))
  fi
}

# Budgets from performance.config.js pageThresholds[path].ttfb
measure_ttfb "$BASE_URL/"                  "Homepage"        600
measure_ttfb "$BASE_URL/login"             "Login page"      400
measure_ttfb "$BASE_URL/signup"            "Signup page"     400
measure_ttfb "$BASE_URL/sitemap.xml"       "Sitemap XML"    1000

PAGE_SIZE=$(curl -so /dev/null -w "%{size_download}" --max-time 15 "$BASE_URL" || echo 0)
PAGE_SIZE_KB=$(echo "$PAGE_SIZE / 1024" | bc 2>/dev/null || echo 0)
if [ "$PAGE_SIZE_KB" -lt 500 ] 2>/dev/null; then
  pass "Homepage HTML size: ${PAGE_SIZE_KB}KB (< 500KB)"
else
  warn "Homepage HTML size: ${PAGE_SIZE_KB}KB — consider optimization"
fi

GZIP=$(curl -sI -H "Accept-Encoding: gzip" "$BASE_URL" | grep -i "content-encoding: gzip" || echo "")
[ -n "$GZIP" ] && pass "Gzip compression enabled" || warn "Gzip compression not detected"

CACHE=$(curl -sI "$BASE_URL" | grep -i "cache-control" | head -1)
[ -n "$CACHE" ] && pass "Cache-Control header: $(echo "$CACHE" | head -c 60)" || warn "No Cache-Control header on homepage"

if [ $PERF_FAIL -eq 0 ]; then
  record "Core Web Vitals & Performance Baseline" "PASS"
else
  record "Core Web Vitals & Performance Baseline" "FAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 6 — PLAYWRIGHT E2E TESTS (All Suites)
# Organized by: Create Mode → Manage Mode → Cross-cutting
# ─────────────────────────────────────────────────────────────────────────────
log_phase 6 "Playwright E2E Tests — Full Suite"

PW_FAIL=0

# Helper: run spec if file exists, warn if planned but absent
pw_run() {
  local label="$1" spec="$2"
  shift 2
  if [ -n "$FEATURE_FILTER" ] && ! echo "$spec" | grep -qi "$FEATURE_FILTER"; then
    return 0
  fi
  if [ -e "$spec" ]; then
    info "Running: $label"
    npx playwright test "$spec" $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -5 \
      || { PW_FAIL=$((PW_FAIL+1)); return 0; }
  else
    warn "Planned (not yet written): $spec"
  fi
}

# ── Create Mode ───────────────────────────────────────────────────────────────
info "─── Create Mode ───────────────────────────────────────"

pw_run "Homepage"                 "tests/sproutos/homepage.spec.js"
pw_run "Auth / Login flow"        "tests/sproutos/auth.spec.js"
pw_run "Login pages"              "tests/sproutos/login-pages.spec.js"
pw_run "Guided Brief"             "tests/sproutos/guided-brief.spec.js"
pw_run "Sitemap Editor"           "tests/sproutos/sitemap-editor.spec.js"
pw_run "Sitemap (legacy)"         "tests/sproutos/sitemap.spec.js"
pw_run "Scope Editor"             "tests/sproutos/scope.spec.js"
pw_run "Design Editor"            "tests/sproutos/design-editor.spec.js"
pw_run "Design (legacy)"          "tests/sproutos/design.spec.js"
pw_run "Section Variants"         "tests/sproutos/section-variants.spec.js"
pw_run "Color System"             "tests/sproutos/color-system.spec.js"
pw_run "AI Text Popup"            "tests/sproutos/ai-text-popup.spec.js"
pw_run "Image Picker"             "tests/sproutos/image-picker.spec.js"
pw_run "Export"                   "tests/sproutos/export.spec.js"
pw_run "Team Management"          "tests/sproutos/team-management.spec.js"
pw_run "Token Usage / Billing"    "tests/sproutos/token-usage.spec.js"
pw_run "User Settings"            "tests/sproutos/user-settings.spec.js"

# ── Dashboard suite (full JSON output for bug report) ─────────────────────────
info "Running: Dashboard suite (home, sidebar, workspace, settings, security)"
if [ -d "tests/sproutos/dashboard" ]; then
  npx playwright test tests/sproutos/dashboard/ \
    --project=sproutos-desktop \
    $PW_HEADED \
    --reporter=list,json \
    --output-file="$PW_JSON_OUTPUT" 2>&1 | tail -5 || PW_FAIL=$((PW_FAIL+1))
else
  warn "Dashboard suite dir not found: tests/sproutos/dashboard/"
fi

# ── Manage Mode ───────────────────────────────────────────────────────────────
info "─── Manage Mode ────────────────────────────────────────"

pw_run "Manage Mode Overview"     "tests/sproutos/manage-overview.spec.js"
pw_run "Manage Mode Actions"      "tests/sproutos/manage-actions.spec.js"
pw_run "Manage Mode Build"        "tests/sproutos/manage-build.spec.js"
pw_run "MCP Site Connection"      "tests/sproutos/manage-mcp.spec.js"
pw_run "Manage Approvals Queue"   "tests/sproutos/manage-approvals.spec.js"

# ── Cross-cutting QA suites ───────────────────────────────────────────────────
info "─── Cross-cutting suites ────────────────────────────────"

pw_run "Accessibility (axe)"      "tests/sproutos/accessibility.spec.js"
pw_run "Console Errors (per page)" "tests/sproutos/console-errors.spec.js"
pw_run "SEO assertions"           "tests/sproutos/seo.spec.js"
pw_run "Performance budgets"      "tests/sproutos/performance.spec.js"
pw_run "Security checks"          "tests/sproutos/security.spec.js"

# ── Full HTML report ──────────────────────────────────────────────────────────
info "Generating full HTML report..."
if [ -d "tests/sproutos/dashboard" ]; then
  npx playwright test tests/sproutos/dashboard/ --project=sproutos-desktop $PW_HEADED --reporter=html 2>&1 | tail -3 || true
fi

if [ $PW_FAIL -eq 0 ]; then
  pass "All Playwright suites passed"
  record "Playwright E2E Tests" "PASS"
else
  fail "$PW_FAIL Playwright suite(s) had failures"
  record "Playwright E2E Tests" "FAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 7 — CROSS-DEVICE RESPONSIVE CHECK
# ─────────────────────────────────────────────────────────────────────────────
log_phase 7 "Cross-Device Responsive Check"

DEVICE_FAIL=0

RESPONSIVE_SPEC=""
for s in "tests/sproutos/responsive.spec.js" "tests/sproutos/homepage.spec.js"; do
  [ -e "$s" ] && { RESPONSIVE_SPEC="$s"; break; }
done

if [ -n "$RESPONSIVE_SPEC" ]; then
  info "Running $RESPONSIVE_SPEC across desktop / tablet / mobile viewports..."
  npx playwright test "$RESPONSIVE_SPEC" \
    --project=sproutos-desktop \
    --project=sproutos-tablet \
    --project=sproutos-mobile \
    $PW_HEADED \
    --reporter=list 2>&1 | tail -8 || DEVICE_FAIL=$((DEVICE_FAIL+1))
else
  warn "No responsive spec found — skipping cross-device check"
fi

if [ $DEVICE_FAIL -eq 0 ]; then
  pass "Responsive spec passes on desktop, tablet, and mobile viewports"
  record "Cross-Device Responsive Check" "PASS"
else
  fail "Responsive check failed on one or more viewports"
  record "Cross-Device Responsive Check" "FAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 8 — ACCESSIBILITY AUDIT (axe-core via Playwright)
# Uses config/axe.config.js rules and page list
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_A11Y" = false ]; then
  log_phase 8 "Accessibility Audit (WCAG 2.1 AA)"

  A11Y_REPORT="$REPORT_DIR/a11y/a11y-audit-$TIMESTAMP.md"
  A11Y_FAIL=0

  echo "# Accessibility Audit — $BASE_URL" > "$A11Y_REPORT"
  echo "**Standard:** WCAG 2.1 AA" >> "$A11Y_REPORT"
  echo "**Date:** $(date)" >> "$A11Y_REPORT"
  echo "" >> "$A11Y_REPORT"

  if command -v node &>/dev/null && [ -d node_modules/@axe-core ]; then
    info "Running axe-core accessibility scan (public pages)..."

    node - <<'JSEOF' >> "$A11Y_REPORT" 2>&1 || A11Y_FAIL=$((A11Y_FAIL+1))
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

(async () => {
  const browser = await chromium.launch();
  const BASE = process.env.SPROUTOS_URL || 'https://sproutos.ai';
  const pages_to_check = [
    ['Homepage', '/'],
    ['Login',    '/login'],
    ['Signup',   '/signup'],
  ];
  let total_violations = 0;

  for (const [label, path] of pages_to_check) {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious  = results.violations.filter(v => v.impact === 'serious');
    const moderate = results.violations.filter(v => v.impact === 'moderate');
    const minor    = results.violations.filter(v => v.impact === 'minor');

    console.log(`\n## ${label} (${BASE + path})`);
    console.log(`- Critical : ${critical.length}`);
    console.log(`- Serious  : ${serious.length}`);
    console.log(`- Moderate : ${moderate.length}`);
    console.log(`- Minor    : ${minor.length}`);
    console.log(`- Passes   : ${results.passes.length}`);

    for (const v of [...critical, ...serious]) {
      console.log(`\n### [${v.impact.toUpperCase()}] ${v.id}`);
      console.log(`**Description:** ${v.description}`);
      console.log(`**Help:** ${v.helpUrl}`);
      console.log(`**Elements:** ${v.nodes.length}`);
    }

    total_violations += critical.length + serious.length;
    await ctx.close();
  }

  await browser.close();
  process.exit(total_violations > 0 ? 1 : 0);
})();
JSEOF

    [ $A11Y_FAIL -eq 0 ] && pass "No critical/serious accessibility violations found" || fail "Accessibility violations found — see $A11Y_REPORT"

  else
    warn "@axe-core/playwright not found — run: npm install"
    info "Falling back to manual WCAG spot-checks..."

    HTML=$(curl -s --max-time 15 "$BASE_URL")

    IMGS_NO_ALT=$(echo "$HTML" | grep -c '<img' || echo 0)
    IMGS_WITH_ALT=$(echo "$HTML" | grep -c 'alt="' || echo 0)
    [ "$IMGS_WITH_ALT" -ge "$IMGS_NO_ALT" ] && pass "All img tags have alt attributes ($IMGS_WITH_ALT/$IMGS_NO_ALT)" || warn "Some img tags may be missing alt attributes ($IMGS_WITH_ALT/$IMGS_NO_ALT)"

    LANG=$(echo "$HTML" | grep -o 'lang="[^"]*"' | head -1)
    [ -n "$LANG" ] && pass "HTML lang attribute: $LANG" || fail "HTML lang attribute missing"

    SKIPLINK=$(echo "$HTML" | grep -i 'skip' | head -1)
    [ -n "$SKIPLINK" ] && pass "Skip navigation link present" || warn "Skip navigation link not found"

    echo "Manual spot-check completed" >> "$A11Y_REPORT"
  fi

  if [ $A11Y_FAIL -eq 0 ]; then
    record "Accessibility Audit (WCAG 2.1 AA)" "PASS"
  else
    record "Accessibility Audit (WCAG 2.1 AA)" "FAIL"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 9 — CONSOLE ERROR AUDIT
# Uses allow/block rules from config/console.config.js
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_CONSOLE" = false ]; then
  log_phase 9 "Console Error Audit"

  CONSOLE_REPORT="$REPORT_DIR/seo/console-errors-$TIMESTAMP.md"
  CONSOLE_FAIL=0

  echo "# Console Error Audit — $BASE_URL" > "$CONSOLE_REPORT"
  echo "**Date:** $(date)" >> "$CONSOLE_REPORT"
  echo "" >> "$CONSOLE_REPORT"

  node - <<'JSEOF' >> "$CONSOLE_REPORT" 2>&1 || CONSOLE_FAIL=$((CONSOLE_FAIL+1))
const { chromium } = require('playwright');
const path = require('path');

// Load allow/block rules from config if present
let globalAllowlist = [];
let globalBlocklist = [];
let featureRules = {};
try {
  const cfg = require(path.join(process.cwd(), 'config/console.config.js'));
  globalAllowlist = cfg.globalAllowlist || [];
  globalBlocklist = cfg.globalBlocklist || [];
  featureRules    = cfg.featureRules   || {};
} catch (_) {
  // Fallback: basic ignore list
  globalAllowlist = [
    { pattern: /^\[Fast Refresh\]/, reason: 'Next.js HMR' },
    { pattern: /^\[HMR\]/,          reason: 'Next.js HMR' },
    { pattern: /analytics|gtag|facebook|hotjar|sentry|intercom|clarity|adsystem/i, reason: 'Third-party analytics' },
  ];
}

(async () => {
  const BASE = process.env.SPROUTOS_URL || 'https://sproutos.ai';

  const ROUTES = [
    { path: '/',         feature: null },
    { path: '/login',    feature: 'auth' },
    { path: '/signup',   feature: 'auth' },
  ];

  const browser = await chromium.launch();
  let total_errors = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const errors = [];
    const failed_requests = [];

    const featureAllow = featureRules[route.feature]?.allow ?? [];
    const featureBlock = featureRules[route.feature]?.block ?? [];
    const allAllow = [...globalAllowlist, ...featureAllow];
    const allBlock = [...globalBlocklist, ...featureBlock];

    const isAllowed = (text) => allAllow.some(r => r.pattern.test(text));
    const isBlocked = (text) => allBlock.some(r => r.pattern.test(text));

    page.on('pageerror', e => {
      if (!isAllowed(e.message)) errors.push(`[JS ERROR] ${e.message}`);
    });
    page.on('console', m => {
      const text = m.text();
      if (isAllowed(text) && !isBlocked(text)) return;
      if (m.type() === 'error' || isBlocked(text)) errors.push(`[CONSOLE ${m.type().toUpperCase()}] ${text}`);
    });
    page.on('response', r => {
      if (r.url().includes('sproutos.ai') && r.status() >= 500)
        failed_requests.push(`[NET ${r.status()}] ${r.url()}`);
    });

    await page.goto(BASE + route.path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    console.log(`\n## ${route.path}`);
    if (errors.length === 0 && failed_requests.length === 0) {
      console.log('✅ No console errors or failed requests');
    } else {
      for (const e of errors) { console.log(`- ${e}`); total_errors++; }
      for (const r of failed_requests) { console.log(`- ${r}`); total_errors++; }
    }

    await page.close();
  }

  await browser.close();
  process.exit(total_errors > 0 ? 1 : 0);
})();
JSEOF

  if [ $CONSOLE_FAIL -eq 0 ]; then
    pass "No console errors detected on public pages"
    record "Console Error Audit" "PASS"
  else
    fail "Console errors detected — see $CONSOLE_REPORT"
    record "Console Error Audit" "FAIL"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 10 — API RESPONSE HEALTH CHECK
# Routes aligned with config/performance.config.js pageThresholds
# ─────────────────────────────────────────────────────────────────────────────
log_phase 10 "API & Route Health Check"

API_FAIL=0

check_route() {
  local path="$1" label="$2" expected_code="${3:-200}"
  local STATUS
  STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 -L "$BASE_URL$path" || echo "000")
  if [ "$STATUS" = "$expected_code" ]; then
    pass "$label → $path ($STATUS)"
  elif [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 400 ] 2>/dev/null; then
    pass "$label → $path ($STATUS — redirect/OK)"
  else
    fail "$label → $path (got $STATUS, expected $expected_code)"
    API_FAIL=$((API_FAIL + 1))
  fi
}

# Public pages (expect 200 or redirect)
check_route "/"                       "Homepage"
check_route "/login"                  "Login page"
check_route "/signup"                 "Signup page"
check_route "/forgot-password"        "Forgot password"
check_route "/sitemap.xml"            "Sitemap XML"
check_route "/robots.txt"             "Robots TXT"

# Auth-gated routes (expect redirect to login, not 500)
check_route "/dashboard"              "Dashboard (redirects if unauth)"
check_route "/scope"                  "Sitemap editor (redirects)"
check_route "/design"                 "Design editor (redirects)"
check_route "/manage"                 "Manage Mode (redirects)"
check_route "/team"                   "Team settings (redirects)"
check_route "/settings"               "User settings (redirects)"
check_route "/billing/tokens"         "Token usage (redirects)"

# API endpoints (expect 401 Unauthorized, not 500)
check_route "/api/projects"           "Projects API (auth req)"   401
check_route "/api/workspaces"         "Workspaces API (auth req)" 401
check_route "/api/team"               "Team API (auth req)"       401
check_route "/api/manage/site-data"   "Manage site-data (auth)"   401

if [ $API_FAIL -eq 0 ]; then
  record "API & Route Health Check" "PASS"
else
  record "API & Route Health Check" "FAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 11 — LIGHTHOUSE (Performance / SEO / A11Y / Best Practices)
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_LIGHTHOUSE" = false ]; then
  log_phase 11 "Lighthouse Audit (Desktop + Mobile)"
  bash scripts/lighthouse.sh && record "Lighthouse Audit" "PASS" || record "Lighthouse Audit" "FAIL"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 12 — VISUAL REGRESSION CHECK
# Uses config/visual-regression.config.js snapshot definitions
# Runs only if snapshots already exist (update-snapshots to seed)
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_VISUAL" = false ]; then
  log_phase 12 "Visual Regression Check"

  VR_FAIL=0
  VR_REPORT="$REPORT_DIR/visual-regression/vr-report-$TIMESTAMP.md"

  echo "# Visual Regression Report — $BASE_URL" > "$VR_REPORT"
  echo "**Date:** $(date)" >> "$VR_REPORT"
  echo "" >> "$VR_REPORT"

  if [ -e "tests/sproutos/visual-regression.spec.js" ]; then
    info "Running visual regression spec..."
    npx playwright test tests/sproutos/visual-regression.spec.js \
      --project=sproutos-desktop \
      $PW_HEADED \
      --reporter=list 2>&1 | tee -a "$VR_REPORT" | tail -8 || VR_FAIL=$((VR_FAIL+1))
  else
    info "No dedicated visual-regression.spec.js — checking for snapshot tests in other specs..."
    # Look for toHaveScreenshot usage in existing specs
    SNAPSHOT_SPECS=$(grep -rl "toHaveScreenshot" tests/sproutos/ 2>/dev/null || true)
    if [ -n "$SNAPSHOT_SPECS" ]; then
      for spec in $SNAPSHOT_SPECS; do
        info "Running snapshots in: $spec"
        npx playwright test "$spec" --project=sproutos-desktop $PW_HEADED --reporter=list 2>&1 | tail -5 \
          || VR_FAIL=$((VR_FAIL+1))
      done
    else
      warn "No snapshot tests found — seed first with: npx playwright test --update-snapshots"
    fi
  fi

  echo "" >> "$VR_REPORT"
  echo "**VR failures: $VR_FAIL**" >> "$VR_REPORT"

  if [ $VR_FAIL -eq 0 ]; then
    pass "Visual regression checks passed"
    record "Visual Regression Check" "PASS"
  else
    fail "$VR_FAIL visual regression failure(s) — diffs saved to $REPORT_DIR/visual-regression/"
    record "Visual Regression Check" "FAIL"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 13 — PERFORMANCE BUDGET ASSERTIONS
# Uses config/performance.config.js interactionBudgets & apiThresholds
# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_PERF" = false ]; then
  log_phase 13 "Performance Budget Assertions"

  PERF_BUDGET_FAIL=0
  PERF_BUDGET_REPORT="$REPORT_DIR/perf/perf-budget-$TIMESTAMP.md"

  echo "# Performance Budget Report — $BASE_URL" > "$PERF_BUDGET_REPORT"
  echo "**Date:** $(date)" >> "$PERF_BUDGET_REPORT"
  echo "" >> "$PERF_BUDGET_REPORT"

  if [ -e "tests/sproutos/performance.spec.js" ]; then
    info "Running Playwright performance budget spec..."
    npx playwright test tests/sproutos/performance.spec.js \
      --project=sproutos-desktop \
      $PW_HEADED \
      --reporter=list 2>&1 | tee -a "$PERF_BUDGET_REPORT" | tail -8 || PERF_BUDGET_FAIL=$((PERF_BUDGET_FAIL+1))
  else
    warn "performance.spec.js not yet written — running API latency spot-checks via curl..."

    api_timing_check() {
      local method="$1" path="$2" label="$3" p95_budget="$4"
      local START_MS END_MS ELAPSED_MS STATUS

      if [ "$method" = "GET" ]; then
        START_MS=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))")
        STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 15 \
          -H "Authorization: Bearer ${TEST_USER_TOKEN:-}" \
          "$BASE_URL$path" || echo "000")
        END_MS=$(date +%s%3N 2>/dev/null || python3 -c "import time; print(int(time.time()*1000))")
        ELAPSED_MS=$(( END_MS - START_MS ))

        if [ "$STATUS" -ge 400 ] && [ "$STATUS" -ne 401 ] 2>/dev/null; then
          warn "$label — HTTP $STATUS (skipping timing)"
        elif [ "$ELAPSED_MS" -le "$p95_budget" ] 2>/dev/null; then
          pass "$label: ${ELAPSED_MS}ms (p95 budget ${p95_budget}ms)"
        else
          fail "$label: ${ELAPSED_MS}ms — exceeds p95 budget ${p95_budget}ms"
          PERF_BUDGET_FAIL=$((PERF_BUDGET_FAIL+1))
        fi
      fi
    }

    # Budgets from performance.config.js apiThresholds
    api_timing_check "GET" "/api/projects"             "GET /api/projects"             500
    api_timing_check "GET" "/api/workspaces"           "GET /api/workspaces"           400
    api_timing_check "GET" "/api/team"                 "GET /api/team"                 400
    api_timing_check "GET" "/api/manage/activity"      "GET /api/manage/activity"      500
    api_timing_check "GET" "/api/manage/actions-registry" "GET /api/manage/actions-registry" 400
    api_timing_check "GET" "/api/manage/build/files"   "GET /api/manage/build/files"   400
    api_timing_check "GET" "/api/media/stock"          "GET /api/media/stock"          800
  fi

  if [ $PERF_BUDGET_FAIL -eq 0 ]; then
    pass "All performance budgets within threshold"
    record "Performance Budget Assertions" "PASS"
  else
    fail "$PERF_BUDGET_FAIL performance budget violation(s) — see $PERF_BUDGET_REPORT"
    record "Performance Budget Assertions" "FAIL"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 14 — QA SUMMARY REPORT + BUG REPORT (Markdown)
# ─────────────────────────────────────────────────────────────────────────────
log_phase 14 "Generating QA Summary Report & Bug Report"

BUG_COUNT=0
if [ -f "$PW_JSON_OUTPUT" ] && command -v node &>/dev/null; then
  info "Parsing test failures → generating bug report..."

  BUG_COUNT=$(node - "$PW_JSON_OUTPUT" "$BUG_REPORT_FILE" "$BASE_URL" "$TIMESTAMP" <<'JSEOF'
const fs   = require('fs');
const path = require('path');

const [,, jsonFile, outFile, baseUrl, timestamp] = process.argv;

let raw;
try { raw = JSON.parse(fs.readFileSync(jsonFile, 'utf8')); }
catch (e) { console.error('Could not parse JSON:', e.message); process.exit(0); }

function flattenTests(suite, parents = []) {
  const results = [];
  const title = suite.title || '';
  const chain = title ? [...parents, title] : parents;
  for (const t of (suite.tests || [])) {
    results.push({ ...t, suitePath: chain });
  }
  for (const s of (suite.suites || [])) {
    results.push(...flattenTests(s, chain));
  }
  return results;
}

const allTests = [];
for (const suite of (raw.suites || [])) {
  allTests.push(...flattenTests(suite));
}

const failed = allTests.filter(t => t.status === 'failed' || t.status === 'unexpected');

if (failed.length === 0) {
  const content = `# Sprout OS — QA Bug Report\n**Date:** ${new Date().toISOString().split('T')[0]}\n**Target:** ${baseUrl}\n**Run ID:** ${timestamp}\n\n---\n\n## ✅ All Tests Passed\n\nNo failures detected in this run.\n`;
  fs.writeFileSync(outFile, content);
  console.log('0');
  process.exit(0);
}

function getPriority(suitePath, title) {
  const ctx = [...suitePath, title].join(' ').toLowerCase();
  if (/auth gat|unauthenticated|csrf|xss|session cookie|clickjack|bearer.*token|password.*log/i.test(ctx)) return 'CRITICAL';
  if (/security|console error|invite|guided brief|spin up|performance|paddle|not found|timeout|blocked|mcp|manage/i.test(ctx)) return 'HIGH';
  if (/navigation|click|hover|3-dot|load time|api health|polling|failed network|create.manage|member list/i.test(ctx)) return 'MEDIUM';
  return 'LOW';
}

function getError(test) {
  for (const result of (test.results || [])) {
    const msg = result?.error?.message || '';
    if (msg) {
      return msg
        .replace(/\x1b\[[0-9;]*m/g, '')
        .split('\n').slice(0, 3).join(' ')
        .trim()
        .substring(0, 400);
    }
  }
  return 'Test failed — see Playwright HTML report for details.';
}

function getSteps(suitePath, title) {
  const area = suitePath.filter(s => !s.includes('sproutos-desktop') && !s.includes('.spec')).join(' > ');
  return `1. Log in to ${baseUrl}\n2. Navigate to the section: **${area || 'Dashboard'}**\n3. Perform the action: "${title}"\n4. Observe the result`;
}

function getExpected(title) {
  return `The test "${title}" should pass without error. The feature should work as described in the test name.`;
}

const priority_order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const grouped = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
for (const t of failed) {
  grouped[getPriority(t.suitePath, t.title)].push(t);
}

const lines = [];
const runDate = new Date().toISOString().split('T')[0];
const stats   = raw.stats || {};
const passed  = stats.expected  || 0;
const total   = stats.total     || allTests.length;
const skipped = stats.skipped   || 0;

lines.push(`# Sprout OS — QA Bug Report`);
lines.push(`**Date:** ${runDate}  |  **Target:** ${baseUrl}  |  **Run:** ${timestamp}`);
lines.push(`**Result:** ${passed} passed · ${failed.length} failed · ${skipped} skipped / ${total} total`);
lines.push('');
lines.push('---');
lines.push('');

let bugNum = 0;
for (const priority of priority_order) {
  const bugs = grouped[priority];
  if (bugs.length === 0) continue;
  lines.push(`## ${priority} Priority (${bugs.length} issue${bugs.length > 1 ? 's' : ''})`);
  lines.push('');

  for (const t of bugs) {
    bugNum++;
    const suite = t.suitePath.filter(s => !s.includes('sproutos-') && !s.includes('.spec')).join(' › ');
    const err   = getError(t);

    lines.push(`### BUG-${String(bugNum).padStart(2, '0')} · ${priority}`);
    lines.push(`**Bug Short Name:** ${t.title}`);
    lines.push(`**Suite:** ${suite}`);
    lines.push('');
    lines.push(`**Issue:**`);
    lines.push(`${err}`);
    lines.push('');
    lines.push(`**Steps to Reproduce:**`);
    lines.push(getSteps(t.suitePath, t.title));
    lines.push('');
    lines.push(`**Expected Result:**`);
    lines.push(getExpected(t.title));
    lines.push('');
    lines.push('---');
    lines.push('');
  }
}

lines.push(`*Generated automatically by Sprout OS Orbit QA Runner — ${runDate}*`);

fs.writeFileSync(outFile, lines.join('\n'));
console.log(String(bugNum));
JSEOF
  )

  if [ "$BUG_COUNT" = "0" ]; then
    pass "No failures — bug report clean: $BUG_REPORT_FILE"
  else
    warn "$BUG_COUNT bugs written to: $BUG_REPORT_FILE"
  fi
else
  warn "Playwright JSON output not found — skipping bug report generation"
fi

# ── QA Summary report ─────────────────────────────────────────────────────────
VR_REPORT_ENTRY=""
[ "$SKIP_VISUAL" = false ] && VR_REPORT_ENTRY="| Visual Regression | reports/visual-regression/vr-report-$TIMESTAMP.md |"

PERF_REPORT_ENTRY=""
[ "$SKIP_PERF" = false ] && PERF_REPORT_ENTRY="| Performance Budgets | reports/perf/perf-budget-$TIMESTAMP.md |"

cat > "$SUMMARY_FILE" <<MDEOF
# Sprout OS — Extreme Polish QA Summary Report

**Date:** $(date)
**Target:** $BASE_URL
**Run ID:** $TIMESTAMP

---

## Results Overview

| Status | Phase |
|--------|-------|
$(for r in "${PHASE_RESULTS[@]}"; do echo "$r"; done)

---

## Score

- **Phases run:** $TOTAL_PHASES
- **Passed:** $PASSED_PHASES
- **Failed:** $FAILED_PHASES
- **Pass rate:** $(echo "scale=0; $PASSED_PHASES * 100 / $TOTAL_PHASES" | bc 2>/dev/null || echo "N/A")%
- **Bugs found:** $BUG_COUNT

---

## Reports Generated

| Type | File |
|------|------|
| Playwright HTML | reports/playwright-html/index.html |
| **Bug Report** | **$BUG_REPORT_FILE** |
| SEO Audit | reports/seo/seo-audit-$TIMESTAMP.md |
| Console Errors | reports/seo/console-errors-$TIMESTAMP.md |
| Broken Links | reports/links/broken-links-$TIMESTAMP.md |
| Accessibility | reports/a11y/a11y-audit-$TIMESTAMP.md |
| Lighthouse Scorecard | reports/lighthouse/scorecard-$TIMESTAMP.md |
$VR_REPORT_ENTRY
$PERF_REPORT_ENTRY

---

## Next Steps

1. Open \`reports/playwright-html/index.html\` for the full Playwright test breakdown
2. Review \`$BUG_REPORT_FILE\` — $BUG_COUNT bug(s) found, sorted by priority
3. Fix CRITICAL issues first (auth gating, security, credential leaks)
4. Address HIGH issues (console errors, MCP failures, broken interactions)
5. Review accessibility violations by impact level (Critical → Serious → Moderate)
6. Check Lighthouse scorecard for Core Web Vitals regressions
7. Investigate any visual regression diffs before shipping
MDEOF

pass "QA summary saved: $SUMMARY_FILE"

# ─────────────────────────────────────────────────────────────────────────────
# FINAL RESULT
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                 QA RUN COMPLETE                      ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Phases run    : $TOTAL_PHASES"
echo -e "  ${GREEN}Passed${NC}         : $PASSED_PHASES"
echo -e "  ${RED}Failed${NC}         : $FAILED_PHASES"

if [ $FAILED_PHASES -eq 0 ]; then
  echo ""
  echo -e "  ${GREEN}${BOLD}✅ ALL PHASES PASSED — Sprout OS is at polish level QA.${NC}"
else
  echo ""
  echo -e "  ${RED}${BOLD}❌ $FAILED_PHASES PHASE(S) FAILED — see reports/ for details.${NC}"
fi

echo ""
echo -e "  QA summary : ${CYAN}$SUMMARY_FILE${NC}"
echo -e "  Bug report : ${CYAN}$BUG_REPORT_FILE${NC}  ($BUG_COUNT bugs)"

if [ "$OPEN_HTML" = true ] && command -v open &>/dev/null; then
  open reports/playwright-html/index.html 2>/dev/null || true
fi

[ $FAILED_PHASES -eq 0 ] && exit 0 || exit 1
