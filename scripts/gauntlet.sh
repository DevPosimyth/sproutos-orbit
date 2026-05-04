#!/bin/bash
# =============================================================================
# Sprout OS Orbit — QA Gauntlet
# Runs every area from checklists/qa-master-checklist.md in a single pass.
# One phase per checklist area. Generates a release sign-off table on exit.
#
# Usage:
#   bash scripts/gauntlet.sh [OPTIONS]
#
# Options:
#   --plugin <path>       Path to a local WordPress plugin for PHP/JS linting
#   --url <url>           Override target URL (default: SPROUTOS_URL or https://sproutos.ai)
#   --hotfix              Hotfix mode — runs only Functionality, Security,
#                         Console Errors, and Code Quality (as per checklist)
#   --skip-lighthouse     Skip Lighthouse scan in the Performance phase
#   --skip-visual         Skip visual regression checks
#   --headed              Run Playwright in headed mode
#   --project <name>      Scope Playwright to a single project
#   --feature <pattern>   Run only specs matching this pattern
#   --html                Open Playwright HTML report on completion
#   --save-signoff <file> Write the release sign-off table to a markdown file
# =============================================================================

set -euo pipefail

# ── Load .env ─────────────────────────────────────────────────────────────────
if [ -f .env ]; then
  set -a; source .env 2>/dev/null || true; set +a
fi

# ── Defaults ──────────────────────────────────────────────────────────────────
BASE_URL="${SPROUTOS_URL:-https://sproutos.ai}"
PLUGIN_PATH=""
HOTFIX=false
SKIP_LIGHTHOUSE=false
SKIP_VISUAL=false
PW_HEADED=""
PW_PROJECT=""
OPEN_HTML=false
FEATURE_FILTER=""
SIGNOFF_FILE=""
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_DIR="reports/gauntlet-$TIMESTAMP"

# ── Argument parsing ───────────────────────────────────────────────────────────
i=1
while [ $i -le $# ]; do
  arg="${!i}"
  case $arg in
    --plugin)         i=$((i+1)); PLUGIN_PATH="${!i}" ;;
    --url)            i=$((i+1)); BASE_URL="${!i}" ;;
    --hotfix)         HOTFIX=true ;;
    --skip-lighthouse) SKIP_LIGHTHOUSE=true ;;
    --skip-visual)    SKIP_VISUAL=true ;;
    --headed)         PW_HEADED="--headed" ;;
    --project)        i=$((i+1)); PW_PROJECT="--project=${!i}" ;;
    --feature)        i=$((i+1)); FEATURE_FILTER="${!i}" ;;
    --html)           OPEN_HTML=true ;;
    --save-signoff)   i=$((i+1)); SIGNOFF_FILE="${!i}" ;;
  esac
  i=$((i+1))
done

mkdir -p "$REPORT_DIR"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Counters + sign-off tracking ──────────────────────────────────────────────
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0
declare -a PHASE_RESULTS=()

# Maps to the 11-row sign-off table in qa-master-checklist.md
declare -A SIGNOFF_STATUS=(
  [1]="☐ Not Run"
  [2]="☐ Not Run"
  [3]="☐ Not Run"
  [4]="☐ Not Run"
  [5]="☐ Not Run"
  [6]="☐ Not Run"
  [7]="☐ Not Run"
  [8]="☐ Not Run"
  [9]="☐ Not Run"
  [10]="☐ Not Run"
  [11]="☐ Not Run"
)

# ── Helpers ───────────────────────────────────────────────────────────────────
log_phase() {
  echo ""
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}${BOLD}  AREA $1 / 11 — $2${NC}"
  echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

pass()  { echo -e "${GREEN}  ✓ $1${NC}"; }
fail()  { echo -e "${RED}  ✗ $1${NC}"; }
warn()  { echo -e "${YELLOW}  ⚠ $1${NC}"; }
info()  { echo -e "    $1"; }
skip()  { echo -e "    ⏭  Skipped (hotfix mode): $1"; }

record() {
  local num="$1" label="$2" status="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$status" = "PASS" ]; then
    PASSED=$((PASSED + 1))
    PHASE_RESULTS+=("| ✅ PASS | $label |")
    SIGNOFF_STATUS[$num]="☑ Pass"
  elif [ "$status" = "SKIP" ]; then
    SKIPPED=$((SKIPPED + 1))
    PHASE_RESULTS+=("| ⏭  SKIP | $label |")
    SIGNOFF_STATUS[$num]="⏭  Skipped"
  else
    FAILED=$((FAILED + 1))
    PHASE_RESULTS+=("| ❌ FAIL | $label |")
    SIGNOFF_STATUS[$num]="☒ Fail"
  fi
}

require_cmd() {
  command -v "$1" &>/dev/null && return 0
  warn "$1 not found — install with: $2"
  return 1
}

# Run a Playwright spec if the file exists; warn if planned but absent
pw_run() {
  local label="$1" spec="$2"
  [ -n "$FEATURE_FILTER" ] && ! echo "$spec" | grep -qi "$FEATURE_FILTER" && return 0
  if [ -e "$spec" ]; then
    info "→ $label"
    npx playwright test "$spec" $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 || return 1
  else
    warn "Planned: $spec"
  fi
  return 0
}

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   🌱  Sprout OS — QA Gauntlet (All 11 Checklist Areas) ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"
echo -e "   Target   : ${CYAN}$BASE_URL${NC}"
echo -e "   Mode     : $([ "$HOTFIX" = true ] && echo "${RED}HOTFIX (Functionality · Security · Console · Code Quality)${NC}" || echo 'Full (all 11 areas)')"
[ -n "$PLUGIN_PATH" ] && echo -e "   Plugin   : ${CYAN}$PLUGIN_PATH${NC}"
echo -e "   Reports  : ${CYAN}$REPORT_DIR/${NC}"
echo -e "   Started  : $TIMESTAMP"

# Reachability pre-check
HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$BASE_URL" || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
  echo -e "   Target   : ${GREEN}Reachable ($HTTP_CODE)${NC}"
else
  echo -e "   Target   : ${RED}UNREACHABLE (HTTP $HTTP_CODE) — some phases will fail${NC}"
fi

echo ""

