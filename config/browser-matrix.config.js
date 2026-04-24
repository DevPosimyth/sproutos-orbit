/**
 * Cross-browser test matrix for Sprout OS.
 * Defines all browser/device combinations, priority tiers, and
 * which feature groups each combination must cover.
 *
 * This config is consumed by Playwright test helpers and CI scripts
 * to decide which browsers to run for a given test run type.
 *
 * Usage:
 *   const { getBrowsersForTier, desktopBrowsers } = require('../../config/browser-matrix.config');
 */

'use strict';

// ─── Browser definitions ──────────────────────────────────────────────────────

const desktopBrowsers = [
  {
    name: 'chrome',
    label: 'Chrome (latest)',
    engine: 'Blink',
    playwrightProject: 'sproutos-desktop',
    priority: 1,
    tier: 'p1',
    viewport: { width: 1440, height: 900 },
  },
  {
    name: 'safari',
    label: 'Safari (latest, macOS)',
    engine: 'WebKit',
    playwrightProject: 'sproutos-safari-desktop',
    priority: 2,
    tier: 'p1',
    viewport: { width: 1440, height: 900 },
    knownIssues: [
      'Clipboard API requires user gesture — invite copy tested via keyboard shortcut fallback',
      'CSS backdrop-filter: verify panel blur renders',
      'iframe cross-origin: verify CSS variable sync does not throw SecurityError',
    ],
  },
  {
    name: 'firefox',
    label: 'Firefox (latest)',
    engine: 'Gecko',
    playwrightProject: 'sproutos-firefox-desktop',
    priority: 3,
    tier: 'p2',
    viewport: { width: 1440, height: 900 },
    knownIssues: [
      'dnd-kit drag events may behave differently — verify section reorder in sitemap + design editor',
      'Clipboard write permission prompt may appear — handled in test setup',
    ],
  },
  {
    name: 'edge',
    label: 'Edge (latest, Chromium)',
    engine: 'Blink',
    playwrightProject: 'sproutos-edge-desktop',
    priority: 4,
    tier: 'p2',
    viewport: { width: 1440, height: 900 },
    notes: 'Chromium-based — Chrome results largely apply. Focus on Edge-specific extension interference.',
  },
];

const mobileDevices = [
  {
    name: 'chrome-android',
    label: 'Chrome for Android',
    engine: 'Blink',
    playwrightProject: 'sproutos-mobile',
    priority: 1,
    tier: 'p1',
    device: 'Pixel 5',
    viewport: { width: 375, height: 812 },
    userAgent: 'Chrome Android',
  },
  {
    name: 'safari-ios',
    label: 'Safari for iOS (iPhone)',
    engine: 'WebKit',
    playwrightProject: 'sproutos-safari-mobile',
    priority: 2,
    tier: 'p1',
    device: 'iPhone 12',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mobile Safari',
    knownIssues: [
      'Input zoom: font-size < 16px triggers iOS auto-zoom — verify all inputs ≥ 16px',
      'Position: fixed elements may flicker during scroll on older iOS WebKit',
      'File upload: verify <input type="file"> triggers native picker correctly',
    ],
  },
];

const tabletDevices = [
  {
    name: 'ipad-safari',
    label: 'Safari on iPad (portrait)',
    engine: 'WebKit',
    playwrightProject: 'sproutos-tablet',
    priority: 1,
    tier: 'p1',
    device: 'iPad (gen 7)',
    viewport: { width: 768, height: 1024 },
  },
  {
    name: 'ipad-safari-landscape',
    label: 'Safari on iPad (landscape)',
    engine: 'WebKit',
    playwrightProject: 'sproutos-tablet-landscape',
    priority: 2,
    tier: 'p2',
    device: 'iPad (gen 7) landscape',
    viewport: { width: 1024, height: 768 },
  },
];

// ─── Priority tiers ───────────────────────────────────────────────────────────

