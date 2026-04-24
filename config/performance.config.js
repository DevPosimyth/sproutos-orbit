/**
 * Performance thresholds for Sprout OS QA.
 * Covers page load timing, API latency, Core Web Vitals, and
 * feature-specific interaction budgets.
 *
 * Used by Playwright performance tests and the Lighthouse CI config.
 * All timing values are in milliseconds unless noted.
 *
 * Usage in a spec:
 *   const { pageThresholds, apiThresholds, assertTiming } = require('../../config/performance.config');
 *
 *   const start = Date.now();
 *   await page.goto('/dashboard');
 *   assertTiming('dashboard-load', Date.now() - start, expect);
 */

'use strict';

// ─── Core Web Vitals ──────────────────────────────────────────────────────────

const coreWebVitals = {
  /** Largest Contentful Paint — how fast the main content loads */
  lcp: {
    good:    2500,   // ≤ 2.5s = Good (Google threshold)
    needs_improvement: 4000,
    poor:    4001,   // > 4s = Poor
    budget:  2500,   // test budget (must not exceed)
  },

  /** Interaction to Next Paint — responsiveness after user input */
  inp: {
    good:    200,
    needs_improvement: 500,
    poor:    501,
    budget:  200,
  },

  /** Cumulative Layout Shift — visual stability (unitless score) */
  cls: {
    good:    0.1,
    needs_improvement: 0.25,
    poor:    0.26,
    budget:  0.1,
  },

  /** First Contentful Paint — when first content appears */
  fcp: {
    good:    1800,
    needs_improvement: 3000,
    poor:    3001,
    budget:  2000,
  },

  /** Time to First Byte — server response speed */
  ttfb: {
    good:    800,
    needs_improvement: 1800,
    poor:    1801,
    budget:  600,
  },

  /** Total Blocking Time — main thread blocked during load */
  tbt: {
    good:    200,
    needs_improvement: 600,
    poor:    601,
    budget:  300,
  },
};

// ─── Page load thresholds ─────────────────────────────────────────────────────

/**
 * Maximum time (ms) from navigation start to domContentLoaded per route.
 * Measured in Playwright via page.goto() response timing.
 */
const pageThresholds = {
  '/':                   { ttfb: 600,  load: 3000, lcp: 2500 },
  '/login':              { ttfb: 400,  load: 2000, lcp: 1800 },
  '/signup':             { ttfb: 400,  load: 2000, lcp: 1800 },
  '/forgot-password':    { ttfb: 400,  load: 2000, lcp: 1800 },
  '/dashboard':          { ttfb: 600,  load: 3000, lcp: 2500 },
  '/scope':              { ttfb: 600,  load: 4000, lcp: 3000 },  // Sitemap editor — React Flow
  '/design':             { ttfb: 600,  load: 5000, lcp: 3500 },  // Design editor — heavy canvas
  '/manage':             { ttfb: 800,  load: 4000, lcp: 3000 },  // Manage Mode — MCP round-trip
  '/team':               { ttfb: 500,  load: 2500, lcp: 2000 },
  '/settings':           { ttfb: 400,  load: 2000, lcp: 1800 },
  '/billing/tokens':     { ttfb: 500,  load: 2500, lcp: 2000 },
};

// ─── API latency thresholds ───────────────────────────────────────────────────

/**
 * p95 latency budgets (ms) for key API routes.
 * Measured from request start to response end (no streaming).
 *
 * Structure:
 *   method  — HTTP method
 *   path    — route pattern (string match prefix)
 *   p50     — median target
 *   p95     — 95th percentile budget (test threshold)
 *   timeout — hard timeout before test fails
 */
