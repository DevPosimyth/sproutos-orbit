#!/bin/bash
# =============================================================================
# Sprout OS — Dashboard Test Runner + Auto Bug Report
# Runs ONLY dashboard tests (desktop, 3 workers) then writes docs/dashboard-qa-report.md
#
# Usage: bash scripts/dashboard-report.sh [--feature <name>] [--workers <n>]
#        npm run dashboard:report
#
# Options:
#   --feature <name>   Run only tests whose path/title matches this pattern
#   --workers <n>      Playwright worker count (default: 3)
#   --headed           Run in headed (visible) browser mode
# =============================================================================

# Load .env
if [ -f .env ]; then
  set -a
  source .env 2>/dev/null || true
  set +a
fi

BASE_URL="${SPROUTOS_URL:-https://sproutos.ai}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
JSON_OUT="reports/playwright-results.json"
BUG_REPORT="docs/dashboard-qa-report.md"
WORKERS=3
PW_HEADED=""
GREP_FILTER=""

# ── Parse args ────────────────────────────────────────────────────────────────
i=1
while [ $i -le $# ]; do
  arg="${!i}"
  case $arg in
    --workers)  i=$((i+1)); WORKERS="${!i}" ;;
    --headed)   PW_HEADED="--headed" ;;
    --feature)  i=$((i+1)); GREP_FILTER="${!i}" ;;
  esac
  i=$((i+1))
done

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

mkdir -p reports docs

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   Sprout OS — Dashboard QA + Bug Report              ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo -e "   Target  : ${CYAN}$BASE_URL${NC}"
echo -e "   Started : $TIMESTAMP"
echo -e "   Workers : $WORKERS"
[ -n "$GREP_FILTER" ] && echo -e "   Filter  : ${CYAN}$GREP_FILTER${NC}"
echo ""

# ── Credential check ──────────────────────────────────────────────────────────
if [ -z "${TEST_USER_EMAIL:-}" ] || [ -z "${TEST_USER_PASSWORD:-}" ]; then
  echo -e "${YELLOW}  ⚠ TEST_USER_EMAIL / TEST_USER_PASSWORD not set — auth tests may skip${NC}"
fi

# ── Build grep flag ───────────────────────────────────────────────────────────
GREP_FLAG=""
[ -n "$GREP_FILTER" ] && GREP_FLAG="--grep $GREP_FILTER"

# ── Run dashboard tests ───────────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}Running dashboard tests (desktop · $WORKERS workers)...${NC}"

npx playwright test tests/sproutos/dashboard/ \
  --project=sproutos-desktop \
  --workers="$WORKERS" \
  $PW_HEADED \
  $GREP_FLAG \
  --reporter=list,json \
  --output-file="$JSON_OUT" 2>&1

PW_EXIT=$?

echo ""
echo -e "${CYAN}${BOLD}Generating bug report...${NC}"

