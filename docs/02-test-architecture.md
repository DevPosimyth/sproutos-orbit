# Test Architecture

## Folder Layout

```
sproutos-orbit/
├── tests/
│   └── sproutos/
│       ├── login-pages.spec.js  # /login /signup /forgot-password / OAuth
│       ├── dashboard.spec.js    # Auth-gated dashboard (needs credentials)
│       ├── sitemap.spec.js      # sitemap.xml, robots.txt, URL reachability
│       ├── scope.spec.js        # /scope route + auth gating
│       └── design.spec.js       # /design route + auth gating
├── checklists/                  # Manual QA checklists
├── config/                      # Lighthouse CI config
├── docs/                        # These docs
├── scripts/                     # Shell helpers (run-all, lighthouse)
├── playwright.config.js         # Viewports + projects
└── qa.config.example.json       # Runtime config template
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

### 1. Login Pages (`login-pages.spec.js`)
Public-facing, no credentials required. Checks form rendering, validation, error states, and OAuth button presence across `/login`, `/signup`, `/forgot-password`.

### 2. Dashboard (`dashboard.spec.js`)
**Requires `TEST_USER_EMAIL` + `TEST_USER_PASSWORD`** in `.env`. Tests are skipped if not configured. Also tests auth-gating for unauthenticated users.

### 3. Sitemap (`sitemap.spec.js`)
Verifies `sitemap.xml` and `robots.txt` are reachable, well-formed, and that listed URLs resolve (spot-checks first 10).

### 4. Scope (`scope.spec.js`)
Auth-gated `/scope` route. Loads page, checks main region renders, no console errors. Feature-specific assertions are TODO until flows are documented.

### 5. Design (`design.spec.js`)
Auth-gated `/design` route. Loads page, checks canvas/editor region, no console errors, no failed same-origin asset requests. Feature-specific assertions are TODO until flows are documented.

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
