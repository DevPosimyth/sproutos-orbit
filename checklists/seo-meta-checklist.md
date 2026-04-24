# Sprout OS — SEO & Meta Tags Checklist

> Covers every public and auth-gated page. Use the browser DevTools → Elements panel or `document.head` inspection. Also validate with Google's Rich Results Test and a sitemap validator.

---

## Tools to Use

| Tool | Purpose |
|---|---|
| Browser DevTools → Elements | Inspect `<head>` tags directly |
| Lighthouse SEO audit | Automated SEO score and issues |
| Google Search Console | Index coverage and crawl errors |
| [validator.w3.org/feed](https://validator.w3.org/feed/) | sitemap.xml validation |
| [metatags.io](https://metatags.io) | Open Graph preview check |
| [Rich Results Test](https://search.google.com/test/rich-results) | Structured data validation |

---

## 1. Title Tags

- [ ] Every public page has a unique `<title>` tag
- [ ] `<title>` length: 50–60 characters (not truncated in SERPs)
- [ ] Title format: `Page Name — Sprout OS` or `Sprout OS — Tagline` on homepage
- [ ] Homepage title reflects primary value proposition
- [ ] `/login` title: `Log In — Sprout OS`
- [ ] `/signup` title: `Sign Up — Sprout OS`
- [ ] Auth-gated pages (dashboard, editor) have titles meaningful to the logged-in user
- [ ] No two pages share the same `<title>`

---

## 2. Meta Description

- [ ] Every public page has a `<meta name="description">` tag
- [ ] Description length: 120–158 characters (not truncated in SERPs)
- [ ] Description is unique per page (not duplicated from title or another page)
- [ ] Description includes primary keyword and a clear value proposition
- [ ] Auth-gated pages with dynamic content have a static default description (not empty)

---

## 3. Open Graph (OG) Tags

- [ ] Every public page has `<meta property="og:title">` (matches `<title>` or optimized variant)
- [ ] Every public page has `<meta property="og:description">` (matches or improves on meta description)
- [ ] Every public page has `<meta property="og:image">` pointing to a valid, publicly accessible image
- [ ] OG image dimensions: at least 1200×630px (standard for link previews)
- [ ] OG image loads without authentication (no 401 on direct URL access)
- [ ] `<meta property="og:url">` matches the canonical URL of the page
- [ ] `<meta property="og:type">` set (`website` for most pages, `article` for blog posts)
- [ ] `<meta property="og:site_name">` set to `Sprout OS`
- [ ] Shareable pitch preview links (`/pitch/:id`) have OG tags reflecting the specific concept

---

## 4. Twitter / X Card Tags

- [ ] `<meta name="twitter:card">` set to `summary_large_image` on key pages
- [ ] `<meta name="twitter:title">` present
- [ ] `<meta name="twitter:description">` present
- [ ] `<meta name="twitter:image">` present and ≥ 1200×628px
- [ ] `<meta name="twitter:site">` set to the SproutOS Twitter handle (if applicable)

---

## 5. Canonical URL

- [ ] Every page has `<link rel="canonical" href="https://sproutos.ai/...">` with the correct absolute URL
- [ ] Canonical URL matches the page's actual URL (no wrong path)
- [ ] Paginated pages (if any) have canonical pointing to the correct page (not always page 1)
- [ ] `/login` and `/signup` have canonical tags (bots shouldn't index duplicates)

---

## 6. Robots / Indexing Directives

- [ ] Public marketing pages: no `<meta name="robots" content="noindex">` (should be indexed)
- [ ] Auth-gated pages (dashboard, editor, manage): `<meta name="robots" content="noindex, nofollow">`
- [ ] Onboarding flow pages: `noindex` (no value in SERP)
- [ ] Password reset / email verification pages: `noindex`
- [ ] Shareable pitch links (`/pitch/:id`): assess if indexable or `noindex` by design

---

## 7. `robots.txt`

- [ ] `https://sproutos.ai/robots.txt` returns HTTP 200
- [ ] `robots.txt` is valid (no syntax errors)
- [ ] `robots.txt` does not block crawling of all public pages (`Disallow: /` is not set globally)
- [ ] Auth-gated paths (`/dashboard`, `/scope`, `/design`, `/manage`) listed under `Disallow`
- [ ] API paths (`/api/`) listed under `Disallow`
- [ ] `Sitemap:` directive points to `https://sproutos.ai/sitemap.xml`
- [ ] No assets critical for Googlebot rendering are blocked

---

## 8. `sitemap.xml`

- [ ] `https://sproutos.ai/sitemap.xml` returns HTTP 200
- [ ] `sitemap.xml` is valid XML (passes W3C sitemap validator)
- [ ] All public pages are listed (homepage, login, signup, blog, landing pages)
- [ ] Auth-gated pages are NOT listed in the sitemap
- [ ] All URLs use HTTPS (not HTTP)
- [ ] `<lastmod>` dates are present and accurate
- [ ] `<changefreq>` and `<priority>` set appropriately (not all set to `1.0`)
- [ ] Sitemap does not exceed 50,000 URLs or 50MB (use sitemap index if needed)
- [ ] Sitemap submitted to Google Search Console

---

## 9. Structured Data (JSON-LD)

- [ ] Homepage: `Organization` schema with name, URL, logo, social profiles
- [ ] Homepage: `WebSite` schema with `SearchAction` (if search is available)
- [ ] Blog posts (if any): `Article` schema with `headline`, `datePublished`, `author`
- [ ] No structured data validation errors in Google's Rich Results Test
- [ ] JSON-LD in `<script type="application/ld+json">` tags (not inline or microdata)
- [ ] SproutOS logo URL in `Organization` schema is publicly accessible

---

## 10. Heading Structure (SEO Signal)

- [ ] Homepage `<h1>` reflects primary keyword / value proposition
- [ ] Each public page has exactly one `<h1>`
- [ ] `<h2>` tags used for major sections (secondary keywords where natural)
- [ ] No `<h1>` used inside dynamic/auth-gated content that bots can't see

---

## 11. Image SEO

- [ ] All meaningful images on public pages have descriptive `alt` text
- [ ] `alt` text includes keywords where naturally relevant (not keyword-stuffed)
- [ ] Images on public pages served in modern formats (WebP / AVIF) for performance
- [ ] Images have explicit `width` and `height` attributes to prevent CLS

---

## 12. URL Structure

- [ ] URLs are clean, lowercase, and use hyphens (not underscores)
- [ ] No session tokens or user IDs in public-facing URLs
- [ ] URL slugs are meaningful (e.g., `/features/design-editor`, not `/p?id=123`)
- [ ] 301 redirect in place: `http://sproutos.ai` → `https://sproutos.ai`
- [ ] 301 redirect: `www.sproutos.ai` → `sproutos.ai` (or vice versa, consistently)
- [ ] No orphan pages: all public pages linked from at least one other page or sitemap

---

## 13. Hreflang (if multilingual)

- [ ] If multiple language versions exist: `<link rel="alternate" hreflang="...">` tags present
- [ ] Hreflang tags include `x-default` for the default language
- [ ] Hreflang URLs are absolute and return 200

---

## 14. Page Speed & Core Web Vitals (SEO Ranking Factors)

- [ ] LCP (Largest Contentful Paint) ≤ 2.5s on public pages
- [ ] INP (Interaction to Next Paint) ≤ 200ms
- [ ] CLS (Cumulative Layout Shift) ≤ 0.1
- [ ] Hero image on homepage has `rel="preload"` or is included in `<head>` for fast LCP
- [ ] Fonts preloaded with `<link rel="preload" as="font">` for critical fonts

---

## 15. Internal Linking

- [ ] Homepage links to key product pages (features, pricing, login, signup)
- [ ] Footer links include Privacy Policy and Terms of Service (important for trust)
- [ ] No broken internal links (404s on any internal `<a href>`)
- [ ] No `<a>` tags with empty `href=""` or `href="#"` on public pages

---

## 16. Public Pages to Verify (Checklist Per Page)

For each public page, verify:
- [ ] Homepage (`/`)
- [ ] Login (`/login`)
- [ ] Signup (`/signup`)
- [ ] Forgot Password (`/forgot-password`)
- [ ] Features page (if exists)
- [ ] Pricing page (if exists)
- [ ] Blog index (if exists)
- [ ] Blog posts (if exist)
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Shareable pitch preview (`/pitch/:id`)

> Auth-gated pages (dashboard, editor, manage) should be `noindex` and excluded from sitemap.

---

## 17. Verification Tags

- [ ] Google Search Console verification tag present in `<head>` (or via DNS/file method)
- [ ] No duplicate or stale verification tags from old accounts
