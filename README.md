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

# Copy env template
cp qa.config.example.json qa.config.json
# Create .env with credentials (see Environment Variables below)

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
npm run test:login             # Login / Signup / Forgot Password / OAuth
npm run test:onboarding        # First-time user onboarding flow

# Dashboard & Workspaces
npm run test:dashboard         # Auth-gated dashboard + workspace switcher
npm run test:projects          # Project creation, cards, context menu

# Brief & Crawl
npm run test:guided-brief      # 6-step guided brief wizard
npm run test:crawl             # Website crawl & auto-populate

# Sitemap
npm run test:sitemap-editor    # Visual sitemap editor
npm run test:sitemap-chat      # AI Sitemap Chat

# Design
npm run test:design            # Design editor canvas + variants
npm run test:colors            # Color system & theming
npm run test:typography        # Font management
npm run test:ai-text           # AI text generation
npm run test:images            # Image handling & media
npm run test:responsive        # Multi-viewport rendering
npm run test:ai-design         # AI Design Agent
npm run test:styleguide        # Styleguide & design system
npm run test:pitch             # Pitch concepts

# Collaboration
npm run test:comments          # Comments & collaboration
npm run test:export            # Export (Elementor, Gutenberg, Figma)

# Team & Settings
npm run test:team              # Team management & invites
npm run test:roles             # Roles & permissions
npm run test:tokens            # Token usage & billing
npm run test:settings          # User settings

# Manage Mode
npm run test:manage-overview   # Manage → Overview tab (scan, approvals, activity)
npm run test:manage-actions    # Manage → Actions (library, playbooks, automations)
npm run test:manage-build      # Manage → Build (module lifecycle)
npm run test:manage-connectors # Manage → External connectors

# Infrastructure
npm run test:sitemap           # sitemap.xml + robots.txt
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
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=your-admin-password
```

`TEST_USER_EMAIL` / `TEST_USER_PASSWORD` are required for all authenticated suites. Tests skip gracefully if missing.
`TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD` are required for admin-level suites (roles, token management, Manage Mode).

---

## 📂 Repo Layout

```
sproutos-orbit/
├── checklists/                      # Manual QA checklists
│   ├── pre-release-checklist.md
│   ├── performance-checklist.md
│   ├── security-checklist.md
│   └── ui-ux-checklist.md
├── config/                          # Runtime config (Lighthouse CI, etc.)
├── docs/                            # Testing guides
│   ├── 01-getting-started.md
│   ├── 02-test-architecture.md
│   └── 03-writing-tests.md
├── scripts/                         # Helpers (lighthouse, run-all)
├── tests/
│   └── sproutos/
│       ├── login-pages.spec.js          # /login /signup /forgot-password / OAuth
│       ├── onboarding.spec.js           # First-time onboarding flow
│       ├── dashboard.spec.js            # Auth-gated dashboard + workspaces
│       ├── projects.spec.js             # Project creation & management
│       ├── guided-brief.spec.js         # 6-step guided brief wizard
│       ├── crawl.spec.js                # Website crawl & analysis
│       ├── sitemap-editor.spec.js       # Visual sitemap editor
│       ├── sitemap-chat.spec.js         # AI Sitemap Chat
│       ├── design.spec.js               # Design editor canvas + variants
│       ├── colors.spec.js               # Color system & theming
│       ├── typography.spec.js           # Font management
│       ├── ai-text.spec.js              # AI text generation
│       ├── images.spec.js               # Image handling & media
│       ├── responsive.spec.js           # Multi-viewport rendering
│       ├── ai-design.spec.js            # AI Design Agent
│       ├── styleguide.spec.js           # Styleguide & design system
│       ├── pitch.spec.js                # Pitch concepts & shareable links
│       ├── comments.spec.js             # Comments & collaboration
│       ├── export.spec.js               # Export (Elementor, Gutenberg, Figma)
│       ├── team.spec.js                 # Team management & invites
│       ├── roles.spec.js                # Roles & permissions
│       ├── tokens.spec.js               # Token usage & billing
│       ├── settings.spec.js             # User settings
│       ├── manage-overview.spec.js      # Manage → Overview tab
│       ├── manage-actions.spec.js       # Manage → Actions / Playbooks / Automations
│       ├── manage-build.spec.js         # Manage → Build module lifecycle
│       ├── manage-connectors.spec.js    # Manage → External connectors
│       └── sitemap.spec.js              # sitemap.xml + robots.txt
├── playwright.config.js             # Playwright projects (desktop/tablet/mobile)
├── qa.config.example.json           # QA config template
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