const apiThresholds = [
  // ── Auth ───────────────────────────────────────────────────────────────────
  { method: 'POST', path: '/api/auth/login',           p50: 200,  p95: 500,  timeout: 5000 },
  { method: 'POST', path: '/api/auth/signup',          p50: 300,  p95: 800,  timeout: 5000 },
  { method: 'POST', path: '/api/auth/forgot-password', p50: 300,  p95: 800,  timeout: 5000 },

  // ── Projects & workspace ───────────────────────────────────────────────────
  { method: 'GET',  path: '/api/projects',             p50: 200,  p95: 500,  timeout: 5000 },
  { method: 'POST', path: '/api/projects',             p50: 300,  p95: 800,  timeout: 8000 },
  { method: 'GET',  path: '/api/workspaces',           p50: 150,  p95: 400,  timeout: 5000 },

  // ── Brief & crawl ──────────────────────────────────────────────────────────
  { method: 'POST', path: '/api/briefs',               p50: 300,  p95: 800,  timeout: 8000 },
  { method: 'POST', path: '/api/crawl',                p50: 3000, p95: 8000, timeout: 30000 }, // external fetch

  // ── AI features ────────────────────────────────────────────────────────────
  { method: 'POST', path: '/api/ai/text',              p50: 1500, p95: 4000, timeout: 15000 }, // first token
  { method: 'POST', path: '/api/ai/design',            p50: 2000, p95: 5000, timeout: 20000 },
  { method: 'POST', path: '/api/sitemap-chat',         p50: 1500, p95: 4000, timeout: 15000 },

  // ── Media ──────────────────────────────────────────────────────────────────
  { method: 'POST', path: '/api/media/upload',         p50: 500,  p95: 2000, timeout: 15000 },
  { method: 'GET',  path: '/api/media/stock',          p50: 300,  p95: 800,  timeout: 8000  },

  // ── Export ─────────────────────────────────────────────────────────────────
  { method: 'POST', path: '/api/export',               p50: 1000, p95: 3000, timeout: 15000 },

  // ── Team & roles ───────────────────────────────────────────────────────────
  { method: 'GET',  path: '/api/team',                 p50: 150,  p95: 400,  timeout: 5000  },
  { method: 'POST', path: '/api/invites',              p50: 300,  p95: 800,  timeout: 8000  },

  // ── Manage Mode ────────────────────────────────────────────────────────────
  { method: 'POST', path: '/api/manage/connect-site',  p50: 1000, p95: 3000, timeout: 15000 }, // MCP discover
  { method: 'GET',  path: '/api/manage/site-data',     p50: 500,  p95: 2000, timeout: 10000 },
  { method: 'POST', path: '/api/manage/scan',          p50: 1000, p95: 5000, timeout: 60000 }, // 60s max scan
  { method: 'GET',  path: '/api/manage/activity',      p50: 200,  p95: 500,  timeout: 5000  },
  { method: 'POST', path: '/api/manage/execute-action',p50: 2000, p95: 8000, timeout: 120000 }, // Claude + MCP
  { method: 'GET',  path: '/api/manage/actions-registry', p50: 150, p95: 400, timeout: 5000 },

  // ── Build ──────────────────────────────────────────────────────────────────
  { method: 'GET',  path: '/api/manage/build/projects',p50: 200,  p95: 500,  timeout: 5000  },
  { method: 'POST', path: '/api/manage/build/scaffold', p50: 2000, p95: 8000, timeout: 30000 }, // AI scaffold
  { method: 'GET',  path: '/api/manage/build/files',   p50: 150,  p95: 400,  timeout: 5000  },
];

// ─── Feature interaction budgets ─────────────────────────────────────────────

/**
 * Maximum time (ms) for specific user interactions measured in the browser.
 * These are DOM-level timings, not network — use performance.now() in page.evaluate().
 */
