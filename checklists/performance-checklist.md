# Sprout OS — Performance Checklist

---

## Lighthouse (Production URL)

Run: `bash scripts/lighthouse.sh`

- [ ] Performance ≥ 75 (target 85+) on `/` (homepage)
- [ ] Performance ≥ 75 (target 80+) on `/login`
- [ ] Performance ≥ 65 (target 75+) on `/dashboard` (authenticated, data-heavy)
- [ ] Accessibility ≥ 85 on all key pages
- [ ] Best Practices ≥ 80 on all key pages
- [ ] SEO ≥ 80 on all public pages

---

## Core Web Vitals

- [ ] LCP (Largest Contentful Paint) ≤ 2.5s on homepage and login
- [ ] INP (Interaction to Next Paint) ≤ 200ms on design editor interactions
- [ ] CLS (Cumulative Layout Shift) ≤ 0.1 on all pages (no layout jumps during load)
- [ ] TTFB (Time to First Byte) ≤ 600ms for server-rendered pages

---

## Bundle Size

- [ ] Initial JS ≤ 300 KB gzipped
- [ ] Initial CSS ≤ 100 KB gzipped
- [ ] Route-based code splitting in place (design editor, manage mode loaded lazily)
- [ ] No duplicate dependencies in bundle (`npm ls` clean)
- [ ] React Flow, Framer Motion, GSAP loaded only on routes that need them

---

## Images

- [ ] Modern formats (WebP / AVIF) served for all user-uploaded images
- [ ] Section variant thumbnails served as WebP (not PNG)
- [ ] Responsive `srcset` on hero / content images
- [ ] Below-the-fold images lazy-loaded (`loading="lazy"`)
- [ ] No uncompressed PNGs > 200 KB in static assets
- [ ] `next/image` used for all images (auto-optimization enabled)

---

## Fonts

- [ ] Critical fonts preloaded with `<link rel="preload" as="font">`
- [ ] Google Fonts loaded with `display=swap` to prevent FOIT (Flash of Invisible Text)
- [ ] Only font weights actually used are requested (not all 9 weights per family)
- [ ] Design editor: Google Fonts for selected heading/body font loaded once, not re-fetched per section

---

## Network

- [ ] Static assets (JS, CSS, images) served with `Cache-Control: max-age=31536000, immutable`
- [ ] HTML pages served with proper cache headers (SSR revalidation or `no-cache`)
- [ ] HTTP/2 or HTTP/3 enabled on CDN
- [ ] Brotli / gzip compression enabled for all text assets

---

## Page-Specific Performance

### Homepage / Public Pages
- [ ] Hero image LCP ≤ 2.5s (preloaded if above-the-fold)
- [ ] No render-blocking scripts in `<head>`
- [ ] Mixpanel and other analytics loaded `async` or `defer`

### Dashboard
- [ ] Project list loads within 2s after auth (API response ≤ 500ms)
- [ ] Project card preview images lazy-loaded (not all fetched on mount)
- [ ] Workspace switch completes in < 1s (cached data shown immediately)

### Sitemap Editor
- [ ] React Flow canvas initial render < 1s for ≤ 20 pages
- [ ] Dagre layout calculation < 300ms for ≤ 20 pages
- [ ] Drag-and-drop no janking (frame rate ≥ 30fps during drag)
- [ ] No forced layout reflow (`[Violation]`) on node drag

### Design Editor
- [ ] All sections visible on canvas within 3s on desktop
- [ ] Variant picker thumbnails lazy-loaded (not all 100+ loaded on panel open)
- [ ] Viewport switch (desktop → tablet → mobile) completes < 500ms
- [ ] Inline text edit popup appears within 200ms of click
- [ ] Color palette change applies to canvas within 100ms (CSS variable swap)
- [ ] Font change applies to canvas within 300ms (font loaded if not cached)

### AI Features (Text Gen, Design Agent, Sitemap Chat)
- [ ] First token of AI response streamed within 2s of request (not waiting for full response)
- [ ] Token usage display updates within 500ms after AI response completes
- [ ] AI popup appears within 200ms of clicking a text element (not waiting for API)

### Image Picker
- [ ] Stock image grid: first 12 images visible within 1.5s
- [ ] Stock images paginated or virtualized (not all loaded at once)
- [ ] Image replacement applied to canvas within 500ms of selection

### Manage Mode
- [ ] Overview tab site data loaded within 2s of tab open (cached data shown immediately)
- [ ] Site scan polling: UI remains responsive during 3s polling intervals
- [ ] Process thread messages stream progressively (not batch-displayed at end)
- [ ] Build tab file tree renders within 1s for ≤ 50 files
- [ ] Code editor syntax highlighting renders without blocking UI thread

---

## API Performance

- [ ] `GET /api/projects` p95 latency ≤ 500ms
- [ ] `GET /api/manage/site-data` p95 ≤ 800ms (MCP round-trip allowed extra)
- [ ] `POST /api/manage/execute-action` first response chunk ≤ 3s
- [ ] `GET /api/manage/activity` p95 ≤ 300ms
- [ ] `POST /api/ai/text` first token ≤ 2s
- [ ] Database queries ≤ 100ms on dashboard load (MongoDB indexed fields checked)

---

## Third-Party

- [ ] Analytics (Mixpanel) loaded async — does not block page render
- [ ] No render-blocking third-party scripts
- [ ] Third-party total size ≤ 150 KB transferred

---

## Memory

- [ ] Design editor: no memory growth after 30 minutes of editing (heap snapshot before/after)
- [ ] Sitemap editor: React Flow cleans up on unmount (no dangling nodes or listeners)
- [ ] AI chat: SSE connections closed on panel unmount (no dangling streams)
- [ ] Manage Mode: process thread polling stopped when navigating away
- [ ] iframes: removed from DOM when viewport mode switches (not kept as hidden)

---

## Regression

- [ ] Current release Lighthouse scores not worse than previous release by > 5 points
- [ ] JS bundle size not grown > 10% without justification
- [ ] API p95 latencies not regressed by > 20% vs. previous release
