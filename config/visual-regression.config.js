/**
 * Visual regression configuration for Sprout OS QA.
 * Defines which pages/components get screenshot-compared, per-page diff
 * thresholds, stable snapshot routes, and elements to mask before diffing.
 *
 * Playwright's built-in toHaveScreenshot() is used for comparison.
 * Snapshots stored in: tests/snapshots/
 *
 * Usage in a spec:
 *   const { getSnapshotConfig, maskSelectors } = require('../../config/visual-regression.config');
 *
 *   const cfg = getSnapshotConfig('dashboard');
 *   await expect(page).toHaveScreenshot('dashboard.png', {
 *     maxDiffPixelRatio: cfg.maxDiffPixelRatio,
 *     mask: maskSelectors(page, cfg.mask),
 *   });
 */

'use strict';

// ─── Global defaults ──────────────────────────────────────────────────────────

const defaults = {
  /**
   * Maximum fraction of pixels that may differ before the test fails.
   * 0.02 = 2% pixel diff allowed globally.
   * Override per page below for areas with dynamic content.
   */
  maxDiffPixelRatio: 0.02,

  /**
   * Pixel tolerance per channel (0-255). Pixels within this distance
   * are not counted as different.
   */
  threshold: 0.2,

  /** Wait for network idle before capturing screenshot. */
  waitForNetworkIdle: true,

  /** Delay (ms) after page settles before capturing — allows animations to finish. */
  stabilisationDelayMs: 500,

  /** Animations mode — 'disabled' freezes CSS/JS animations for stable snapshots. */
  animations: 'disabled',

  /** Caret visibility in text fields. */
  caret: 'hide',

  /** Screenshot output format. */
  format: 'png',
};

// ─── Page snapshot definitions ────────────────────────────────────────────────

/**
 * Each entry defines a page to screenshot and its comparison rules.
 *
 * Fields:
 *   key              — unique identifier, used as the snapshot filename prefix
 *   path             — route to navigate to
 *   auth             — true if login required before screenshotting
 *   viewports        — which Playwright projects to capture ('desktop' | 'tablet' | 'mobile')
 *   maxDiffPixelRatio — override for this page (default: 0.02)
 *   mask             — CSS selectors for dynamic elements to blank out before diffing
 *   skip             — true to exclude from automated runs (document reason)
 *   waitFor          — selector to wait for before capturing (page is ready signal)
 *   fullPage         — capture full scrollable page (default: false = viewport only)
 *   clip             — { x, y, width, height } to capture a specific region only
 */
const pageSnapshots = [
  // ── Public pages ─────────────────────────────────────────────────────────
  {
    key: 'homepage',
    path: '/',
    auth: false,
    viewports: ['desktop', 'tablet', 'mobile'],
    maxDiffPixelRatio: 0.02,
    mask: ['[data-testid="cookie-banner"]'],
    waitFor: 'main',
    fullPage: true,
  },
  {
    key: 'login',
    path: '/login',
    auth: false,
    viewports: ['desktop', 'mobile'],
    maxDiffPixelRatio: 0.01,
    mask: [],
    waitFor: 'form',
  },
  {
    key: 'signup',
    path: '/signup',
    auth: false,
    viewports: ['desktop', 'mobile'],
    maxDiffPixelRatio: 0.01,
    mask: [],
    waitFor: 'form',
  },

  // ── Authenticated pages ───────────────────────────────────────────────────
  {
    key: 'dashboard',
    path: '/dashboard',
    auth: true,
    viewports: ['desktop', 'tablet', 'mobile'],
    maxDiffPixelRatio: 0.05,   // project cards load async — slightly higher tolerance
    mask: [
      '[data-testid="last-updated"]',    // relative timestamps change each run
      '[data-testid="token-balance"]',   // changes with usage
      '[data-testid="trial-badge"]',     // days remaining countdown
      '[data-testid="member-avatar"]',   // user avatars from external URLs
    ],
    waitFor: '[data-testid="project-grid"]',
  },
  {
    key: 'dashboard-empty',
    path: '/dashboard',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.02,
    mask: ['[data-testid="trial-badge"]'],
    waitFor: '[data-testid="empty-state"]',
    skip: false,
  },

  // ── Sitemap editor ────────────────────────────────────────────────────────
  {
    key: 'sitemap-editor',
    path: '/scope',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.04,   // React Flow edges rendered via canvas — slight variance
    mask: [
      '.react-flow__controls',          // zoom level indicator changes
      '[data-testid="ai-suggestion-banner"]',
    ],
    waitFor: '.react-flow__renderer',
    stabilisationDelayMs: 1000,        // wait for Dagre layout to settle
  },

  // ── Design editor ─────────────────────────────────────────────────────────
  {
    key: 'design-editor',
    path: '/design',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.06,   // section templates may have image variance
    mask: [
      '[data-testid="zoom-level"]',
      '[data-testid="token-balance"]',
      'img[data-stock-image]',           // stock images change with AI selection
    ],
    waitFor: '[data-testid="canvas"]',
    stabilisationDelayMs: 1500,
  },
  {
    key: 'design-editor-tablet',
    path: '/design',
    auth: true,
    viewports: ['desktop'],            // capture the tablet iframe from desktop viewport
    maxDiffPixelRatio: 0.06,
    mask: ['img[data-stock-image]'],
    waitFor: '[data-testid="tablet-iframe"]',
    stabilisationDelayMs: 1500,
    clip: null,                         // capture full iframe area
  },

  // ── Color system ──────────────────────────────────────────────────────────
  {
    key: 'color-panel',
    path: '/design',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.01,
    mask: [],
    waitFor: '[data-testid="color-panel"]',
    clip: { selector: '[data-testid="color-panel"]' }, // panel only
  },

  // ── Team management ───────────────────────────────────────────────────────
  {
    key: 'team-management',
    path: '/team',
    auth: true,
    viewports: ['desktop', 'tablet'],
    maxDiffPixelRatio: 0.03,
    mask: [
      '[data-testid="member-avatar"]',
      '[data-testid="join-date"]',
      '[data-testid="invite-expiry"]',
    ],
    waitFor: '[data-testid="member-list"]',
  },

  // ── Token usage ───────────────────────────────────────────────────────────
  {
    key: 'token-usage',
    path: '/billing/tokens',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.04,
    mask: [
      '[data-testid="token-used"]',     // usage changes each run
      '[data-testid="token-remaining"]',
      '[data-testid="usage-table"]',    // row data changes
    ],
    waitFor: '[data-testid="token-summary"]',
  },

  // ── User settings ─────────────────────────────────────────────────────────
  {
    key: 'user-settings',
    path: '/settings',
    auth: true,
    viewports: ['desktop', 'mobile'],
    maxDiffPixelRatio: 0.02,
    mask: [
      '[data-testid="user-avatar"]',
      '[data-testid="user-email"]',
    ],
    waitFor: '[data-testid="settings-form"]',
  },

  // ── Manage Mode — Overview ────────────────────────────────────────────────
  {
    key: 'manage-overview',
    path: '/manage',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.05,
    mask: [
      '[data-testid="last-sync"]',
      '[data-testid="activity-timeline"]',
      '[data-testid="approval-count"]',
    ],
    waitFor: '[data-testid="summary-cards"]',
    stabilisationDelayMs: 800,
  },

  // ── Manage Mode — Actions ─────────────────────────────────────────────────
  {
    key: 'manage-actions',
    path: '/manage?tab=actions',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.03,
    mask: ['[data-testid="last-run"]'],
    waitFor: '[data-testid="action-library"]',
  },

  // ── Manage Mode — Build ───────────────────────────────────────────────────
  {
    key: 'manage-build',
    path: '/manage?tab=build',
    auth: true,
    viewports: ['desktop'],
    maxDiffPixelRatio: 0.03,
    mask: ['[data-testid="last-modified"]'],
    waitFor: '[data-testid="module-list"]',
  },
];

