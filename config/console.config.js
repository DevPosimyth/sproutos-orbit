/**
 * Console message rules for Sprout OS QA.
 * Defines which browser console messages are errors, warnings, or allowed.
 * Used by Playwright specs to assert zero-error policy per feature area.
 *
 * Usage in a spec:
 *   const { attachConsoleListener, assertNoBlockingErrors } = require('../../config/console.config');
 *
 *   test('no console errors on dashboard', async ({ page }) => {
 *     const listener = attachConsoleListener(page);
 *     await page.goto('/dashboard');
 *     assertNoBlockingErrors(listener.messages, expect);
 *   });
 */

'use strict';

// ─── Message severity classification ─────────────────────────────────────────

/**
 * Console message types that block a test (must be zero).
 */
const blockingTypes = ['error'];

/**
 * Console message types logged as warnings (non-blocking).
 */
const warningTypes = ['warning', 'warn'];

// ─── Global allow-list ────────────────────────────────────────────────────────

/**
 * Patterns that are always allowed regardless of page or feature.
 * Matched against the full console message string.
 *
 * Add entries only with a documented reason — do not use as a catch-all.
 */
const globalAllowlist = [
  // Next.js development mode notices (not present in production builds)
  { pattern: /^\[Fast Refresh\]/,           reason: 'Next.js dev-only HMR notice' },
  { pattern: /^\[HMR\]/,                    reason: 'Next.js dev-only HMR notice' },

  // Google Fonts preconnect hint — browser logs a benign notice
  { pattern: /fonts\.googleapis\.com.*preconnect/i, reason: 'Google Fonts preconnect advisory' },

  // Mixpanel initialisation — logs one info message on load
  { pattern: /Mixpanel.*initialized/i,      reason: 'Mixpanel init confirmation — informational only' },

  // React DevTools suggestion (dev builds only)
  { pattern: /Download the React DevTools/i, reason: 'React DevTools suggestion — dev only' },

  // axe-core injected by @axe-core/playwright during a11y testing
  { pattern: /axe/i,                        reason: 'axe-core accessibility runner output' },
];

// ─── Global block-list ────────────────────────────────────────────────────────

/**
 * Patterns that always fail regardless of page — even if message type is "warning".
 * These indicate serious issues that must be fixed before release.
 */
