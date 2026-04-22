# Sprout OS — Performance Checklist

## Lighthouse (Production URL)

- [ ] Performance ≥ 75 (target 85+)
- [ ] Accessibility ≥ 85
- [ ] Best Practices ≥ 80
- [ ] SEO ≥ 80

Run: `bash scripts/lighthouse.sh`

## Core Web Vitals

- [ ] LCP (Largest Contentful Paint) ≤ 2.5 s
- [ ] INP (Interaction to Next Paint) ≤ 200 ms
- [ ] CLS (Cumulative Layout Shift) ≤ 0.1

## Bundle Size

- [ ] Initial JS ≤ 300 KB gzipped
- [ ] Initial CSS ≤ 100 KB gzipped
- [ ] Route-based code splitting in place
- [ ] No duplicate dependencies in bundle

## Images

- [ ] Modern formats (WebP / AVIF) served where supported
- [ ] Responsive `srcset` on hero / content images
- [ ] Below-the-fold images lazy-loaded
- [ ] No uncompressed PNGs > 200 KB

## Network

- [ ] Static assets served with `Cache-Control: max-age=31536000, immutable`
- [ ] HTML served with sensible cache headers (or SSR revalidation)
- [ ] HTTP/2 or HTTP/3 on CDN
- [ ] Brotli / gzip compression enabled

## Third-Party

- [ ] Analytics / marketing tags loaded async or deferred
- [ ] No render-blocking third-party scripts
- [ ] Third-party size budget ≤ 150 KB total

## Backend

- [ ] API p95 latency ≤ 500 ms on key endpoints
- [ ] Database queries < 100 ms on dashboard load
- [ ] CDN / edge caching for public pages

## Regression

- [ ] Current release Lighthouse scores not worse than previous by > 5 points
- [ ] Bundle size not grown > 10 % without justification
