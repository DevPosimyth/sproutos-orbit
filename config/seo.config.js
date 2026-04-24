/**
 * SEO validation rules for Sprout OS (sproutos.ai).
 * Used by Playwright SEO tests to validate meta tags, OG tags,
 * canonical URLs, and robots directives on every route.
 *
 * Usage in a spec:
 *   const { publicRoutes, seoRules, validatePageSeo } = require('../../config/seo.config');
 *
 *   for (const route of publicRoutes) {
 *     await page.goto(route.path);
 *     await validatePageSeo(page, route, expect);
 *   }
 */

'use strict';

// ─── Route definitions ────────────────────────────────────────────────────────

/**
 * Public routes — should be indexed by search engines.
 * Each has expected SEO properties for assertion.
 */
const publicRoutes = [
  {
    name: 'Homepage',
    path: '/',
    indexed: true,
    title: { minLength: 20, maxLength: 60, contains: ['Sprout OS', 'SproutOS'] },
    description: { minLength: 80, maxLength: 160 },
    og: { required: true },
    canonical: 'https://sproutos.ai/',
    h1: { required: true, count: 1 },
    structuredData: ['Organization', 'WebSite'],
  },
  {
    name: 'Login',
    path: '/login',
    indexed: false,
    title: { minLength: 10, maxLength: 60, contains: ['Log In', 'Login', 'Sign In'] },
    description: { minLength: 40, maxLength: 160 },
    og: { required: false },
    canonical: 'https://sproutos.ai/login',
    h1: { required: true, count: 1 },
    robots: 'noindex',
  },
  {
    name: 'Signup',
    path: '/signup',
    indexed: false,
    title: { minLength: 10, maxLength: 60, contains: ['Sign Up', 'Create Account', 'Get Started'] },
    description: { minLength: 40, maxLength: 160 },
    og: { required: false },
    canonical: 'https://sproutos.ai/signup',
    h1: { required: true, count: 1 },
    robots: 'noindex',
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    indexed: false,
    title: { minLength: 10, maxLength: 60, contains: ['Password', 'Reset'] },
    description: { minLength: 20, maxLength: 160 },
    og: { required: false },
    canonical: 'https://sproutos.ai/forgot-password',
    h1: { required: true, count: 1 },
    robots: 'noindex',
  },
];

/**
 * Auth-gated routes — must NOT be indexed.
 */
const authRoutes = [
  { name: 'Dashboard',       path: '/dashboard',     robots: 'noindex' },
  { name: 'Design Editor',   path: '/design',        robots: 'noindex' },
  { name: 'Sitemap Editor',  path: '/scope',         robots: 'noindex' },
  { name: 'Manage Mode',     path: '/manage',        robots: 'noindex' },
  { name: 'Team Settings',   path: '/team',          robots: 'noindex' },
  { name: 'User Settings',   path: '/settings',      robots: 'noindex' },
  { name: 'Token Usage',     path: '/billing/tokens',robots: 'noindex' },
];

// ─── Validation rules ─────────────────────────────────────────────────────────

/**
 * Global SEO rules applied to every page (public and auth-gated).
 */
const globalRules = [
  {
    id: 'title-exists',
    description: 'Page must have a <title> tag',
    severity: 'error',
    check: async (page) => {
      const title = await page.title();
      return { pass: title && title.trim().length > 0, value: title };
    },
  },
  {
    id: 'title-length',
    description: 'Title must be 10–60 characters',
    severity: 'warn',
    check: async (page) => {
      const title = await page.title();
      const len = (title || '').trim().length;
      return { pass: len >= 10 && len <= 60, value: `${len} chars` };
    },
  },
  {
    id: 'single-h1',
    description: 'Page must have exactly one <h1>',
    severity: 'error',
    check: async (page) => {
      const count = await page.locator('h1').count();
      return { pass: count === 1, value: `${count} h1 tags found` };
    },
  },
  {
    id: 'lang-attribute',
    description: '<html> must have a lang attribute',
    severity: 'error',
    check: async (page) => {
      const lang = await page.locator('html').getAttribute('lang');
      return { pass: !!lang && lang.trim().length > 0, value: lang };
    },
  },
  {
    id: 'no-lorem-ipsum',
    description: 'No lorem ipsum placeholder text in page body',
    severity: 'error',
    check: async (page) => {
      const text = await page.locator('body').innerText();
      const hasLorem = /lorem ipsum/i.test(text);
      return { pass: !hasLorem, value: hasLorem ? 'Lorem ipsum found' : 'Clean' };
    },
  },
  {
    id: 'viewport-meta',
    description: 'Page must have <meta name="viewport">',
    severity: 'error',
    check: async (page) => {
      const content = await page
        .locator('meta[name="viewport"]')
        .getAttribute('content')
        .catch(() => null);
      return { pass: !!content, value: content };
    },
  },
  {
    id: 'charset-meta',
    description: 'Page must declare charset (UTF-8)',
    severity: 'warn',
    check: async (page) => {
      const charset = await page
        .locator('meta[charset]')
        .getAttribute('charset')
        .catch(() => null);
      return { pass: charset?.toLowerCase() === 'utf-8', value: charset };
    },
  },
];

