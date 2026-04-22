# Test Architecture

## Folder Layout

```
sproutos-orbit/
├── tests/
│   └── sproutos/
│       ├── auth.spec.js        # /login /signup /forgot-password / OAuth
│       ├── landing.spec.js     # Homepage + SEO + CTAs
│       ├── dashboard.spec.js   # Auth-gated dashboard (needs credentials)
│       ├── pricing.spec.js     # Pricing plans + checkout CTAs
│       └── security.spec.js    # HTTP security headers
├── checklists/                 # Manual QA checklists
├── config/                     # Lighthouse CI config
├── docs/                       # These docs
├── scripts/                    # Shell helpers (run-all, lighthouse)
├── playwright.config.js        # Viewports + projects
└── qa.config.example.json      # Runtime config template
```

## Projects (Viewports)

`playwright.config.js` defines three projects — every spec runs in each:

| Project | Device | Viewport |
|---|---|---|
| `sproutos-desktop` | Desktop Chrome | 1440 × 900 |
| `sproutos-tablet` | iPad (gen 7) | 768 × 1024 |
| `sproutos-mobile` | Pixel 5 | 375 × 812 |

Run a single viewport:

```bash
npx playwright test --project=sproutos-desktop
```

## Test Categories

### 1. Auth (`auth.spec.js`)
Public-facing, no credentials required. Checks form rendering, validation, error states, and OAuth button presence.

### 2. Landing (`landing.spec.js`)
Public homepage — SEO tags, CTAs, console errors, broken images.

### 3. Dashboard (`dashboard.spec.js`)
**Requires `TEST_USER_EMAIL` + `TEST_USER_PASSWORD`** in `.env`. Tests are skipped if not configured. Also tests auth-gating for unauthenticated users.

### 4. Pricing (`pricing.spec.js`)
Plan cards, currency display, billing toggle, CTA buttons.

### 5. Security (`security.spec.js`)
HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP, HTTP→HTTPS redirect.

## Reports

- **HTML report:** `reports/playwright-html/index.html` (after `npm run test:report`)
- **Screenshots on failure:** `test-results/` (auto-captured)
- **Videos on failure:** `test-results/` (auto-captured)
- **Traces on retry:** `test-results/` (open with `npx playwright show-trace`)

## CI Integration

See your CI provider's Playwright guide. Key env vars to pass through:

```
SPROUTOS_URL
TEST_USER_EMAIL
TEST_USER_PASSWORD
CI=true
```

`CI=true` enables `forbidOnly` and 1 retry on failure.