const interactionBudgets = {
  // Design editor
  'design-editor:canvas-render':         3000, // all sections visible after load
  'design-editor:variant-picker-open':    300, // variant panel slides open
  'design-editor:variant-select':         500, // section re-renders after variant pick
  'design-editor:inline-edit-open':       200, // text editor activates on click
  'design-editor:viewport-switch':        500, // desktop → tablet → mobile swap
  'design-editor:color-apply':            100, // CSS variable swap — near-instant
  'design-editor:font-apply':             300, // font swap + reflow

  // Sitemap editor
  'sitemap-editor:canvas-render':         1000, // ≤20 page nodes
  'sitemap-editor:dagre-layout':           300, // layout recalc after add/remove page
  'sitemap-editor:drag-drop':              100, // per frame during drag (≥10fps threshold)

  // AI features (first visible response after send)
  'ai-text:popup-open':                   200,
  'ai-text:first-token':                 2000,
  'ai-design:first-token':               2500,
  'ai-sitemap-chat:first-token':         2000,

  // Dashboard
  'dashboard:project-list-render':       1500, // cards visible after auth
  'dashboard:workspace-switch':          1000, // scoped data reload

  // Image picker
  'image-picker:open':                    400,
  'image-picker:stock-grid-render':      1500, // first 12 thumbnails

  // Manage Mode
  'manage:overview-render':              2000, // cached data → cards visible
  'manage:scan-first-result':            3000, // polling returns first partial result
  'manage:process-thread-first-message': 3000, // Claude starts responding
  'manage:build-file-tree-render':       1000, // ≤50 files
};

// ─── Memory budgets ───────────────────────────────────────────────────────────

/**
 * JS heap size limits (bytes) measured via CDP performance metrics.
 * Alert (warn) if heap exceeds these after 30s of usage on the page.
 */
const memoryBudgets = {
  '/dashboard':  50 * 1024 * 1024,   //  50 MB
  '/scope':      80 * 1024 * 1024,   //  80 MB — React Flow
  '/design':    150 * 1024 * 1024,   // 150 MB — canvas + iframes + Framer Motion
  '/manage':    100 * 1024 * 1024,   // 100 MB — process threads + MCP state
};

// ─── Assertion helpers ────────────────────────────────────────────────────────

/**
 * Assert a measured timing is within the budget for a named interaction.
 *
 * @param {string} key - key from interactionBudgets
 * @param {number} actualMs - measured elapsed time in ms
 * @param {import('@playwright/test').Expect} expect
 */
function assertInteractionBudget(key, actualMs, expect) {
  const budget = interactionBudgets[key];
  if (budget === undefined) {
    console.warn(`[PERF] No budget defined for "${key}" — add it to performance.config.js`);
    return;
  }
  expect(
    actualMs,
    `[PERF] "${key}" took ${actualMs}ms — budget is ${budget}ms`
  ).toBeLessThanOrEqual(budget);
}

/**
 * Assert a page load timing is within the page threshold.
 *
 * @param {string} path - route path (key in pageThresholds)
 * @param {'ttfb' | 'load' | 'lcp'} metric
 * @param {number} actualMs
 * @param {import('@playwright/test').Expect} expect
 */
function assertPageThreshold(path, metric, actualMs, expect) {
  const thresholds = pageThresholds[path];
  if (!thresholds) {
    console.warn(`[PERF] No page threshold for "${path}" — add it to performance.config.js`);
    return;
  }
  const budget = thresholds[metric];
  expect(
    actualMs,
    `[PERF] ${metric.toUpperCase()} on "${path}" was ${actualMs}ms — budget is ${budget}ms`
  ).toBeLessThanOrEqual(budget);
}

/**
 * Find the API threshold config for a given method + path.
 *
 * @param {string} method
 * @param {string} path
 * @returns {{ p50: number, p95: number, timeout: number } | null}
 */
function getApiThreshold(method, path) {
  return (
    apiThresholds.find(
      (t) => t.method === method.toUpperCase() && path.startsWith(t.path)
    ) ?? null
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  coreWebVitals,
  pageThresholds,
  apiThresholds,
  interactionBudgets,
  memoryBudgets,
  assertInteractionBudget,
  assertPageThreshold,
  getApiThreshold,
};