/**
 * OG tag rules — applied to public routes with og.required = true.
 */
const ogRules = [
  {
    id: 'og-title',
    property: 'og:title',
    severity: 'error',
    minLength: 10,
    maxLength: 95,
  },
  {
    id: 'og-description',
    property: 'og:description',
    severity: 'warn',
    minLength: 40,
    maxLength: 200,
  },
  {
    id: 'og-image',
    property: 'og:image',
    severity: 'error',
    mustBeAbsolute: true,
    mustBeHttps: true,
  },
  {
    id: 'og-url',
    property: 'og:url',
    severity: 'warn',
    mustBeAbsolute: true,
  },
  {
    id: 'og-type',
    property: 'og:type',
    severity: 'warn',
    allowedValues: ['website', 'article'],
  },
  {
    id: 'og-site-name',
    property: 'og:site_name',
    severity: 'warn',
    expectedValue: 'Sprout OS',
  },
];

/**
 * Twitter card rules — applied to key public routes.
 */
const twitterRules = [
  { id: 'twitter-card',        name: 'twitter:card',        severity: 'warn', allowedValues: ['summary', 'summary_large_image'] },
  { id: 'twitter-title',       name: 'twitter:title',       severity: 'warn', minLength: 10 },
  { id: 'twitter-description', name: 'twitter:description', severity: 'warn', minLength: 30 },
  { id: 'twitter-image',       name: 'twitter:image',       severity: 'warn', mustBeAbsolute: true },
];

// ─── Sitemap / robots.txt rules ───────────────────────────────────────────────

const sitemapRules = {
  url: '/sitemap.xml',
  expectedStatusCode: 200,
  contentType: 'application/xml',
  maxSizeBytes: 52_428_800,
  maxUrls: 50_000,
  mustInclude: ['https://sproutos.ai/'],
  mustExclude: ['/dashboard', '/design', '/scope', '/manage', '/settings', '/api/'],
  urlsMustBeHttps: true,
  urlsMustHaveLastmod: true,
};

const robotsTxtRules = {
  url: '/robots.txt',
  expectedStatusCode: 200,
  mustHaveSitemapDirective: true,
  expectedSitemapUrl: 'https://sproutos.ai/sitemap.xml',
  disallowedPaths: ['/dashboard', '/api/', '/design', '/scope', '/manage'],
  mustNotBlockAll: true,
};

// ─── Validation helper ────────────────────────────────────────────────────────

/**
 * Get a meta tag content value from the page.
 * Supports both name="" and property="" attributes.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} nameOrProperty
 * @returns {Promise<string|null>}
 */
async function getMetaContent(page, nameOrProperty) {
  const byName = await page
    .locator(`meta[name="${nameOrProperty}"]`)
    .getAttribute('content')
    .catch(() => null);
  if (byName) return byName;

  return page
    .locator(`meta[property="${nameOrProperty}"]`)
    .getAttribute('content')
    .catch(() => null);
}

/**
 * Run all globalRules for a page and return results.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Array<{id: string, pass: boolean, value: any, severity: string}>>}
 */
async function runGlobalRules(page) {
  const results = [];
  for (const rule of globalRules) {
    const result = await rule.check(page);
    results.push({ id: rule.id, description: rule.description, severity: rule.severity, ...result });
  }
  return results;
}

/**
 * Validate OG tags for a page using Playwright expect.
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} expect
 */
async function validateOgTags(page, expect) {
  for (const rule of ogRules) {
    const value = await getMetaContent(page, rule.property);
    if (rule.severity === 'error') {
      expect(value, `OG tag <${rule.property}> must be present`).toBeTruthy();
      if (value && rule.minLength) {
        expect(value.length, `OG <${rule.property}> too short`).toBeGreaterThanOrEqual(rule.minLength);
      }
      if (value && rule.mustBeHttps) {
        expect(value, `OG <${rule.property}> must use HTTPS`).toMatch(/^https:\/\//);
      }
    } else if (!value) {
      console.warn(`[SEO WARN] OG tag <${rule.property}> is missing`);
    }
  }
}

/**
 * Check robots meta tag for a given expected directive.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} expected - e.g. 'noindex'
 * @param {import('@playwright/test').Expect} expect
 */
async function validateRobotsMeta(page, expected, expect) {
  const content = await getMetaContent(page, 'robots');
  expect(content ?? '', `<meta name="robots"> should contain "${expected}"`).toContain(expected);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  publicRoutes,
  authRoutes,
  globalRules,
  ogRules,
  twitterRules,
  sitemapRules,
  robotsTxtRules,
  getMetaContent,
  runGlobalRules,
  validateOgTags,
  validateRobotsMeta,
};
