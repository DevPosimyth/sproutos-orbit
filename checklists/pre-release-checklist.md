# Sprout OS — Pre-Release Checklist

> Run every item before tagging a release / deploying to production.

---

## Code & Build

- [ ] All CI checks green on main branch
- [ ] Version number bumped in `package.json`, git tag, and release notes
- [ ] Build output is reproducible (clean `npm install && npm run build` passes)
- [ ] No `console.log` / debug statements in production build
- [ ] Environment variables documented in `.env.example`

## Auth

- [ ] Login with valid credentials → dashboard
- [ ] Login with invalid credentials → clean error message
- [ ] Signup flow end-to-end (including email verification)
- [ ] Forgot password → email received → reset → login
- [ ] OAuth (Google/GitHub) flows complete successfully
- [ ] Session expiry redirects to login
- [ ] Logout clears session fully

## Dashboard

- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Authenticated user sees their own data (no cross-tenant leak)
- [ ] Profile / settings pages load and save

## Pricing / Billing

- [ ] All pricing tiers displayed with correct prices
- [ ] Monthly / yearly toggle works (if applicable)
- [ ] Stripe / payment checkout flow completes
- [ ] Subscription upgrade / downgrade works
- [ ] Receipts emailed correctly

## Performance

- [ ] Lighthouse performance ≥ 75 (target: 85+) on landing, login, dashboard
- [ ] No unused 3rd-party scripts
- [ ] JS bundle size not increased > 10 % vs previous release
- [ ] Core Web Vitals (LCP, CLS, INP) within Google thresholds

## Security

- [ ] HSTS header set with `max-age ≥ 31536000`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options` or CSP `frame-ancestors` set
- [ ] `Referrer-Policy` set to `strict-origin-when-cross-origin` or stricter
- [ ] No platform version leaked in `Server` or `X-Powered-By`
- [ ] HTTP → HTTPS redirect works on all origins
- [ ] Rate limiting active on `/login`, `/signup`, `/forgot-password`
- [ ] SQL injection / XSS spot-checks on user inputs

## Accessibility

- [ ] axe-core: 0 critical / serious violations on key pages
- [ ] All interactive elements keyboard-reachable
- [ ] Color contrast ≥ AA on text
- [ ] Forms have proper `<label>` associations

## SEO

- [ ] Meta title & description on every public page
- [ ] Canonical URL on every page
- [ ] Open Graph (og:title, og:description, og:image) set
- [ ] `robots.txt` and `sitemap.xml` accessible
- [ ] 404 page returns proper 404 status

## Monitoring

- [ ] Error tracking (Sentry / similar) receiving events
- [ ] Uptime monitoring green on all critical endpoints
- [ ] Log aggregation shows no post-deploy error spikes

## Documentation

- [ ] Changelog / release notes written and published
- [ ] User-facing docs updated for new features
- [ ] API reference updated (if endpoints changed)

---

## Sign-off

- [ ] QA approved
- [ ] Engineering approved
- [ ] Product approved
- [ ] Released to production

**Released by:** _____________  **Date:** __________  **Version:** _________