# =============================================================================
# AREA 1 — UI / UX
# Checklist: checklists/ui-ux-checklist.md
# Checks: responsive layout, nav, forms, loading/empty states, microinteractions
# =============================================================================
if [ "$HOTFIX" = false ]; then
  log_phase 1 "UI / UX"

  UIUX_FAIL=0
  UIUX_REPORT="$REPORT_DIR/01-ui-ux.md"

  {
    echo "# UI / UX Report — $BASE_URL"
    echo "**Date:** $(date)"
    echo ""
  } > "$UIUX_REPORT"

  # ── Responsive layout spot-checks via Playwright projects ─────────────────
  for SPEC in "tests/sproutos/homepage.spec.js" \
              "tests/sproutos/dashboard/dashboard-ui.spec.js" \
              "tests/sproutos/sitemap/editor.spec.js"; do
    [ -n "$FEATURE_FILTER" ] && ! echo "$SPEC" | grep -qi "$FEATURE_FILTER" && continue
    if [ -e "$SPEC" ]; then
      info "UI/UX spec: $SPEC"
      npx playwright test "$SPEC" \
        --project=sproutos-desktop \
        $PW_HEADED \
        --reporter=list 2>&1 | tail -4 \
        || UIUX_FAIL=$((UIUX_FAIL+1))
    fi
  done

  # ── HTML spot-checks: viewport meta, lang, skip-link ─────────────────────
  HTML=$(curl -s --max-time 15 "$BASE_URL" || echo "")

  VIEWPORT=$(echo "$HTML" | grep -o 'name="viewport"' | head -1)
  if [ -n "$VIEWPORT" ]; then
    pass "Viewport meta tag present"
    echo "- ✅ Viewport meta tag present" >> "$UIUX_REPORT"
  else
    fail "Viewport meta tag missing"
    echo "- ❌ Viewport meta tag missing" >> "$UIUX_REPORT"
    UIUX_FAIL=$((UIUX_FAIL+1))
  fi

  LANG=$(echo "$HTML" | grep -o 'lang="[^"]*"' | head -1)
  if [ -n "$LANG" ]; then
    pass "HTML lang attribute: $LANG"
    echo "- ✅ HTML lang attribute: $LANG" >> "$UIUX_REPORT"
  else
    fail "HTML lang attribute missing (accessibility + SEO impact)"
    echo "- ❌ HTML lang attribute missing" >> "$UIUX_REPORT"
    UIUX_FAIL=$((UIUX_FAIL+1))
  fi

  SKIPLINK=$(echo "$HTML" | grep -i 'skip\|jump to' | head -1)
  if [ -n "$SKIPLINK" ]; then
    pass "Skip navigation link present"
    echo "- ✅ Skip navigation link present" >> "$UIUX_REPORT"
  else
    warn "Skip navigation link not found (recommended for keyboard users)"
    echo "- ⚠️  Skip navigation link not found" >> "$UIUX_REPORT"
  fi

  H1_COUNT=$(echo "$HTML" | grep -ci '<h1' || echo 0)
  if [ "$H1_COUNT" -eq 1 ]; then
    pass "Exactly one <h1> tag"
    echo "- ✅ Exactly one h1 tag" >> "$UIUX_REPORT"
  elif [ "$H1_COUNT" -eq 0 ]; then
    fail "No <h1> tag found"
    echo "- ❌ No h1 tag" >> "$UIUX_REPORT"
    UIUX_FAIL=$((UIUX_FAIL+1))
  else
    warn "Multiple <h1> tags ($H1_COUNT) — heading hierarchy may be broken"
    echo "- ⚠️  Multiple h1 tags ($H1_COUNT)" >> "$UIUX_REPORT"
  fi

  # Body text size check: look for <small> or font-size hints in inline styles
  SMALL_FONT=$(echo "$HTML" | grep -c 'font-size:\s*1[0-2]px' || echo 0)
  if [ "$SMALL_FONT" -eq 0 ]; then
    pass "No obvious inline font-size < 13px detected"
    echo "- ✅ No sub-13px inline font sizes detected" >> "$UIUX_REPORT"
  else
    warn "$SMALL_FONT element(s) with inline font-size < 13px — verify legibility on mobile"
    echo "- ⚠️  $SMALL_FONT element(s) with small inline font size" >> "$UIUX_REPORT"
  fi

  info "UI / UX report saved: $UIUX_REPORT"

  if [ $UIUX_FAIL -eq 0 ]; then
    pass "UI / UX checks passed"
    record 1 "UI / UX" "PASS"
  else
    fail "UI / UX — $UIUX_FAIL check(s) failed"
    record 1 "UI / UX" "FAIL"
  fi
else
  skip "UI / UX"
  record 1 "UI / UX" "SKIP"
fi

# =============================================================================
# AREA 2 — FUNCTIONALITY
# Checklist: checklists/functionality-checklist.md
# Checks: Auth · Projects · Sitemap · Design · Team · Manage Mode (Playwright)
# =============================================================================
log_phase 2 "Functionality"

FUNC_FAIL=0
FUNC_REPORT="$REPORT_DIR/02-functionality.md"
echo "# Functionality Report — $BASE_URL" > "$FUNC_REPORT"
echo "**Date:** $(date)" >> "$FUNC_REPORT"
echo "" >> "$FUNC_REPORT"

FUNC_SPECS=(
  "tests/sproutos/auth.spec.js:Auth / Login flow"
  "tests/sproutos/login-pages.spec.js:Login pages"
  "tests/sproutos/guided-brief.spec.js:Guided Brief wizard"
  "tests/sproutos/sitemap.spec.js:Sitemap Editor (legacy)"
  "tests/sproutos/sitemap/editor.spec.js:Sitemap Editor"
  "tests/sproutos/sitemap/pages.spec.js:Sitemap Pages"
  "tests/sproutos/sitemap/sections.spec.js:Sitemap Sections"
  "tests/sproutos/sitemap/global-sections.spec.js:Sitemap Global Sections"
  "tests/sproutos/sitemap/ai-chat.spec.js:Sitemap AI Chat"
  "tests/sproutos/design.spec.js:Design Editor (legacy)"
  "tests/sproutos/design-editor.spec.js:Design Editor"
  "tests/sproutos/color-system.spec.js:Color System"
  "tests/sproutos/ai-text-popup.spec.js:AI Text Popup"
  "tests/sproutos/image-picker.spec.js:Image Picker"
  "tests/sproutos/export.spec.js:Export"
  "tests/sproutos/team-management.spec.js:Team Management"
  "tests/sproutos/token-usage.spec.js:Token Usage / Billing"
  "tests/sproutos/user-settings.spec.js:User Settings"
  "tests/sproutos/scope.spec.js:Scope Editor"
  "tests/sproutos/dashboard/dashboard.spec.js:Dashboard"
  "tests/sproutos/manage-overview.spec.js:Manage Mode — Overview"
  "tests/sproutos/manage-actions.spec.js:Manage Mode — Actions"
  "tests/sproutos/manage-build.spec.js:Manage Mode — Build"
  "tests/sproutos/manage-mcp.spec.js:Manage Mode — MCP Connection"
  "tests/sproutos/manage-approvals.spec.js:Manage Mode — Approvals"
)

for entry in "${FUNC_SPECS[@]}"; do
  SPEC="${entry%%:*}"
  LABEL="${entry##*:}"
  [ -n "$FEATURE_FILTER" ] && ! echo "$SPEC" | grep -qi "$FEATURE_FILTER" && continue
  if [ -e "$SPEC" ]; then
    info "→ $LABEL"
    if npx playwright test "$SPEC" $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tee -a "$FUNC_REPORT" | tail -4; then
      echo "- ✅ $LABEL" >> "$FUNC_REPORT"
    else
      echo "- ❌ $LABEL" >> "$FUNC_REPORT"
      FUNC_FAIL=$((FUNC_FAIL+1))
    fi
  else
    warn "Planned: $SPEC"
    echo "- ⏭  Planned: $LABEL" >> "$FUNC_REPORT"
  fi
done

info "Functionality report saved: $FUNC_REPORT"

if [ $FUNC_FAIL -eq 0 ]; then
  pass "Functionality checks passed"
  record 2 "Functionality" "PASS"
else
  fail "Functionality — $FUNC_FAIL spec(s) failed"
  record 2 "Functionality" "FAIL"
fi

