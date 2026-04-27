> ## ⚠️ Before You Start Any QA
> **Read the QA Guidelines first — every time, no exceptions.**
> [`docs/00-qa-guidelines.md`](docs/00-qa-guidelines.md)
> Covers: environment setup · severity classification · execution process · bug reporting standard · pass/fail thresholds · release gate.

---

# 🌱 Sprout OS Orbit
### **The QA Automation Layer for Sprout OS**
`sproutos.ai`

**Sprout OS Orbit is the end-to-end QA automation platform for POSIMYTH's Sprout OS product.**

- ✅ Runs Playwright E2E tests across `sproutos.ai`
- ✅ Covers **Create Mode** (planning, design, export) and **Manage Mode** (WordPress via MCP)
- ✅ Multi-viewport (desktop, tablet, mobile)
- ✅ Lighthouse + axe-a11y helpers included

---

## 🔎 What's Covered

### 🔐 Authentication & Onboarding
`/login` · `/signup` · `/forgot-password` · OAuth (Google) — form rendering, validation, error states, email verification flow, and the 5-step onboarding discovery flow.

### 🖥️ Dashboard & Workspaces
Auth-gated dashboard — workspace switcher, project grid/list view, search, sort, plan badge, token allocation display, and "Get Started" checklist. **Requires test credentials.**

### 📋 Projects
Project creation (blank, from URL, from brief text, from PDF, from template) · project cards · right-click context menu · recent projects sidebar.

### 📝 Guided Brief (Client Discovery)
6-step wizard: Project Basics → Business Snapshot → Copy & Trust → Brand Direction → References → Improve Accuracy. Website crawl & auto-population of brief fields.

### 🗺️ Sitemap Editor
Visual node-based sitemap planner — page management, section management (51+ section types), global sections (navbar/footer), AI suggestions, drag-and-drop reordering.

### 🤖 AI Sitemap Chat
Multi-turn chat that modifies the sitemap — add/remove pages and sections, rename, duplicate, undo capability.

### 🎨 Design Editor
Infinite canvas, viewport switcher (desktop/tablet/mobile), section variant picker, inline text editing, template presets, drag-and-drop reordering.

### 🎨 Color System & Theming
Color palette management, industry palettes, saturation slider, dark/light theme toggle, section background colors, HSL/HEX conversion.

### 🔤 Typography & Font Management
Google Fonts integration (1000+), heading + body font selection, concept-specific fonts, font search and category filter.

### ✍️ AI Text Generation
Inline AI text popup — Rewrite, Make Shorter, Make Longer, Fix Grammar, Improve Writing, Simplify. Token-gated, context-aware.

### 🖼️ Image Handling & Media
Image picker (stock, upload, library), aspect ratio presets, overlay controls, logo (light/dark) management, AI image selection.

### 📱 Responsive Design (Multi-Viewport)
Desktop, tablet (768×1024), and mobile (375×812) viewport modes; iframe-based rendering with CSS/font sync.

### 🤖 AI Design Agent
Chat panel in the design editor — model selection, design recommendations, undo/redo, token tracking, context-aware suggestions.

### 🎛️ Styleguide & Design System
Button/card/form/section customization (size, corner radius, background patterns, footer color modes).

### 🖼️ Pitch Concepts
Top-3 color concepts, shareable pitch preview link for client presentations.

### 💬 Comments & Collaboration
Pin-based comments on design canvas and sitemap, threaded replies, user avatars, pin clustering, comment permission levels.

### 📤 Export
Elementor, Gutenberg, and Figma export. Plan-gated formats, role-based permissions, step-by-step instructions.

### 👥 Team Management
Member list, invite by email or link, role assignment, 7-day invite expiry, pending invites management.

### 🔒 Roles & Permissions
5 built-in roles (Admin, Designer, Developer, Client, Viewer) · 12 permission groups · custom role creation.