const globalBlocklist = [
  { pattern: /CORS/i,                          reason: 'CORS error indicates a missing or wrong API origin config' },
  { pattern: /Mixed Content/i,                 reason: 'HTTP resource on HTTPS page — security risk' },
  { pattern: /refused to connect/i,            reason: 'CSP or firewall blocking a resource' },
  { pattern: /net::ERR_/,                      reason: 'Network error — a resource failed to load' },
  { pattern: /Uncaught \(in promise\)/,        reason: 'Unhandled promise rejection' },
  { pattern: /Unhandled Rejection/i,           reason: 'Unhandled promise rejection' },
  { pattern: /Cannot read propert/i,           reason: 'Null/undefined access — likely a runtime bug' },
  { pattern: /is not a function/,              reason: 'TypeError — method called on wrong type' },
  { pattern: /ChunkLoadError/,                 reason: 'Next.js lazy chunk failed to load — deployment issue' },
  { pattern: /Failed to fetch dynamically imported module/i, reason: 'Lazy route chunk load failure' },
  { pattern: /Warning: Each child in a list should have a unique "key"/i, reason: 'React key warning — causes reconciliation bugs' },
  { pattern: /Warning: Can't perform a React state update on an unmounted component/i, reason: 'Memory leak — missing cleanup in useEffect' },
  { pattern: /Warning: validateDOMNesting/i,   reason: 'Invalid HTML nesting — causes rendering bugs' },
  { pattern: /Objects are not valid as a React child/i, reason: 'Rendering an object directly — likely a data bug' },
];

// ─── Feature-area specific rules ─────────────────────────────────────────────

/**
 * Per-feature allow/block rules.
 * These are additive — combined with globalAllowlist / globalBlocklist.
 */
const featureRules = {
  'design-editor': {
    allow: [
      // React Flow logs layout calculations in development
      { pattern: /ReactFlow/i, reason: 'React Flow internal logging — dev only' },
    ],
    block: [
      // iframes must not throw cross-origin security errors
      { pattern: /SecurityError.*frame/i, reason: 'iframe cross-origin violation — CSS sync broken' },
    ],
  },

  'sitemap-editor': {
    allow: [
      { pattern: /ReactFlow/i,    reason: 'React Flow internal logging — dev only' },
      { pattern: /dagre/i,        reason: 'Dagre layout engine verbose logging — dev only' },
    ],
    block: [],
  },

  'ai-text': {
    allow: [],
    block: [
      // AI popup must not throw when token balance is 0 — should show UI state instead
      { pattern: /token.*undefined/i, reason: 'Token value undefined — gate check failed silently' },
    ],
  },

  'manage-mode': {
    allow: [
      // MCP JSON-RPC may log protocol-level debug info in staging
      { pattern: /JSON-RPC/i,       reason: 'MCP protocol debug log — staging only, must be off in prod' },
    ],
    block: [
      // Credentials must never appear in console
      { pattern: /password/i,       reason: 'Password value logged — critical security violation' },
      { pattern: /application.password/i, reason: 'WP Application Password logged — critical security violation' },
      { pattern: /apiKey/i,         reason: 'API key logged — critical security violation' },
    ],
  },

  'auth': {
    allow: [],
    block: [
      // Auth tokens must never be logged
      { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/i, reason: 'Bearer token logged — critical security violation' },
      { pattern: /session.*token/i,                   reason: 'Session token logged — security violation' },
    ],
  },

  'images': {
    allow: [
      // Stock image provider may log CDN cache status info
      { pattern: /cache.*hit/i,   reason: 'CDN cache status info from image provider' },
      { pattern: /cache.*miss/i,  reason: 'CDN cache status info from image provider' },
    ],
    block: [],
  },
};

// ─── Network error rules ──────────────────────────────────────────────────────

/**
 * HTTP status codes that are always a test failure when returned
 * by same-origin requests during a normal user flow.
 */
const blockingStatusCodes = [500, 502, 503, 504];

/**
 * Status codes expected in specific scenarios (not treated as failures).
 */
const expectedStatusCodes = [
  { path: '/api/auth/login',   method: 'POST', status: 401, scenario: 'Invalid credentials' },
  { path: '/api/projects',     method: 'GET',  status: 401, scenario: 'Unauthenticated access' },
  { path: '/api/manage/sites', method: 'GET',  status: 401, scenario: 'Unauthenticated access' },
  { path: '/api/export/react', method: 'POST', status: 403, scenario: 'Plan-gated export on FREE plan' },
];

// ─── Listener helper ──────────────────────────────────────────────────────────

/**
 * Attach a console message collector to a Playwright page.
 * Call this before navigating — captures all messages during the test.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [feature] - optional feature key from featureRules
 * @returns {{ messages: Array<{type: string, text: string}> }}
 */
function attachConsoleListener(page, feature) {
  const messages = [];

  page.on('console', (msg) => {
    messages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    messages.push({ type: 'error', text: err.message });
  });

  return { messages, feature };
}

// ─── Assertion helper ─────────────────────────────────────────────────────────

/**
 * Assert no blocking console messages were captured.
 * Checks globalBlocklist + feature-specific block rules.
 * Skips messages matched by globalAllowlist + feature allow rules.
 *
 * @param {Array<{type: string, text: string}>} messages
 * @param {import('@playwright/test').Expect} expect
 * @param {string} [feature]
 */
function assertNoBlockingErrors(messages, expect, feature) {
  const featureAllow = featureRules[feature]?.allow ?? [];
  const featureBlock = featureRules[feature]?.block ?? [];
  const allAllow = [...globalAllowlist, ...featureAllow];
  const allBlock = [...globalBlocklist, ...featureBlock];

  const violations = [];

  for (const msg of messages) {
    const isBlockingType = blockingTypes.includes(msg.type);
    const isAllowed = allAllow.some((r) => r.pattern.test(msg.text));
    const isForcedBlock = allBlock.some((r) => r.pattern.test(msg.text));

    if (isAllowed && !isForcedBlock) continue;
    if (isBlockingType || isForcedBlock) {
      violations.push(`[${msg.type.toUpperCase()}] ${msg.text}`);
    }
  }

  expect(
    violations,
    `Console errors detected:\n${violations.join('\n')}`
  ).toHaveLength(0);
}

/**
 * Collect only warning-level messages (non-blocking but worth logging).
 *
 * @param {Array<{type: string, text: string}>} messages
 * @param {string} [feature]
 * @returns {string[]}
 */
function getAdvisoryMessages(messages, feature) {
  const featureAllow = featureRules[feature]?.allow ?? [];
  const allAllow = [...globalAllowlist, ...featureAllow];

  return messages
    .filter((m) => warningTypes.includes(m.type))
    .filter((m) => !allAllow.some((r) => r.pattern.test(m.text)))
    .map((m) => `[WARN] ${m.text}`);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  blockingTypes,
  warningTypes,
  globalAllowlist,
  globalBlocklist,
  featureRules,
  blockingStatusCodes,
  expectedStatusCodes,
  attachConsoleListener,
  assertNoBlockingErrors,
  getAdvisoryMessages,
};
