/**
 * Expected HTTP security headers for Sprout OS (sproutos.ai).
 * Used by Playwright security tests to validate response headers on each route.
 *
 * Usage in a spec:
 *   const { requiredHeaders, validateHeaders } = require('../../config/security-headers.config');
 *
 *   const response = await page.goto('/login');
 *   const headers = response.headers();
 *   validateHeaders(headers, expect);
 */

'use strict';

// ─── Required headers (must be present and match) ─────────────────────────────

/**
 * Each entry:
 *   header  — HTTP header name (lowercase)
 *   match   — 'contains' | 'equals' | 'exists' | 'absent'
 *   value   — expected string (for contains / equals)
 *   severity — 'error' (test fails) | 'warn' (logged, test continues)
 *   note    — human-readable explanation for QA reports
 */
const requiredHeaders = [
  // ── Transport security ──────────────────────────────────────────────────
  {
    header: 'strict-transport-security',
    match: 'contains',
    value: 'max-age=31536000',
    severity: 'error',
    note: 'HSTS must be set for at least 1 year (31536000 seconds)',
  },
  {
    header: 'strict-transport-security',
    match: 'contains',
    value: 'includeSubDomains',
    severity: 'warn',
    note: 'HSTS should include subdomains',
  },

  // ── Content type sniffing ───────────────────────────────────────────────
  {
    header: 'x-content-type-options',
    match: 'equals',
    value: 'nosniff',
    severity: 'error',
    note: 'Prevents MIME type sniffing attacks',
  },

  // ── Framing ─────────────────────────────────────────────────────────────
  {
    header: 'x-frame-options',
    match: 'contains',
    value: 'DENY',
    severity: 'warn',
    note: 'Can also be satisfied by CSP frame-ancestors directive',
  },

  // ── Referrer ─────────────────────────────────────────────────────────────
  {
    header: 'referrer-policy',
    match: 'contains',
    value: 'strict-origin',
    severity: 'warn',
    note: 'Acceptable values: strict-origin, strict-origin-when-cross-origin, no-referrer',
  },

  // ── Version leakage ───────────────────────────────────────────────────────
  {
    header: 'x-powered-by',
    match: 'absent',
    value: null,
    severity: 'error',
    note: 'x-powered-by must be removed to avoid framework fingerprinting',
  },
  {
    header: 'server',
    match: 'absent',
    value: null,
    severity: 'warn',
    note: 'server header should not expose version number',
  },
];

// ─── CSP rules (checked separately from header presence) ─────────────────────

/**
 * Minimum Content Security Policy directives.
 * Parsed from the `content-security-policy` header value.
 */
const cspRules = [
  {
    directive: 'default-src',
    must_not_contain: "'unsafe-eval'",
    severity: 'error',
    note: "unsafe-eval allows arbitrary JS execution — must not appear in default-src",
  },
  {
    directive: 'script-src',
    must_not_contain: "'unsafe-eval'",
    severity: 'error',
    note: "unsafe-eval in script-src allows XSS via eval()",
  },
  {
    directive: 'object-src',
    should_equal: "'none'",
    severity: 'warn',
    note: "object-src 'none' prevents plugin-based attacks",
  },
];

// ─── Auth-gated route cookie requirements ─────────────────────────────────────

/**
 * Cookie attributes expected on the session cookie for authenticated routes.
 * These are verified from `set-cookie` header on POST /api/auth/login response.
 */
const sessionCookieRequirements = [
  { attribute: 'HttpOnly', severity: 'error', note: 'Prevents JS access to session cookie' },
  { attribute: 'Secure', severity: 'error', note: 'Cookie only sent over HTTPS' },
  { attribute: 'SameSite', value: 'Lax', severity: 'warn', note: 'Protects against CSRF' },
];

// ─── Routes to scan ──────────────────────────────────────────────────────────

/**
 * Routes to check for security headers.
 * Public routes — no auth required.
 */
const publicRoutes = ['/', '/login', '/signup', '/forgot-password'];

/**
 * API routes that must not expose internals (checked for missing x-powered-by etc).
 */
const apiRoutes = [
  '/api/auth/login',      // POST — check on 401 response (no credentials needed to get headers)
  '/api/projects',        // GET — should return 401 for unauth (headers still checked)
  '/api/manage/sites',    // GET — should return 401 for unauth
];

// ─── Validation helper ────────────────────────────────────────────────────────

/**
 * Validate response headers against requiredHeaders rules.
 * Calls the Playwright `expect` function directly so failures appear in test output.
 *
 * @param {Record<string, string>} headers - response.headers() from Playwright
 * @param {import('@playwright/test').Expect} expect - Playwright expect
 * @param {{ warnOnly?: boolean }} options
 */
function validateHeaders(headers, expect, options = {}) {
  const { warnOnly = false } = options;
  const lowerHeaders = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  for (const rule of requiredHeaders) {
    const value = lowerHeaders[rule.header];
    const shouldFail = rule.severity === 'error' && !warnOnly;

    switch (rule.match) {
      case 'exists':
        if (shouldFail) {
          expect(value, `[SECURITY] ${rule.header}: ${rule.note}`).toBeTruthy();
        } else if (!value) {
          console.warn(`[SECURITY WARN] ${rule.header} missing — ${rule.note}`);
        }
        break;

      case 'absent':
        if (shouldFail) {
          expect(value, `[SECURITY] ${rule.header} must be absent — ${rule.note}`).toBeUndefined();
        } else if (value) {
          console.warn(`[SECURITY WARN] ${rule.header} is present — ${rule.note}`);
        }
        break;

      case 'contains':
        if (shouldFail) {
          expect(value ?? '', `[SECURITY] ${rule.header}: ${rule.note}`).toContain(rule.value);
        } else if (!value?.includes(rule.value)) {
          console.warn(`[SECURITY WARN] ${rule.header} missing "${rule.value}" — ${rule.note}`);
        }
        break;

      case 'equals':
        if (shouldFail) {
          expect(value, `[SECURITY] ${rule.header}: ${rule.note}`).toBe(rule.value);
        } else if (value !== rule.value) {
          console.warn(`[SECURITY WARN] ${rule.header} is "${value}", expected "${rule.value}" — ${rule.note}`);
        }
        break;
    }
  }
}

// ─── Rate limit helper ────────────────────────────────────────────────────────

/**
 * Routes that must have rate limiting enforced.
 * Tests will make N+1 rapid requests and expect a 429 response.
 */
const rateLimitedRoutes = [
  { path: '/api/auth/login',          method: 'POST', maxRequests: 10, windowMs: 60_000 },
  { path: '/api/auth/signup',         method: 'POST', maxRequests: 5,  windowMs: 60_000 },
  { path: '/api/auth/forgot-password',method: 'POST', maxRequests: 5,  windowMs: 60_000 },
];

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  requiredHeaders,
  cspRules,
  sessionCookieRequirements,
  publicRoutes,
  apiRoutes,
  rateLimitedRoutes,
  validateHeaders,
};