/**
 * P1 — Must pass before every release.
 * P2 — Must pass before major releases and sprint reviews.
 * P3 — Best-effort; tracked but non-blocking.
 */
const tiers = {
  p1: {
    label: 'P1 — Release blocker',
    description: 'Must be green before any production deploy',
    browsers: [...desktopBrowsers, ...mobileDevices, ...tabletDevices]
      .filter((b) => b.tier === 'p1')
      .map((b) => b.name),
  },
  p2: {
    label: 'P2 — Sprint gate',
    description: 'Must be green before major releases',
    browsers: [...desktopBrowsers, ...mobileDevices, ...tabletDevices]
      .filter((b) => b.tier === 'p2')
      .map((b) => b.name),
  },
};

// ─── Feature group → browser coverage map ────────────────────────────────────

/**
 * Which browser combinations must be verified per feature group.
 * Groups align with the test spec files in tests/sproutos/.
 */
const featureCoverage = {
  'auth':              ['chrome', 'safari', 'firefox', 'edge', 'chrome-android', 'safari-ios'],
  'onboarding':        ['chrome', 'safari', 'chrome-android', 'safari-ios'],
  'dashboard':         ['chrome', 'safari', 'firefox', 'edge'],
  'projects':          ['chrome', 'safari', 'firefox'],
  'guided-brief':      ['chrome', 'safari', 'firefox', 'chrome-android'],
  'sitemap-editor':    ['chrome', 'safari', 'firefox', 'ipad-safari'],
  'sitemap-chat':      ['chrome', 'safari'],
  'design-editor':     ['chrome', 'safari', 'firefox', 'edge', 'ipad-safari'],
  'design-iframes':    ['chrome', 'safari', 'firefox'],
  'colors':            ['chrome', 'safari', 'firefox'],
  'typography':        ['chrome', 'safari', 'firefox'],
  'ai-text':           ['chrome', 'safari', 'chrome-android'],
  'images':            ['chrome', 'safari', 'firefox', 'chrome-android', 'safari-ios'],
  'ai-design':         ['chrome', 'safari'],
  'export':            ['chrome', 'safari', 'firefox', 'edge'],
  'team':              ['chrome', 'safari', 'firefox'],
  'roles':             ['chrome', 'safari'],
  'tokens':            ['chrome', 'safari'],
  'settings':          ['chrome', 'safari', 'firefox', 'chrome-android', 'safari-ios'],
  'manage-overview':   ['chrome', 'safari'],
  'manage-actions':    ['chrome', 'safari'],
  'manage-build':      ['chrome', 'safari', 'firefox'],
  'manage-connectors': ['chrome', 'safari'],
  'seo-meta':          ['chrome', 'firefox'],
  'security-headers':  ['chrome'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const allBrowsers = [...desktopBrowsers, ...mobileDevices, ...tabletDevices];

/**
 * Return all browser definitions for a given tier.
 * @param {'p1' | 'p2'} tier
 * @returns {Array}
 */
function getBrowsersForTier(tier) {
  return allBrowsers.filter((b) => b.tier === tier);
}

/**
 * Return browser definitions required for a given feature group.
 * @param {string} featureGroup
 * @returns {Array}
 */
function getBrowsersForFeature(featureGroup) {
  const names = featureCoverage[featureGroup] ?? tiers.p1.browsers;
  return allBrowsers.filter((b) => names.includes(b.name));
}

/**
 * Return all Playwright project names for use in --project= flag.
 * @param {'p1' | 'p2' | 'all'} tier
 * @returns {string[]}
 */
function getPlaywrightProjects(tier = 'p1') {
  const browsers = tier === 'all' ? allBrowsers : getBrowsersForTier(tier);
  return [...new Set(browsers.map((b) => b.playwrightProject))];
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  desktopBrowsers,
  mobileDevices,
  tabletDevices,
  allBrowsers,
  tiers,
  featureCoverage,
  getBrowsersForTier,
  getBrowsersForFeature,
  getPlaywrightProjects,
};
