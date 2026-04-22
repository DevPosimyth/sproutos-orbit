# 🌱 Sprout OS Orbit
### **The QA Automation Layer for Sprout OS**
`sproutos.ai`

**Sprout OS Orbit is the end-to-end QA automation platform for POSIMYTH's Sprout OS product.**

- ✅ Runs Playwright E2E tests across `sproutos.ai`
- ✅ Login Pages · Dashboard · Sitemap · Scope · Design
- ✅ Multi-viewport (desktop, tablet, mobile)
- ✅ Lighthouse + axe-a11y helpers included

---

## 🔎 What's Covered

### 🔐 Login Pages
`/login` · `/signup` · `/forgot-password` · OAuth / social login — form rendering, validation, error states.

### 🖥️ Dashboard
Auth-gated dashboard — user context, settings access, logout flow. **Requires test credentials.**

### 🗺️ Sitemap
`sitemap.xml` + `robots.txt` reachability, schema validity, URL reachability spot-checks.

### 🎯 Scope
`/scope` route — auth gating, page render, console-error check.

### 🎨 Design
`/design` route — auth gating, canvas/editor render, console-error + asset-load checks.

---

## 🧰 Stack

| Tool | Version | Check |
|---|---|---|
| Node.js | v18+ | `node --version` |
| npm | v8+ | `npm --version` |
| Git | any | `git --version` |
| Playwright | v1.59+ | installed via `npm install` |

---

## 🚀 Quick Start

```bash
git clone https://github.com/DevPosimyth/sproutos-orbit.git
cd sproutos-orbit
npm install
npx playwright install

# Copy env template
cp qa.config.example.json qa.config.json
# Create .env with: SPROUTOS_URL=https://sproutos.ai

npm test
```

---

## 🧪 Running Tests

### Run everything

```bash
npm test
```

### Run a single suite

```bash
npm run test:login        # Login / Signup / Forgot Password / OAuth
npm run test:dashboard    # Auth-gated dashboard
npm run test:sitemap      # sitemap.xml + robots.txt
npm run test:scope        # /scope route
npm run test:design       # /design route
```

### Run a single spec

```bash
npx playwright test tests/sproutos/login-pages.spec.js
```

### Debug / Headed

```bash
npm run test:headed
npx playwright test --debug
```

### HTML report

```bash
npm run test:report
npx playwright show-report reports/playwright-html
```

---

## 🌐 Environment Variables

Create a `.env` file at the repo root:

```
SPROUTOS_URL=https://sproutos.ai
TEST_USER_EMAIL=qa@example.com
TEST_USER_PASSWORD=your-test-password
```

`TEST_USER_EMAIL` / `TEST_USER_PASSWORD` are required for `dashboard`, `scope`, and `design` suites. Tests skip gracefully if missing.

---

## 📂 Repo Layout

```
sproutos-orbit/
├── checklists/              # Manual QA checklists
├── config/                  # Runtime config
├── docs/                    # Testing guides
├── scripts/                 # Helpers (lighthouse, run-all)
├── tests/
│   └── sproutos/
│       ├── login-pages.spec.js
│       ├── dashboard.spec.js
│       ├── sitemap.spec.js
│       ├── scope.spec.js
│       └── design.spec.js
├── playwright.config.js     # Playwright projects (desktop/tablet/mobile)
├── qa.config.example.json   # QA config template
└── package.json
```

---

## 🧭 Projects / Viewports

| Project | Viewport | Device |
|---|---|---|
| `sproutos-desktop` | 1440 × 900 | Desktop Chrome |
| `sproutos-tablet` | 768 × 1024 | iPad (gen 7) |
| `sproutos-mobile` | 375 × 812 | Pixel 5 |

Run only one viewport:

```bash
npx playwright test --project=sproutos-desktop
```

---

## 📋 Checklists

Manual QA checklists live in `checklists/`:

- `pre-release-checklist.md`
- `performance-checklist.md`
- `security-checklist.md`
- `ui-ux-checklist.md`

---

## 🏷️ About

Built and maintained by **POSIMYTH** for Sprout OS QA automation.

- 🌐 Product: https://sproutos.ai
- 🏢 Company: https://posimyth.com
- 🪐 Companion orbit: https://github.com/DevPosimyth/wdesignkit-orbit