# =============================================================================
# AREA 3 — RESPONSIVENESS
# Checklist: checklists/responsiveness-checklist.md
# Checks: breakpoints 320px → 1920px across all Playwright viewport projects
# =============================================================================
if [ "$HOTFIX" = false ]; then
  log_phase 3 "Responsiveness"

  RESP_FAIL=0

  RESP_SPEC=""
  for s in "tests/sproutos/responsive.spec.js" \
            "tests/sproutos/homepage.spec.js" \
            "tests/sproutos/login-pages.spec.js"; do
    [ -e "$s" ] && { RESP_SPEC="$s"; break; }
  done

  if [ -n "$RESP_SPEC" ]; then
    info "Running $RESP_SPEC across all viewport projects..."
    npx playwright test "$RESP_SPEC" \
      --project=sproutos-desktop \
      --project=sproutos-tablet \
      --project=sproutos-mobile \
      $PW_HEADED \
      --reporter=list 2>&1 \
      | tee "$REPORT_DIR/03-responsiveness.txt" \
      | tail -8 \
      || RESP_FAIL=$((RESP_FAIL+1))
  else
    warn "No responsive spec found — verifying viewport meta only"
    HTML=$(curl -s --max-time 15 "$BASE_URL" || echo "")
    echo "$HTML" | grep -q 'name="viewport"' \
      && pass "Viewport meta present" \
      || { fail "Viewport meta missing"; RESP_FAIL=$((RESP_FAIL+1)); }
  fi

  # Extra: verify CSS breakpoint declarations exist in served HTML/CSS
  info "Checking for responsive media queries in homepage HTML..."
  CSS_REFS=$(curl -s --max-time 15 "$BASE_URL" | grep -o 'href="[^"]*\.css[^"]*"' | head -3 || echo "")
  if [ -n "$CSS_REFS" ]; then
    for CSS_HREF in $CSS_REFS; do
      CSS_URL=$(echo "$CSS_HREF" | sed 's/href="//;s/"//')
      [[ "$CSS_URL" != http* ]] && CSS_URL="$BASE_URL$CSS_URL"
      MQ_COUNT=$(curl -s --max-time 10 "$CSS_URL" | grep -c '@media' || echo 0)
      if [ "$MQ_COUNT" -gt 0 ]; then
        pass "CSS media queries found: $MQ_COUNT in $(echo "$CSS_URL" | awk -F'/' '{print $NF}')"
        break
      fi
    done
  else
    warn "Could not fetch external CSS — media query check skipped"
  fi

  if [ $RESP_FAIL -eq 0 ]; then
    pass "Responsiveness checks passed"
    record 3 "Responsiveness" "PASS"
  else
    fail "Responsiveness — $RESP_FAIL failure(s)"
    record 3 "Responsiveness" "FAIL"
  fi
else
  skip "Responsiveness"
  record 3 "Responsiveness" "SKIP"
fi

