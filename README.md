# 🌱 Sprout OS Orbit
### **The QA Automation Layer for Sprout OS**
`sproutos.ai`

**Sprout OS Orbit is the end-to-end QA automation platform for POSIMYTH's Sprout OS product.**

- ✅ Runs all Playwright E2E tests across `sproutos.ai`
- ✅ Auth · Dashboard · Landing · Pricing · Security · Performance
- ✅ Multi-viewport (desktop, tablet, mobile)
- ✅ Lighthouse, axe-a11y, and security-header scanners built in

---

## 🔎 What's Covered

### 🔐 Auth Pages — sproutos.ai
- `/login` · `/signup` · `/forgot-password` · OAuth / social login

### 🖥️ Dashboard — sproutos.ai
- Main dashboard · user profile · settings · billing

### 🚀 Landing — sproutos.ai
- Homepage · product marketing pages · CTAs

### 💳 Pricing — sproutos.ai
- Plans · checkout flow · trial signup

### 🛡️ Security & SEO
- Security HTTP headers (CSP, HSTS, X-Frame-Options)
- Meta tags · canonical URLs · Open Graph
- SSL/TLS configuration

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

# Copy env template and set your URL
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
npm run test:auth         # Auth pages (login, signup, forgot password)
npm run test:dashboard    # Dashboard pages
npm run test:landing      # Landing / marketing pages
npm run test:pricing      # Pricing + checkout
npm run test:security     # Security headers / SSL
```

### Run a single spec

```bash
npx playwright test tests/sproutos/auth.spec.js
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

---

## 📂 Repo Layout

```
sproutos-orbit/
├── checklists/              # Manual QA checklists
├── config/                  # Runtime config
├── docs/                    # Testing guides & concepts
├── scripts/                 # Helper scripts (lighthouse, run-all)
├── tests/
│   └── sproutos/            # Sprout OS Playwright specs
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