// ─── Component-level snapshots ────────────────────────────────────────────────

/**
 * Isolated component regions to snapshot (clip to a specific selector).
 * Useful for catching regressions in UI components without full-page noise.
 */
const componentSnapshots = [
  { key: 'nav-header',          selector: 'header',                          auth: false, viewports: ['desktop', 'mobile'] },
  { key: 'workspace-switcher',  selector: '[data-testid="workspace-switcher"]', auth: true,  viewports: ['desktop'] },
  { key: 'project-card',        selector: '[data-testid="project-card"]:first-child', auth: true, viewports: ['desktop'] },
  { key: 'section-variant-panel', selector: '[data-testid="variant-panel"]', auth: true,  viewports: ['desktop'] },
  { key: 'color-palette',       selector: '[data-testid="color-palette"]',   auth: true,  viewports: ['desktop'] },
  { key: 'token-progress-bar',  selector: '[data-testid="token-progress"]',  auth: true,  viewports: ['desktop'] },
  { key: 'ai-chat-panel',       selector: '[data-testid="ai-chat"]',         auth: true,  viewports: ['desktop'] },
  { key: 'manage-scan-results', selector: '[data-testid="scan-results"]',    auth: true,  viewports: ['desktop'] },
  { key: 'manage-approval-queue', selector: '[data-testid="approval-queue"]', auth: true, viewports: ['desktop'] },
];

// ─── Skip list ────────────────────────────────────────────────────────────────

/**
 * Pages/components excluded from automated visual regression.
 * These are manually reviewed instead.
 */
const skipList = [
  { key: 'guided-brief',     reason: 'Multi-step wizard state too variable for automated snapshot' },
  { key: 'ai-design-agent',  reason: 'AI responses non-deterministic — visual output changes per run' },
  { key: 'pitch-concepts',   reason: 'Color concepts generated dynamically — intentional variance' },
  { key: 'process-thread',   reason: 'Claude output text non-deterministic' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get the snapshot config for a named page.
 * Falls back to defaults for any unspecified fields.
 *
 * @param {string} key
 * @returns {object}
 */
function getSnapshotConfig(key) {
  const config = pageSnapshots.find((s) => s.key === key);
  if (!config) throw new Error(`[VR] No snapshot config for key "${key}"`);
  return { ...defaults, ...config };
}

/**
 * Build Playwright mask locators from a list of CSS selectors.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string[]} selectors
 * @returns {import('@playwright/test').Locator[]}
 */
function maskSelectors(page, selectors = []) {
  return selectors.map((sel) => page.locator(sel));
}

/**
 * Return all snapshot keys for a given viewport.
 *
 * @param {'desktop' | 'tablet' | 'mobile'} viewport
 * @returns {string[]}
 */
function getSnapshotKeysForViewport(viewport) {
  return pageSnapshots
    .filter((s) => !s.skip && s.viewports.includes(viewport))
    .map((s) => s.key);
}

/**
 * Return all snapshot definitions that require auth.
 * @returns {object[]}
 */
function getAuthSnapshots() {
  return pageSnapshots.filter((s) => s.auth && !s.skip);
}

/**
 * Return all snapshot definitions that are public (no auth needed).
 * @returns {object[]}
 */
function getPublicSnapshots() {
  return pageSnapshots.filter((s) => !s.auth && !s.skip);
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  defaults,
  pageSnapshots,
  componentSnapshots,
  skipList,
  getSnapshotConfig,
  maskSelectors,
  getSnapshotKeysForViewport,
  getAuthSnapshots,
  getPublicSnapshots,
};
