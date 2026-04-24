/**
 * axe-core configuration for Sprout OS accessibility testing.
 * Used with @axe-core/playwright in Playwright specs.
 *
 * Usage in a spec:
 *   const { AxeBuilder } = require('@axe-core/playwright');
 *   const { axeConfig, criticalImpacts } = require('../../config/axe.config');
 *
 *   const results = await new AxeBuilder({ page })
 *     .options(axeConfig)
 *     .analyze();
 */

'use strict';

// ─── Impact levels ────────────────────────────────────────────────────────────

/** Violations at these impact levels fail the test (zero-tolerance). */
const criticalImpacts = ['critical', 'serious'];

/** Violations at these levels are logged as warnings but don't fail. */
const warningImpacts = ['moderate', 'minor'];

// ─── Core axe options ────────────────────────────────────────────────────────

const axeConfig = {
  /** WCAG 2.1 Level AA — the project standard. */
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
  },

  rules: {
    // ── Rules to enable explicitly (off by default in axe) ──────────────────

    /** Ensure all page content is inside landmark regions */
    region: { enabled: true },

    /** Ensure headings are used for structure, not presentation */
    'heading-order': { enabled: true },

    /** Warn on skipped heading levels */
    'skip-link': { enabled: true },

    // ── Rules to disable (acknowledged, handled separately) ─────────────────

    /**
     * Disabled: Design editor iframes have a controlled same-origin context.
     * axe cannot scan cross-origin frames — handled manually.
     */
    'frame-tested': { enabled: false },

    /**
     * Disabled: Scrollable regions in the infinite canvas are programmatically
     * controlled and do not require a tabindex — documented exception.
     */
    'scrollable-region-focusable': { enabled: false },
  },
};

// ─── Page-specific ignore selectors ──────────────────────────────────────────

/**
 * Selectors to exclude from axe scans on specific pages.
 * These are intentional exceptions with documented reasons.
 *
 * Pass to AxeBuilder: .exclude(axeExclusions.designEditor)
 */
const axeExclusions = {
  /**
   * Design editor: third-party section templates may have contrast issues
   * that are outside SproutOS control. Templates are flagged separately
   * in the design QA process.
   */
  designEditor: ['[data-section-template]'],

  /**
   * Sitemap editor: React Flow renders SVG edges that carry no semantic
   * meaning — axe colour-contrast rules don't apply to decorative SVGs.
   */
  sitemapEditor: ['.react-flow__edge', '.react-flow__minimap'],

  /**
   * Code editor in Build tab: third-party syntax highlighting library
   * uses colour pairs that fail contrast — tracked as a known issue.
   */
  buildCodeEditor: ['.cm-editor', '.cm-content'],
};

// ─── Result helpers ───────────────────────────────────────────────────────────

/**
 * Filter axe results down to violations that should fail the test.
 * @param {import('axe-core').AxeResults} results
 * @returns {import('axe-core').Result[]}
 */
function getBlockingViolations(results) {
  return results.violations.filter((v) =>
    criticalImpacts.includes(v.impact)
  );
}

/**
 * Filter axe results to advisory violations (warn, not fail).
 * @param {import('axe-core').AxeResults} results
 * @returns {import('axe-core').Result[]}
 */
function getAdvisoryViolations(results) {
  return results.violations.filter((v) =>
    warningImpacts.includes(v.impact)
  );
}

/**
 * Format violations into a readable summary string for test output.
 * @param {import('axe-core').Result[]} violations
 * @returns {string}
 */
function formatViolations(violations) {
  if (!violations.length) return 'No violations.';
  return violations
    .map((v) => {
      const nodes = v.nodes
        .slice(0, 3)
        .map((n) => `    • ${n.target.join(' > ')}`)
        .join('\n');
      return `[${v.impact.toUpperCase()}] ${v.id}: ${v.description}\n${nodes}`;
    })
    .join('\n\n');
}

// ─── Page groups ─────────────────────────────────────────────────────────────

/**
 * Public pages that must have zero critical/serious axe violations.
 * Auth-gated pages are listed separately to allow credential-based testing.
 */
const publicPages = [
  { name: 'Homepage', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Forgot Password', path: '/forgot-password' },
];

const authPages = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Team Management', path: '/team' },
  { name: 'Token Usage', path: '/billing/tokens' },
  { name: 'User Settings', path: '/settings' },
  { name: 'Manage Overview', path: '/manage' },
];

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  axeConfig,
  axeExclusions,
  criticalImpacts,
  warningImpacts,
  getBlockingViolations,
  getAdvisoryViolations,
  formatViolations,
  publicPages,
  authPages,
};
