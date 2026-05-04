#!/bin/bash
# =============================================================================
# Sprout OS Orbit — Code Quality QA
# Checks: no test.only, no hardcoded credentials, npm audit, spec coverage
#
# Usage:
#   bash scripts/qa-code-quality.sh
# =============================================================================

FAILED=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
TESTS_DIR="tests/sproutos"

echo ""
echo "========================================="
echo " Sprout OS Orbit — Code Quality QA"
echo " Started: $TIMESTAMP"
echo "========================================="
echo ""

# ── Check 1: No test.only / it.only ───────────────────────────────────────
echo "CHECK 1 — No test.only / it.only"
echo "-----------------------------------------"

ONLY_HITS=$(grep -rn "\.only(" "$TESTS_DIR" 2>/dev/null | grep -v "node_modules")

if [ -z "$ONLY_HITS" ]; then
  echo "   PASS  — No .only() calls found"
else
  echo "   FAIL  — .only() calls detected:"
  echo "$ONLY_HITS"
  FAILED=$((FAILED + 1))
fi

echo ""

# ── Check 2: No .skip silently hiding tests ───────────────────────────────
echo "CHECK 2 — .skip() usage (informational)"
echo "-----------------------------------------"

SKIP_HITS=$(grep -rn "\.skip(" "$TESTS_DIR" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

echo "   INFO  — $SKIP_HITS .skip() call(s) found (review if intentional)"
echo ""

# ── Check 3: No hardcoded credentials ─────────────────────────────────────
echo "CHECK 3 — No hardcoded credentials in spec files"
echo "-----------------------------------------"

CRED_PATTERNS=("password123" "admin123" "secret" "testpass" "letmein" "qwerty")
CRED_FOUND=false

for PATTERN in "${CRED_PATTERNS[@]}"; do
  HITS=$(grep -rni "$PATTERN" "$TESTS_DIR" 2>/dev/null | grep -v "node_modules")
  if [ -n "$HITS" ]; then
    echo "   WARN  — Potential credential pattern '$PATTERN' found:"
    echo "$HITS"
    CRED_FOUND=true
  fi
done

if [ "$CRED_FOUND" = false ]; then
  echo "   PASS  — No common credential patterns found in spec files"
fi

echo ""

# ── Check 4: npm audit ────────────────────────────────────────────────────
echo "CHECK 4 — npm audit (high/critical vulnerabilities)"
echo "-----------------------------------------"

if [ -f "package.json" ]; then
  AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1)
  AUDIT_EXIT=$?

  if [ $AUDIT_EXIT -eq 0 ]; then
    echo "   PASS  — No high/critical vulnerabilities found"
  else
    echo "   FAIL  — npm audit found high/critical issues:"
    echo "$AUDIT_OUTPUT" | tail -20
    FAILED=$((FAILED + 1))
  fi
else
  echo "   SKIP  — package.json not found"
fi

echo ""

# ── Check 5: Spec file coverage (key areas) ───────────────────────────────
echo "CHECK 5 — Spec File Coverage"
echo "-----------------------------------------"

REQUIRED_SPECS=(
  "tests/sproutos/auth.spec.js"
  "tests/sproutos/homepage.spec.js"
  "tests/sproutos/dashboard/dashboard.spec.js"
  "tests/sproutos/sitemap.spec.js"
  "tests/sproutos/design-editor.spec.js"
  "tests/sproutos/manage-overview.spec.js"
)

for SPEC in "${REQUIRED_SPECS[@]}"; do
  if [ -f "$SPEC" ]; then
    echo "   PASS  — $SPEC"
  else
    echo "   WARN  — Missing: $SPEC"
  fi
done

echo ""

# ── Check 6: No console.log left in spec files ────────────────────────────
echo "CHECK 6 — No stray console.log in spec files"
echo "-----------------------------------------"

LOG_HITS=$(grep -rn "console\.log(" "$TESTS_DIR" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

if [ "$LOG_HITS" -eq 0 ]; then
  echo "   PASS  — No console.log() found in spec files"
else
  echo "   WARN  — $LOG_HITS console.log() call(s) found (review if intentional)"
  grep -rn "console\.log(" "$TESTS_DIR" 2>/dev/null | grep -v "node_modules"
fi

echo ""

# ── Summary ───────────────────────────────────────────────────────────────
echo "========================================="
echo " CODE QUALITY SUMMARY"
echo "========================================="
echo " Completed: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

if [ $FAILED -eq 0 ]; then
  echo " ALL CODE QUALITY CHECKS PASSED"
  exit 0
else
  echo " $FAILED CHECK(S) FAILED"
  exit 1
fi