### 💳 Token Usage & Billing
Sprout Tokens dashboard — allocated, used, remaining; usage table with pagination; plan badge and color-coded thresholds.

### ⚙️ User Settings
Avatar upload, name editing, password change, OAuth/email verification status.

### 🌐 Manage Mode — WordPress via MCP
Connect WordPress sites via Application Password · Overview tab (site scan, approval queue, activity timeline) · Actions tab (action library, playbooks, automations, process threads) · Build tab (custom module lifecycle: draft → build → test → review → release).

### 🔌 Manage Mode — External Connectors
HTTP and Stdio MCP connectors — add, test, delete, merge with WordPress tools for Claude execution.

### 📋 Sitemap (`sitemap.xml` + `robots.txt`)
Reachability, schema validity, URL reachability spot-checks.

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

# Copy env template and fill in your credentials
cp .env.example .env

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
# Auth
npm run test:auth              # Login / Signup / Forgot Password / OAuth
npm run test:login             # Login pages only

# Dashboard
npm run test:dashboard         # Full dashboard suite
npm run test:dashboard-home    # Dashboard home tab
npm run test:dashboard-sidebar # Sidebar navigation
npm run test:dashboard-workspace # Workspace switcher
npm run test:dashboard-settings  # Dashboard settings
npm run test:dashboard-security  # Auth-gating & security

# Create Mode
npm run test:guided-brief      # 6-step guided brief wizard
npm run test:sitemap-editor    # Visual sitemap editor
npm run test:design-editor     # Design editor canvas + variants
npm run test:section-variants  # Section variant picker
npm run test:color-system      # Color palette & theming
npm run test:ai-text           # AI text generation popup
npm run test:image-picker      # Image picker (stock, upload, library)
npm run test:export            # Export (Elementor, Gutenberg, Figma)
npm run test:team              # Team management & invites
npm run test:tokens            # Token usage & billing
npm run test:settings          # User settings
npm run test:responsive        # Multi-viewport rendering

# Manage Mode
npm run test:manage            # All Manage Mode suites
npm run test:manage-overview   # Manage → Overview tab
npm run test:manage-actions    # Manage → Actions / Playbooks / Automations
npm run test:manage-build      # Manage → Build module lifecycle
npm run test:manage-mcp        # Manage → MCP site connection
npm run test:manage-approvals  # Manage → Approval queue

# Cross-cutting QA
npm run test:a11y              # Accessibility (axe-core WCAG 2.1 AA)
npm run test:console           # Console error audit
npm run test:seo               # SEO meta tag assertions
npm run test:perf              # Performance budget assertions
npm run test:security          # Security checks
npm run test:visual            # Visual regression snapshots
npm run test:visual:update     # Re-seed visual regression baselines
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

## 📂 Repo Layout