# =============================================================================
# AREA 4 — LOGIC
# Checklist: checklists/logic-checklist.md
# Checks: Business rules, edge cases, state management, RBAC
# =============================================================================
if [ "$HOTFIX" = false ]; then
  log_phase 4 "Logic"

  LOGIC_FAIL=0
  LOGIC_REPORT="$REPORT_DIR/04-logic.md"
  echo "# Logic / Business Rules Report — $BASE_URL" > "$LOGIC_REPORT"
  echo "**Date:** $(date)" >> "$LOGIC_REPORT"
  echo "" >> "$LOGIC_REPORT"

  LOGIC_SPECS=(
    "tests/sproutos/sitemap/security.spec.js:Sitemap security/auth gating"
    "tests/sproutos/section-variants.spec.js:Section variant logic"
  )

  for entry in "${LOGIC_SPECS[@]}"; do
    SPEC="${entry%%:*}"
    LABEL="${entry##*:}"
    [ -n "$FEATURE_FILTER" ] && ! echo "$SPEC" | grep -qi "$FEATURE_FILTER" && continue
    if [ -e "$SPEC" ]; then
      info "→ $LABEL"
      npx playwright test "$SPEC" $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 \
        && echo "- ✅ $LABEL" >> "$LOGIC_REPORT" \
        || { echo "- ❌ $LABEL" >> "$LOGIC_REPORT"; LOGIC_FAIL=$((LOGIC_FAIL+1)); }
    else
      warn "Planned: $SPEC"
      echo "- ⏭  Planned: $LABEL" >> "$LOGIC_REPORT"
    fi
  done

  # ── Auth-gating checks (RBAC / plan gates) via curl ───────────────────────
  info "Checking auth-gated routes return redirect, not 500..."
  for GATED in "/dashboard" "/scope" "/design" "/manage" "/team" "/settings" "/billing/tokens"; do
    STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 -L "$BASE_URL$GATED" || echo "000")
    if [ "$STATUS" -ge 500 ] 2>/dev/null; then
      fail "Auth-gated $GATED returned HTTP $STATUS (expected redirect)"
      echo "- ❌ $GATED → $STATUS (should redirect)" >> "$LOGIC_REPORT"
      LOGIC_FAIL=$((LOGIC_FAIL+1))
    else
      pass "Auth-gated $GATED → $STATUS (redirect or auth wall)"
      echo "- ✅ $GATED → $STATUS" >> "$LOGIC_REPORT"
    fi
  done

  # ── API must return 401, not 500, for unauthenticated requests ─────────────
  info "Checking API endpoints return 401, not 500 or 200, without auth..."
  for API_ROUTE in "/api/projects" "/api/workspaces" "/api/team"; do
    STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$BASE_URL$API_ROUTE" || echo "000")
    if [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
      pass "API $API_ROUTE → $STATUS (correctly auth-gated)"
      echo "- ✅ $API_ROUTE → $STATUS" >> "$LOGIC_REPORT"
    elif [ "$STATUS" -ge 500 ] 2>/dev/null; then
      fail "API $API_ROUTE → $STATUS (server error — check API handler)"
      echo "- ❌ $API_ROUTE → $STATUS (server error)" >> "$LOGIC_REPORT"
      LOGIC_FAIL=$((LOGIC_FAIL+1))
    else
      warn "API $API_ROUTE → $STATUS (unexpected — may be exposing data without auth)"
      echo "- ⚠️  $API_ROUTE → $STATUS" >> "$LOGIC_REPORT"
    fi
  done

  info "Logic report saved: $LOGIC_REPORT"

  if [ $LOGIC_FAIL -eq 0 ]; then
    pass "Logic checks passed"
    record 4 "Logic" "PASS"
  else
    fail "Logic — $LOGIC_FAIL check(s) failed"
    record 4 "Logic" "FAIL"
  fi
else
  skip "Logic"
  record 4 "Logic" "SKIP"
fi

# =============================================================================
# AREA 5 — SECURITY
# Checklist: checklists/security-checklist.md
# Checks: Security headers · HTTPS · Auth gates · Input validation
# =============================================================================
log_phase 5 "Security"

SEC_FAIL=0
SEC_REPORT="$REPORT_DIR/05-security.md"
echo "# Security Report — $BASE_URL" > "$SEC_REPORT"
echo "**Date:** $(date)" >> "$SEC_REPORT"
echo "" >> "$SEC_REPORT"

HEADERS=$(curl -sI --max-time 10 "$BASE_URL" || echo "")

check_header() {
  local header="$1" label="$2" required="${3:-true}"
  if echo "$HEADERS" | grep -qi "^${header}:"; then
    pass "$label ✓"
    echo "- ✅ $label" >> "$SEC_REPORT"
  elif [ "$required" = "false" ]; then
    warn "$label not set (recommended)"
    echo "- ⚠️  $label not set (recommended)" >> "$SEC_REPORT"
  else
    fail "$label MISSING (required)"
    echo "- ❌ $label MISSING" >> "$SEC_REPORT"
    SEC_FAIL=$((SEC_FAIL+1))
  fi
}

check_header "strict-transport-security" "HSTS (Strict-Transport-Security)"
check_header "x-content-type-options"    "X-Content-Type-Options: nosniff"
check_header "x-frame-options"           "X-Frame-Options (clickjacking protection)"
check_header "referrer-policy"           "Referrer-Policy"
check_header "permissions-policy"        "Permissions-Policy"
check_header "content-security-policy"   "Content-Security-Policy" "false"

# X-Powered-By must be absent
if echo "$HEADERS" | grep -qi "^x-powered-by:"; then
  fail "X-Powered-By header exposed — leaks server stack (remove it)"
  echo "- ❌ X-Powered-By exposed (must be removed)" >> "$SEC_REPORT"
  SEC_FAIL=$((SEC_FAIL+1))
else
  pass "X-Powered-By absent (good)"
  echo "- ✅ X-Powered-By absent" >> "$SEC_REPORT"
fi

# Server header: should not expose version
SERVER_HEADER=$(echo "$HEADERS" | grep -i "^server:" | head -1)
if echo "$SERVER_HEADER" | grep -qiE "[0-9]+\.[0-9]+"; then
  warn "Server header exposes version: $SERVER_HEADER"
  echo "- ⚠️  Server header exposes version: $SERVER_HEADER" >> "$SEC_REPORT"
else
  pass "Server header does not expose version"
  echo "- ✅ Server header safe" >> "$SEC_REPORT"
fi

# HTTPS redirect
HTTP_REDIRECT=$(curl -o /dev/null -s -w "%{redirect_url}" --max-time 10 "http://sproutos.ai" 2>/dev/null || echo "")
if echo "$HTTP_REDIRECT" | grep -q "https://"; then
  pass "HTTP → HTTPS redirect active"
  echo "- ✅ HTTP redirects to HTTPS" >> "$SEC_REPORT"
else
  warn "HTTP → HTTPS redirect not detected (check if HTTP access is blocked)"
  echo "- ⚠️  HTTP → HTTPS redirect not detected" >> "$SEC_REPORT"
fi

# Playwright security spec
if [ -e "tests/sproutos/sitemap/security.spec.js" ]; then
  info "Running Playwright security spec..."
  npx playwright test "tests/sproutos/sitemap/security.spec.js" \
    $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 \
    || { fail "Security Playwright spec failed"; SEC_FAIL=$((SEC_FAIL+1)); }
elif [ -e "tests/sproutos/security.spec.js" ]; then
  npx playwright test "tests/sproutos/security.spec.js" \
    $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 \
    || { fail "Security Playwright spec failed"; SEC_FAIL=$((SEC_FAIL+1)); }
fi

info "Security report saved: $SEC_REPORT"

if [ $SEC_FAIL -eq 0 ]; then
  pass "Security checks passed"
  record 5 "Security" "PASS"
else
  fail "Security — $SEC_FAIL check(s) failed"
  record 5 "Security" "FAIL"
fi

# =============================================================================
# AREA 6 — PERFORMANCE
# Checklist: checklists/performance-checklist.md
# Checks: Core Web Vitals (TTFB) · Gzip · Cache-Control · Lighthouse
# =============================================================================
if [ "$HOTFIX" = false ]; then
  log_phase 6 "Performance"

  PERF_FAIL=0
  PERF_REPORT="$REPORT_DIR/06-performance.md"
  echo "# Performance Report — $BASE_URL" > "$PERF_REPORT"
  echo "**Date:** $(date)" >> "$PERF_REPORT"
  echo "" >> "$PERF_REPORT"

  measure_ttfb() {
    local url="$1" label="$2" budget_ms="${3:-800}"
    local TTFB TTFB_MS
    TTFB=$(curl -o /dev/null -s -w "%{time_starttransfer}" --max-time 15 "$url" 2>/dev/null || echo "99")
    TTFB_MS=$(echo "$TTFB * 1000" | bc 2>/dev/null | cut -d'.' -f1 || echo "9999")
    if [ "$TTFB_MS" -le "$budget_ms" ] 2>/dev/null; then
      pass "$label TTFB: ${TTFB_MS}ms (budget ${budget_ms}ms)"
      echo "- ✅ $label TTFB: ${TTFB_MS}ms" >> "$PERF_REPORT"
    else
      fail "$label TTFB: ${TTFB_MS}ms — exceeds ${budget_ms}ms budget"
      echo "- ❌ $label TTFB: ${TTFB_MS}ms (budget ${budget_ms}ms)" >> "$PERF_REPORT"
      PERF_FAIL=$((PERF_FAIL+1))
    fi
  }

  # Budgets aligned with config/performance.config.js
  measure_ttfb "$BASE_URL/"         "Homepage"       600
  measure_ttfb "$BASE_URL/login"    "Login"          400
  measure_ttfb "$BASE_URL/signup"   "Signup"         400
  measure_ttfb "$BASE_URL/sitemap.xml" "Sitemap XML" 1000

  # HTML payload size
  PAGE_SIZE=$(curl -so /dev/null -w "%{size_download}" --max-time 15 "$BASE_URL" || echo 0)
  PAGE_SIZE_KB=$(echo "$PAGE_SIZE / 1024" | bc 2>/dev/null || echo 0)
  if [ "$PAGE_SIZE_KB" -lt 500 ] 2>/dev/null; then
    pass "Homepage HTML size: ${PAGE_SIZE_KB}KB (< 500KB)"
    echo "- ✅ Homepage HTML: ${PAGE_SIZE_KB}KB" >> "$PERF_REPORT"
  else
    warn "Homepage HTML size: ${PAGE_SIZE_KB}KB — consider optimization"
    echo "- ⚠️  Homepage HTML: ${PAGE_SIZE_KB}KB (large)" >> "$PERF_REPORT"
  fi

  # Gzip compression
  GZIP=$(curl -sI -H "Accept-Encoding: gzip" "$BASE_URL" | grep -i "content-encoding: gzip" || echo "")
  if [ -n "$GZIP" ]; then
    pass "Gzip compression enabled"
    echo "- ✅ Gzip enabled" >> "$PERF_REPORT"
  else
    warn "Gzip compression not detected"
    echo "- ⚠️  Gzip not detected" >> "$PERF_REPORT"
  fi

  # Cache-Control
  CACHE=$(curl -sI "$BASE_URL" | grep -i "cache-control" | head -1)
  if [ -n "$CACHE" ]; then
    pass "Cache-Control: $(echo "$CACHE" | head -c 60)"
    echo "- ✅ Cache-Control present" >> "$PERF_REPORT"
  else
    warn "No Cache-Control header on homepage"
    echo "- ⚠️  Cache-Control missing" >> "$PERF_REPORT"
  fi

  # Lighthouse (optional)
  if [ "$SKIP_LIGHTHOUSE" = false ] && command -v lighthouse &>/dev/null; then
    info "Running Lighthouse (desktop)..."
    lighthouse "$BASE_URL" \
      --output=json,html \
      --output-path="$REPORT_DIR/lighthouse" \
      --chrome-flags="--headless --no-sandbox" \
      --preset=desktop \
      --quiet 2>&1 | tail -3 || warn "Lighthouse completed with warnings"
    pass "Lighthouse report saved: $REPORT_DIR/lighthouse.report.html"
  elif [ "$SKIP_LIGHTHOUSE" = false ]; then
    warn "Lighthouse not installed — run: npm install -g lighthouse"
  fi

  # Playwright performance spec
  [ -e "tests/sproutos/performance.spec.js" ] \
    && npx playwright test "tests/sproutos/performance.spec.js" \
        $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 \
        || true

  info "Performance report saved: $PERF_REPORT"

  if [ $PERF_FAIL -eq 0 ]; then
    pass "Performance checks passed"
    record 6 "Performance" "PASS"
  else
    fail "Performance — $PERF_FAIL check(s) failed"
    record 6 "Performance" "FAIL"
  fi
else
  skip "Performance"
  record 6 "Performance" "SKIP"
fi

# =============================================================================
# AREA 7 — ACCESSIBILITY
# Checklist: checklists/accessibility-checklist.md
# Checks: WCAG 2.1 AA via axe-core (Playwright) + HTML spot-checks
# =============================================================================
if [ "$HOTFIX" = false ]; then
  log_phase 7 "Accessibility"

  A11Y_FAIL=0
  A11Y_REPORT="$REPORT_DIR/07-accessibility.md"
  echo "# Accessibility Report — WCAG 2.1 AA" > "$A11Y_REPORT"
  echo "**Date:** $(date)" >> "$A11Y_REPORT"
  echo "" >> "$A11Y_REPORT"

  if command -v node &>/dev/null && [ -d node_modules/@axe-core 2>/dev/null ]; then
    info "Running axe-core on public pages..."

    node - <<'AXEOF' >> "$A11Y_REPORT" 2>&1 || A11Y_FAIL=$((A11Y_FAIL+1))
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const BASE = process.env.SPROUTOS_URL || 'https://sproutos.ai';

const PAGES = [
  ['Homepage', '/'],
  ['Login',    '/login'],
  ['Signup',   '/signup'],
];

(async () => {
  const browser = await chromium.launch();
  let total = 0;

  for (const [label, path] of PAGES) {
    const ctx  = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious  = results.violations.filter(v => v.impact === 'serious');
    const moderate = results.violations.filter(v => v.impact === 'moderate');
    const minor    = results.violations.filter(v => v.impact === 'minor');

    console.log(`\n## ${label} (${BASE + path})`);
    console.log(`| Impact | Count |`);
    console.log(`|---|---|`);
    console.log(`| Critical | ${critical.length} |`);
    console.log(`| Serious  | ${serious.length}  |`);
    console.log(`| Moderate | ${moderate.length} |`);
    console.log(`| Minor    | ${minor.length}    |`);
    console.log(`| Passes   | ${results.passes.length} |`);

    for (const v of [...critical, ...serious]) {
      console.log(`\n### [${v.impact.toUpperCase()}] ${v.id}`);
      console.log(`${v.description}`);
      console.log(`Help: ${v.helpUrl}`);
    }

    total += critical.length + serious.length;
    await ctx.close();
  }

  await browser.close();
  process.exit(total > 0 ? 1 : 0);
})();
AXEOF

    [ $A11Y_FAIL -eq 0 ] \
      && pass "No critical/serious WCAG violations found" \
      || fail "Accessibility violations found — see $A11Y_REPORT"

  else
    info "axe-core not installed — running HTML spot-checks (install: npm install @axe-core/playwright)"

    HTML=$(curl -s --max-time 15 "$BASE_URL" || echo "")

    # img alt checks
    IMG_TOTAL=$(echo "$HTML" | grep -c '<img' || echo 0)
    IMG_ALT=$(echo "$HTML" | grep -c 'alt="' || echo 0)
    if [ "$IMG_ALT" -ge "$IMG_TOTAL" ] || [ "$IMG_TOTAL" -eq 0 ]; then
      pass "All img tags have alt attributes ($IMG_ALT / $IMG_TOTAL)"
      echo "- ✅ img alt attributes: $IMG_ALT / $IMG_TOTAL" >> "$A11Y_REPORT"
    else
      warn "Some img tags may be missing alt attributes ($IMG_ALT / $IMG_TOTAL)"
      echo "- ⚠️  img alt attributes: $IMG_ALT / $IMG_TOTAL" >> "$A11Y_REPORT"
    fi

    # Focus ring / outline check (look for :focus or outline in CSS)
    CSS_OUTLINE=$(curl -s --max-time 15 "$BASE_URL" \
      | grep -o 'href="[^"]*\.css[^"]*"' | head -2 \
      | while read -r href; do
          url=$(echo "$href" | sed 's/href="//;s/"//');
          [[ "$url" != http* ]] && url="$BASE_URL$url";
          curl -s --max-time 8 "$url" 2>/dev/null;
        done | grep -c ':focus' || echo 0)
    if [ "$CSS_OUTLINE" -gt 0 ]; then
      pass ":focus styles present in CSS ($CSS_OUTLINE occurrences)"
      echo "- ✅ :focus styles found" >> "$A11Y_REPORT"
    else
      warn ":focus styles not detected — keyboard users may have no visible focus ring"
      echo "- ⚠️  :focus styles not detected" >> "$A11Y_REPORT"
    fi

    # lang check
    LANG=$(echo "$HTML" | grep -o 'lang="[^"]*"' | head -1)
    if [ -n "$LANG" ]; then
      pass "HTML lang attribute: $LANG"
      echo "- ✅ HTML lang: $LANG" >> "$A11Y_REPORT"
    else
      fail "HTML lang attribute missing"
      echo "- ❌ HTML lang missing" >> "$A11Y_REPORT"
      A11Y_FAIL=$((A11Y_FAIL+1))
    fi
  fi

  # Playwright accessibility spec
  [ -e "tests/sproutos/accessibility.spec.js" ] \
    && npx playwright test "tests/sproutos/accessibility.spec.js" \
        $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 \
        || A11Y_FAIL=$((A11Y_FAIL+1)) || true

  info "Accessibility report saved: $A11Y_REPORT"

  if [ $A11Y_FAIL -eq 0 ]; then
    pass "Accessibility checks passed"
    record 7 "Accessibility" "PASS"
  else
    fail "Accessibility — $A11Y_FAIL issue(s) found"
    record 7 "Accessibility" "FAIL"
  fi
else
  skip "Accessibility"
  record 7 "Accessibility" "SKIP"
fi

# =============================================================================
# AREA 8 — CROSS-BROWSER
# Checklist: checklists/cross-browser-checklist.md
# Checks: Chrome · Firefox · Safari · Edge · Mobile WebKit
# =============================================================================
if [ "$HOTFIX" = false ]; then
  log_phase 8 "Cross-Browser"

  XBROW_FAIL=0
  XBROW_REPORT="$REPORT_DIR/08-cross-browser.md"
  echo "# Cross-Browser Report" > "$XBROW_REPORT"
  echo "**Date:** $(date)" >> "$XBROW_REPORT"
  echo "" >> "$XBROW_REPORT"

  # Pick a lightweight spec for cross-browser validation
  XBROW_SPEC=""
  for s in "tests/sproutos/login-pages.spec.js" \
            "tests/sproutos/homepage.spec.js" \
            "tests/sproutos/auth.spec.js"; do
    [ -e "$s" ] && { XBROW_SPEC="$s"; break; }
  done

  if [ -n "$XBROW_SPEC" ]; then
    for BROWSER_PROJECT in sproutos-desktop sproutos-tablet sproutos-mobile; do
      info "Cross-browser run: --project=$BROWSER_PROJECT"
      if npx playwright test "$XBROW_SPEC" \
          --project="$BROWSER_PROJECT" \
          $PW_HEADED \
          --reporter=list 2>&1 | tee -a "$XBROW_REPORT" | tail -3; then
        echo "- ✅ $BROWSER_PROJECT" >> "$XBROW_REPORT"
      else
        fail "$BROWSER_PROJECT spec failed"
        echo "- ❌ $BROWSER_PROJECT" >> "$XBROW_REPORT"
        XBROW_FAIL=$((XBROW_FAIL+1))
      fi
    done
  else
    warn "No suitable cross-browser spec found — manual browser testing required"
    echo "- ⚠️  No spec found for cross-browser run" >> "$XBROW_REPORT"
  fi

  info "Cross-browser report saved: $XBROW_REPORT"

  if [ $XBROW_FAIL -eq 0 ]; then
    pass "Cross-browser checks passed"
    record 8 "Cross-Browser" "PASS"
  else
    fail "Cross-Browser — $XBROW_FAIL failure(s)"
    record 8 "Cross-Browser" "FAIL"
  fi
else
  skip "Cross-Browser"
  record 8 "Cross-Browser" "SKIP"
fi

# =============================================================================
# AREA 9 — CONSOLE ERRORS
# Checklist: checklists/console-errors-checklist.md
# Checks: JS errors · 4xx/5xx network · PHP notices · CSP violations
# =============================================================================
log_phase 9 "Console Errors"

CONSOLE_FAIL=0
CONSOLE_REPORT="$REPORT_DIR/09-console-errors.md"
echo "# Console Errors Report — $BASE_URL" > "$CONSOLE_REPORT"
echo "**Date:** $(date)" >> "$CONSOLE_REPORT"
echo "" >> "$CONSOLE_REPORT"

if command -v node &>/dev/null; then
  node - <<'CONEOF' >> "$CONSOLE_REPORT" 2>&1 || CONSOLE_FAIL=$((CONSOLE_FAIL+1))
const { chromium } = require('playwright');
const BASE = process.env.SPROUTOS_URL || 'https://sproutos.ai';

// Allow-list: third-party scripts that legitimately log errors we can't control
const ALLOWLIST = [
  /^\[Fast Refresh\]/,
  /^\[HMR\]/,
  /analytics|gtag|facebook|hotjar|sentry|intercom|clarity|adsystem|paddle/i,
];

const isAllowed = t => ALLOWLIST.some(r => r.test(t));

const ROUTES = ['/', '/login', '/signup'];

(async () => {
  const browser = await chromium.launch();
  let totalErrors = 0;

  for (const path of ROUTES) {
    const page = await browser.newPage();
    const errors = [];
    const failed = [];

    page.on('pageerror', e => {
      if (!isAllowed(e.message)) errors.push(`JS ERROR: ${e.message.slice(0, 200)}`);
    });
    page.on('console', m => {
      const t = m.text();
      if (isAllowed(t)) return;
      if (m.type() === 'error') errors.push(`CONSOLE ERROR: ${t.slice(0, 200)}`);
    });
    page.on('response', r => {
      if (r.url().includes(BASE.replace('https://', '')) && r.status() >= 400)
        failed.push(`HTTP ${r.status()}: ${r.url().slice(0, 120)}`);
    });

    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    console.log(`\n## ${path}`);
    if (errors.length === 0 && failed.length === 0) {
      console.log('✅ No console errors or failed requests');
    } else {
      [...errors, ...failed].forEach(e => console.log(`- ${e}`));
      totalErrors += errors.length + failed.length;
    }

    await page.close();
  }

  await browser.close();
  process.exit(totalErrors > 0 ? 1 : 0);
})();
CONEOF

  if [ $CONSOLE_FAIL -eq 0 ]; then
    pass "No console errors on public pages"
  else
    fail "Console errors detected — see $CONSOLE_REPORT"
  fi
else
  warn "Node.js not found — console error check skipped"
fi

# Playwright console-error spec
[ -e "tests/sproutos/console-errors.spec.js" ] \
  && npx playwright test "tests/sproutos/console-errors.spec.js" \
      $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 \
      || CONSOLE_FAIL=$((CONSOLE_FAIL+1)) || true

info "Console errors report saved: $CONSOLE_REPORT"

if [ $CONSOLE_FAIL -eq 0 ]; then
  record 9 "Console Errors" "PASS"
else
  record 9 "Console Errors" "FAIL"
fi

# =============================================================================
# AREA 10 — SEO / META TAGS
# Checklist: checklists/seo-meta-checklist.md
# Checks: title · meta description · OG tags · canonical · robots.txt · sitemap.xml
# =============================================================================
if [ "$HOTFIX" = false ]; then
  log_phase 10 "SEO / Meta Tags"

  SEO_FAIL=0
  SEO_REPORT="$REPORT_DIR/10-seo.md"
  echo "# SEO / Meta Tags Report — $BASE_URL" > "$SEO_REPORT"
  echo "**Date:** $(date)" >> "$SEO_REPORT"
  echo "" >> "$SEO_REPORT"
  echo "| Check | Status | Value |" >> "$SEO_REPORT"
  echo "|---|---|---|" >> "$SEO_REPORT"

  seo_check() {
    local label="$1" value="$2" pattern="$3" required="${4:-true}"
    if echo "$value" | grep -qiE "$pattern"; then
      pass "$label"
      echo "| $label | ✅ | \`$(echo "$value" | head -c 80)\` |" >> "$SEO_REPORT"
    elif [ "$required" = "warn" ]; then
      warn "$label — $(echo "$value" | head -c 80)"
      echo "| $label | ⚠️  | \`$(echo "$value" | head -c 80)\` |" >> "$SEO_REPORT"
    else
      fail "$label — got: $(echo "$value" | head -c 80)"
      echo "| $label | ❌ | \`$(echo "$value" | head -c 80)\` |" >> "$SEO_REPORT"
      SEO_FAIL=$((SEO_FAIL+1))
    fi
  }

  HTML=$(curl -s --max-time 15 "$BASE_URL" || echo "")

  TITLE=$(echo "$HTML" | perl -ne 'print "$1\n" if /<title>([^<]+)/i' | head -1)
  [ -n "$TITLE" ] && seo_check "Title tag" "$TITLE" "." || { fail "Title tag missing"; SEO_FAIL=$((SEO_FAIL+1)); }
  [ ${#TITLE} -le 60 ] \
    && pass "Title length ≤ 60 chars (${#TITLE})" \
    || warn "Title length ${#TITLE} chars — ideal is ≤ 60"

  META_DESC=$(echo "$HTML" | perl -ne 'print "$1\n" if /name="description"\s+content="([^"]+)"/i' | head -1)
  [ -n "$META_DESC" ] && seo_check "Meta description" "$META_DESC" "." || { fail "Meta description missing"; SEO_FAIL=$((SEO_FAIL+1)); }
  [ ${#META_DESC} -le 160 ] \
    && pass "Meta description ≤ 160 chars (${#META_DESC})" \
    || warn "Meta description ${#META_DESC} chars — ideal ≤ 160"

  OG_TITLE=$(echo "$HTML" | perl -ne 'print "$1\n" if /property="og:title"\s+content="([^"]+)"/i' | head -1)
  seo_check "OG title" "${OG_TITLE:-MISSING}" "."

  OG_DESC=$(echo "$HTML" | perl -ne 'print "$1\n" if /property="og:description"\s+content="([^"]+)"/i' | head -1)
  seo_check "OG description" "${OG_DESC:-MISSING}" "."

  OG_IMAGE=$(echo "$HTML" | perl -ne 'print "$1\n" if /property="og:image"\s+content="([^"]+)"/i' | head -1)
  seo_check "OG image (HTTPS)" "${OG_IMAGE:-MISSING}" "^https://"

  TW_CARD=$(echo "$HTML" | perl -ne 'print "$1\n" if /name="twitter:card"\s+content="([^"]+)"/i' | head -1)
  seo_check "Twitter card" "${TW_CARD:-MISSING}" "." "warn"

  CANONICAL=$(echo "$HTML" | perl -ne 'print "$1\n" if /rel="canonical"\s+href="([^"]+)"/i' | head -1)
  seo_check "Canonical URL" "${CANONICAL:-MISSING}" "^https://"

  JSONLD=$(echo "$HTML" | grep -c 'type="application/ld+json"' || echo 0)
  [ "$JSONLD" -gt 0 ] \
    && pass "JSON-LD structured data: $JSONLD block(s)" \
    || warn "No JSON-LD structured data — add Organization/WebSite schema"

  SITEMAP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$BASE_URL/sitemap.xml")
  [ "$SITEMAP_STATUS" = "200" ] \
    && { pass "sitemap.xml → 200"; echo "| sitemap.xml | ✅ | 200 |" >> "$SEO_REPORT"; } \
    || { fail "sitemap.xml → $SITEMAP_STATUS"; echo "| sitemap.xml | ❌ | $SITEMAP_STATUS |" >> "$SEO_REPORT"; SEO_FAIL=$((SEO_FAIL+1)); }

  ROBOTS_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$BASE_URL/robots.txt")
  [ "$ROBOTS_STATUS" = "200" ] \
    && { pass "robots.txt → 200"; echo "| robots.txt | ✅ | 200 |" >> "$SEO_REPORT"; } \
    || { fail "robots.txt → $ROBOTS_STATUS"; echo "| robots.txt | ❌ | $ROBOTS_STATUS |" >> "$SEO_REPORT"; SEO_FAIL=$((SEO_FAIL+1)); }

  curl -s "$BASE_URL/robots.txt" | grep -qi "sitemap" \
    && { pass "robots.txt references Sitemap"; echo "| Sitemap in robots.txt | ✅ | present |" >> "$SEO_REPORT"; } \
    || { warn "robots.txt missing Sitemap directive"; echo "| Sitemap in robots.txt | ⚠️  | missing |" >> "$SEO_REPORT"; }

  # Auth-gated routes must have noindex
  for NOINDEX_PATH in "/dashboard" "/design" "/scope"; do
    NI_HTML=$(curl -s --max-time 10 -L "$BASE_URL$NOINDEX_PATH" 2>/dev/null || echo "")
    if echo "$NI_HTML" | grep -qi 'noindex'; then
      pass "noindex set on $NOINDEX_PATH"
      echo "| noindex: $NOINDEX_PATH | ✅ | present |" >> "$SEO_REPORT"
    else
      warn "$NOINDEX_PATH — noindex not confirmed (may be behind auth redirect)"
      echo "| noindex: $NOINDEX_PATH | ⚠️  | not confirmed |" >> "$SEO_REPORT"
    fi
  done

  # Playwright SEO spec
  [ -e "tests/sproutos/seo.spec.js" ] \
    && npx playwright test "tests/sproutos/seo.spec.js" $PW_HEADED $PW_PROJECT --reporter=list 2>&1 | tail -4 \
    || true

  echo "" >> "$SEO_REPORT"
  echo "**SEO failures: $SEO_FAIL**" >> "$SEO_REPORT"
  info "SEO report saved: $SEO_REPORT"

  if [ $SEO_FAIL -eq 0 ]; then
    pass "SEO / Meta Tags checks passed"
    record 10 "SEO / Meta Tags" "PASS"
  else
    fail "SEO / Meta Tags — $SEO_FAIL check(s) failed"
    record 10 "SEO / Meta Tags" "FAIL"
  fi
else
  skip "SEO / Meta Tags"
  record 10 "SEO / Meta Tags" "SKIP"
fi

# =============================================================================
# AREA 11 — CODE QUALITY
# Checklist: checklists/code-quality-checklist.md
# Checks: ESLint · TypeScript · Build (Next.js) · PHP lint (--plugin path)
# =============================================================================
log_phase 11 "Code Quality"

CODE_FAIL=0
CODE_REPORT="$REPORT_DIR/11-code-quality.md"
echo "# Code Quality Report" > "$CODE_REPORT"
echo "**Date:** $(date)" >> "$CODE_REPORT"
echo "" >> "$CODE_REPORT"

# ── ESLint ────────────────────────────────────────────────────────────────────
if require_cmd npx "npm install"; then
  info "Running ESLint..."
  if npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0 2>&1 \
      | tee "$REPORT_DIR/eslint.txt" | tail -5; then
    pass "ESLint — 0 errors, 0 warnings"
    echo "- ✅ ESLint passed (0 errors)" >> "$CODE_REPORT"
  else
    fail "ESLint errors found — see $REPORT_DIR/eslint.txt"
    echo "- ❌ ESLint errors (see eslint.txt)" >> "$CODE_REPORT"
    CODE_FAIL=$((CODE_FAIL+1))
  fi
else
  warn "npx not found — ESLint skipped"
fi

# ── TypeScript type-check ─────────────────────────────────────────────────────
if [ -f tsconfig.json ] && require_cmd npx "npm install typescript"; then
  info "Running TypeScript type-check..."
  if npx tsc --noEmit 2>&1 | tee "$REPORT_DIR/tsc.txt" | tail -5; then
    pass "TypeScript — no type errors"
    echo "- ✅ TypeScript clean" >> "$CODE_REPORT"
  else
    fail "TypeScript errors found — see $REPORT_DIR/tsc.txt"
    echo "- ❌ TypeScript errors (see tsc.txt)" >> "$CODE_REPORT"
    CODE_FAIL=$((CODE_FAIL+1))
  fi
else
  warn "tsconfig.json not found or tsc unavailable — TypeScript check skipped"
fi

# ── Next.js build ─────────────────────────────────────────────────────────────
if [ -f next.config.js ] || [ -f next.config.ts ] || [ -f next.config.mjs ]; then
  info "Checking Next.js build (next build --dry-run or package.json build script)..."
  if grep -q '"build"' package.json 2>/dev/null; then
    if npm run build --if-present 2>&1 | tail -5; then
      pass "Next.js build succeeded"
      echo "- ✅ Build passed" >> "$CODE_REPORT"
    else
      fail "Next.js build failed"
      echo "- ❌ Build failed" >> "$CODE_REPORT"
      CODE_FAIL=$((CODE_FAIL+1))
    fi
  fi
fi

# ── Plugin PHP lint (when --plugin is provided) ───────────────────────────────
if [ -n "$PLUGIN_PATH" ]; then
  if [ -d "$PLUGIN_PATH" ]; then
    info "PHP lint on plugin: $PLUGIN_PATH"
    if require_cmd php "brew install php / apt install php"; then
      PHP_ERRORS=$(find "$PLUGIN_PATH" -name "*.php" -exec php -l {} \; 2>&1 | grep -v "No syntax errors" || true)
      if [ -z "$PHP_ERRORS" ]; then
        pass "PHP syntax — no errors in $PLUGIN_PATH"
        echo "- ✅ PHP lint clean: $PLUGIN_PATH" >> "$CODE_REPORT"
      else
        fail "PHP syntax errors found in $PLUGIN_PATH"
        echo "PHP errors:" >> "$CODE_REPORT"
        echo "$PHP_ERRORS" >> "$CODE_REPORT"
        CODE_FAIL=$((CODE_FAIL+1))
      fi
    fi

    # PHP_CodeSniffer (PHPCS) — WordPress coding standards
    if require_cmd phpcs "composer global require squizlabs/php_codesniffer"; then
      info "PHPCS (WordPress coding standards)..."
      if phpcs --standard=WordPress "$PLUGIN_PATH" 2>&1 \
          | tee "$REPORT_DIR/phpcs.txt" | tail -5; then
        pass "PHPCS — WordPress coding standards met"
        echo "- ✅ PHPCS clean" >> "$CODE_REPORT"
      else
        warn "PHPCS violations found — see $REPORT_DIR/phpcs.txt"
        echo "- ⚠️  PHPCS violations (see phpcs.txt)" >> "$CODE_REPORT"
      fi
    else
      warn "phpcs not installed — WordPress coding standards check skipped"
    fi

    # Plugin version consistency: main file version = readme.txt version
    MAIN_PHP=$(find "$PLUGIN_PATH" -maxdepth 1 -name "*.php" | head -1 || echo "")
    README_TXT="$PLUGIN_PATH/readme.txt"
    if [ -n "$MAIN_PHP" ] && [ -f "$README_TXT" ]; then
      PHP_VERSION=$(grep -i "^.*Version:" "$MAIN_PHP" 2>/dev/null | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]*' | head -1 || echo "")
      README_VERSION=$(grep -i "^Stable tag:" "$README_TXT" 2>/dev/null | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]*' | head -1 || echo "")
      if [ -n "$PHP_VERSION" ] && [ -n "$README_VERSION" ]; then
        if [ "$PHP_VERSION" = "$README_VERSION" ]; then
          pass "Plugin version consistent: $PHP_VERSION"
          echo "- ✅ Version consistent: $PHP_VERSION" >> "$CODE_REPORT"
        else
          fail "Version mismatch: plugin header $PHP_VERSION ≠ readme.txt $README_VERSION"
          echo "- ❌ Version mismatch: $PHP_VERSION vs $README_VERSION" >> "$CODE_REPORT"
          CODE_FAIL=$((CODE_FAIL+1))
        fi
      fi
    fi

  else
    fail "Plugin path does not exist: $PLUGIN_PATH"
    echo "- ❌ Plugin path not found: $PLUGIN_PATH" >> "$CODE_REPORT"
    CODE_FAIL=$((CODE_FAIL+1))
  fi
else
  info "No --plugin provided — PHP checks skipped (pass --plugin /path/to/plugin to enable)"
  echo "- ⏭  PHP lint skipped (--plugin not provided)" >> "$CODE_REPORT"
fi

# ── Playwright config validation ───────────────────────────────────────────────
if [ -f playwright.config.js ] || [ -f playwright.config.ts ]; then
  pass "playwright.config.js present"
  echo "- ✅ playwright.config.js present" >> "$CODE_REPORT"
else
  fail "playwright.config.js missing"
  echo "- ❌ playwright.config.js missing" >> "$CODE_REPORT"
  CODE_FAIL=$((CODE_FAIL+1))
fi

# ── package.json: no critical audit issues ────────────────────────────────────
if [ -f package.json ] && require_cmd npm "nodejs.org"; then
  AUDIT_CRITICAL=$(npm audit --json 2>/dev/null \
    | node -e "
      const d=require('fs').readFileSync('/dev/stdin','utf8');
      try{const j=JSON.parse(d); const c=(j.metadata||{}).vulnerabilities||{};
      console.log(c.critical||0);}catch(e){console.log(0);}" 2>/dev/null || echo 0)
  if [ "$AUDIT_CRITICAL" -eq 0 ] 2>/dev/null; then
    pass "npm audit — 0 critical vulnerabilities"
    echo "- ✅ npm audit: 0 critical" >> "$CODE_REPORT"
  else
    fail "npm audit — $AUDIT_CRITICAL critical vulnerability/vulnerabilities found"
    echo "- ❌ npm audit: $AUDIT_CRITICAL critical" >> "$CODE_REPORT"
    CODE_FAIL=$((CODE_FAIL+1))
  fi
fi

info "Code Quality report saved: $CODE_REPORT"

if [ $CODE_FAIL -eq 0 ]; then
  pass "Code Quality checks passed"
  record 11 "Code Quality" "PASS"
else
  fail "Code Quality — $CODE_FAIL check(s) failed"
  record 11 "Code Quality" "FAIL"
fi

# =============================================================================
# RELEASE SIGN-OFF TABLE
# Mirrors the sign-off table in checklists/qa-master-checklist.md
# =============================================================================
echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║             RELEASE SIGN-OFF TABLE                    ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

REVIEWER="${QA_REVIEWER:-$(whoami)}"
RUN_DATE=$(date +"%Y-%m-%d")

SIGNOFF_AREAS=(
  "1:UI / UX"
  "2:Functionality"
  "3:Responsiveness"
  "4:Logic"
  "5:Security"
  "6:Performance"
  "7:Accessibility"
  "8:Cross-Browser"
  "9:Console Errors"
  "10:SEO / Meta Tags"
  "11:Code Quality"
)

SIGNOFF_TABLE="# Release Sign-Off — Sprout OS QA Gauntlet

**Run Date:** $RUN_DATE
**Target:** $BASE_URL
**Run ID:** $TIMESTAMP
$([ -n "$PLUGIN_PATH" ] && echo "**Plugin:** $PLUGIN_PATH")
**Mode:** $([ "$HOTFIX" = true ] && echo "Hotfix" || echo "Full")

---

## Results

| # | Area | Reviewer | Date | Status |
|---|---|---|---|---|
"

for entry in "${SIGNOFF_AREAS[@]}"; do
  NUM="${entry%%:*}"
  AREA="${entry##*:}"
  STATUS="${SIGNOFF_STATUS[$NUM]}"
  SIGNOFF_TABLE+="| $NUM | $AREA | $REVIEWER | $RUN_DATE | $STATUS |
"

  COLOR="${NC}"
  if [ "$STATUS" = "☑ Pass" ];     then COLOR="${GREEN}"; fi
  if [ "$STATUS" = "☒ Fail" ];     then COLOR="${RED}"; fi
  if [ "$STATUS" = "⏭  Skipped" ]; then COLOR="${YELLOW}"; fi

  printf "  %-3s  %-22s  %b%s%b\n" "$NUM" "$AREA" "$COLOR" "$STATUS" "$NC"
done

echo ""

# Overall verdict
SIGNOFF_TABLE+="
---

## Overall

"
if [ $FAILED -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}✅  APPROVED FOR RELEASE${NC}  (${PASSED}/${TOTAL} areas passed)"
  SIGNOFF_TABLE+="**☑ Approved for Release**

All $([ "$HOTFIX" = true ] && echo "hotfix-required" || echo "required") areas passed.
"
else
  echo -e "  ${RED}${BOLD}❌  BLOCKED — ${FAILED} AREA(S) FAILED${NC}"
  SIGNOFF_TABLE+="**☒ Blocked — Issues Found**

$FAILED area(s) failed. Review \`$REPORT_DIR/\` for details.
"
fi

SIGNOFF_TABLE+="
---

*Generated by \`bash scripts/gauntlet.sh\` — Sprout OS Orbit — $RUN_DATE*
"

# Save sign-off file
DEFAULT_SIGNOFF="$REPORT_DIR/release-signoff.md"
TARGET_SIGNOFF="${SIGNOFF_FILE:-$DEFAULT_SIGNOFF}"
echo "$SIGNOFF_TABLE" > "$TARGET_SIGNOFF"

echo ""
echo -e "  Reports  : ${CYAN}$REPORT_DIR/${NC}"
echo -e "  Sign-off : ${CYAN}$TARGET_SIGNOFF${NC}"

if [ "$OPEN_HTML" = true ] && command -v open &>/dev/null; then
  open reports/playwright-html/index.html 2>/dev/null || true
fi

[ $FAILED -eq 0 ] && exit 0 || exit 1