# ── Parse JSON → Bug Report ───────────────────────────────────────────────────
BUG_COUNT=0
if [ -f "$JSON_OUT" ] && command -v node &>/dev/null; then

  BUG_COUNT=$(node - "$JSON_OUT" "$BUG_REPORT" "$BASE_URL" "$TIMESTAMP" <<'JSEOF'
const fs = require('fs');
const [,, jsonFile, outFile, baseUrl, timestamp] = process.argv;

let raw;
try { raw = JSON.parse(fs.readFileSync(jsonFile, 'utf8')); }
catch (e) { console.error('Could not parse JSON:', e.message); process.exit(0); }

function flattenTests(suite, parents = []) {
  const results = [];
  const title = suite.title || '';
  const chain = title ? [...parents, title] : parents;
  for (const t of (suite.tests || [])) results.push({ ...t, suitePath: chain });
  for (const s of (suite.suites || [])) results.push(...flattenTests(s, chain));
  return results;
}

const allTests = [];
for (const suite of (raw.suites || [])) allTests.push(...flattenTests(suite));

const failed  = allTests.filter(t => t.status === 'failed' || t.status === 'unexpected');
const passed  = allTests.filter(t => t.status === 'expected' || t.status === 'passed').length;
const skipped = allTests.filter(t => t.status === 'skipped').length;
const total   = allTests.length;

if (failed.length === 0) {
  fs.writeFileSync(outFile,
    `# Sprout OS — Dashboard QA Bug Report\n` +
    `**Date:** ${timestamp}  |  **Target:** ${baseUrl}\n\n---\n\n` +
    `## ✅ All Tests Passed\n\nNo failures detected in this run.\n` +
    `\n**${passed} passed · 0 failed · ${skipped} skipped / ${total} total**\n`
  );
  console.log('0');
  process.exit(0);
}

function getPriority(suitePath, title) {
  const ctx = [...suitePath, title].join(' ').toLowerCase();
  if (/auth gat|unauthenticated|csrf|xss|session cookie|clickjack|bearer.*token|password.*log/i.test(ctx)) return 'CRITICAL';
  if (/security|console error|paddle|invited|guided brief|spin up|not clickable|blocked|not found|broken|mcp|manage mode/i.test(ctx)) return 'HIGH';
  if (/performance|load time|api health|polling|navigation|click|hover|3-dot|member list|create.manage|workspace/i.test(ctx)) return 'MEDIUM';
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
  const area = suitePath
    .filter(s => !s.includes('sproutos-') && !s.includes('.spec'))
    .join(' > ');
  return `1. Log in to ${baseUrl}\n` +
         `2. Navigate to: **${area || 'Dashboard'}**\n` +
         `3. Perform the action: "${title}"\n` +
         `4. Observe the result`;
}

const priority_order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const grouped = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
for (const t of failed) grouped[getPriority(t.suitePath, t.title)].push(t);

const lines = [];
const runDate = timestamp.split('_')[0];

lines.push(`# Sprout OS — Dashboard QA Bug Report`);
lines.push(`**Date:** ${runDate}  |  **Target:** ${baseUrl}  |  **Run:** ${timestamp}`);
lines.push(`**Result:** ${passed} passed · ${failed.length} failed · ${skipped} skipped / ${total} total`);
lines.push('');
lines.push('---');
lines.push('');

let bugNum = 0;
for (const priority of priority_order) {
  const bugs = grouped[priority];
  if (bugs.length === 0) continue;
  lines.push(`## ${priority} Priority — ${bugs.length} Issue${bugs.length > 1 ? 's' : ''}`);
  lines.push('');

  for (const t of bugs) {
    bugNum++;
    const suite = t.suitePath
      .filter(s => !s.includes('sproutos-') && !s.includes('.spec'))
      .join(' › ');

    lines.push(`### BUG-${String(bugNum).padStart(2,'0')} · ${priority}`);
    lines.push(`**Bug Short Name:** ${t.title}`);
    lines.push(`**Suite:** ${suite}`);
    lines.push('');
    lines.push(`**Issue:**`);
    lines.push(getError(t));
    lines.push('');
    lines.push(`**Steps to Reproduce:**`);
    lines.push(getSteps(t.suitePath, t.title));
    lines.push('');
    lines.push(`**Expected Result:**`);
    lines.push(`"${t.title}" should work correctly without error.`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }
}

lines.push(`*Auto-generated by Sprout OS Orbit QA · ${runDate}*`);
fs.writeFileSync(outFile, lines.join('\n'));
console.log(String(bugNum));
JSEOF
  )

else
  echo -e "${YELLOW}  ⚠ JSON output not found — bug report skipped${NC}"
fi

# ── Final output ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║                    DONE                              ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "${BUG_COUNT:-0}" = "0" ]; then
  echo -e "  ${GREEN}${BOLD}✅ No bugs found — all tests passed.${NC}"
else
  echo -e "  ${RED}${BOLD}❌ $BUG_COUNT bug(s) found.${NC}"
fi

echo ""
echo -e "  Bug report : ${CYAN}$BUG_REPORT${NC}"
echo ""

[ "$PW_EXIT" = "0" ] && exit 0 || exit 1