```
sproutos-orbit/
├── checklists/                          # Manual QA checklists (12 files)
│   ├── pre-release-checklist.md
│   ├── functionality-checklist.md
│   ├── logic-checklist.md
│   ├── responsiveness-checklist.md
│   ├── accessibility-checklist.md
│   ├── cross-browser-checklist.md
│   ├── console-errors-checklist.md
│   ├── seo-meta-checklist.md
│   ├── security-checklist.md
│   ├── performance-checklist.md
│   ├── code-quality-checklist.md
│   └── ui-ux-checklist.md
├── config/                              # QA config files
│   ├── lighthouserc.json                # Lighthouse CI thresholds
│   ├── performance.config.js            # Core Web Vitals, page & API budgets
│   ├── visual-regression.config.js      # Snapshot definitions & mask selectors
│   ├── console.config.js                # Console allow/block rules per feature
│   ├── axe.config.js                    # axe-core WCAG rules & page list
│   ├── seo.config.js                    # SEO rules, OG tags, sitemap rules
│   ├── security-headers.config.js       # Required security headers & CSP rules
│   └── bundlesize.config.json           # JS/CSS bundle size limits
├── docs/                                # Testing guides & QA reports
│   ├── 00-qa-guidelines.md              # ⚠️ READ FIRST — QA process, standards, bug format
│   ├── 01-getting-started.md
│   ├── 02-test-architecture.md
│   └── 03-writing-tests.md
├── scripts/                             # QA runner scripts
│   ├── run-all-tests.sh                 # Full 14-phase QA runner
│   ├── lighthouse.sh                    # Lighthouse desktop + mobile scanner
│   └── dashboard-report.sh             # Dashboard test runner + bug report
├── tests/
│   └── sproutos/
│       ├── dashboard/                   # Dashboard suite (home, sidebar, workspace, settings, security)
│       ├── homepage.spec.js
│       ├── login-pages.spec.js
│       ├── auth.spec.js
│       ├── guided-brief.spec.js
│       ├── sitemap-editor.spec.js
│       ├── design-editor.spec.js
│       ├── section-variants.spec.js
│       ├── color-system.spec.js
│       ├── ai-text-popup.spec.js
│       ├── image-picker.spec.js
│       ├── export.spec.js
│       ├── team-management.spec.js
│       ├── token-usage.spec.js
│       ├── user-settings.spec.js
│       ├── manage-overview.spec.js
│       ├── manage-actions.spec.js
│       ├── manage-build.spec.js
│       ├── manage-mcp.spec.js
│       ├── manage-approvals.spec.js
│       ├── accessibility.spec.js
│       ├── console-errors.spec.js
│       ├── seo.spec.js
│       ├── performance.spec.js
│       ├── security.spec.js
│       ├── responsive.spec.js
│       └── visual-regression.spec.js
├── .env.example                         # Env variable template (copy to .env)
├── playwright.config.js                 # Playwright projects (desktop/tablet/mobile)
├── qa.config.example.json               # QA thresholds & area config template
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

Manual QA checklists live in `checklists/`. Run the relevant checklist for each testing area before release.

| Checklist | Purpose |
|---|---|
| [`functionality-checklist.md`](checklists/functionality-checklist.md) | Feature-by-feature verification across all 28 product areas |
| [`logic-checklist.md`](checklists/logic-checklist.md) | Business rules, state management, edge cases, data persistence |
| [`responsiveness-checklist.md`](checklists/responsiveness-checklist.md) | All viewports (1920px → 320px), device orientations, touch |
| [`accessibility-checklist.md`](checklists/accessibility-checklist.md) | WCAG 2.1 AA, keyboard nav, screen readers, axe-core |
| [`cross-browser-checklist.md`](checklists/cross-browser-checklist.md) | Chrome, Firefox, Safari, Edge — with per-feature browser matrix |
| [`console-errors-checklist.md`](checklists/console-errors-checklist.md) | JS errors, network failures, memory leaks, per-feature action table |
| [`seo-meta-checklist.md`](checklists/seo-meta-checklist.md) | Title tags, OG, canonical, robots.txt, sitemap.xml, structured data |
| [`security-checklist.md`](checklists/security-checklist.md) | Headers, auth, authz, input handling, Manage Mode credentials, MCP |
| [`performance-checklist.md`](checklists/performance-checklist.md) | Lighthouse, Core Web Vitals, bundle size, per-feature latency targets |
| [`ui-ux-checklist.md`](checklists/ui-ux-checklist.md) | UI layout, forms, loading/empty states, microinteractions |
| [`code-quality-checklist.md`](checklists/code-quality-checklist.md) | TypeScript, React, Next.js, state, API, security hygiene, deps |
| [`pre-release-checklist.md`](checklists/pre-release-checklist.md) | Full sign-off gate — run everything before tagging a release |

---

## 🏷️ About

Built and maintained by **POSIMYTH** for Sprout OS QA automation.

- 🌐 Product: https://sproutos.ai
- 🏢 Company: https://posimyth.com
- 🪐 Companion orbit: https://github.com/DevPosimyth/wdesignkit-orbit
