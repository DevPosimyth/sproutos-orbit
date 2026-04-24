# Test Architecture

## Folder Layout

```
sproutos-orbit/
├── tests/
│   └── sproutos/
│       ├── login-pages.spec.js          # /login /signup /forgot-password / OAuth
│       ├── onboarding.spec.js           # First-time 5-step discovery flow + confetti
│       ├── dashboard.spec.js            # Auth-gated dashboard + workspace switcher
│       ├── projects.spec.js             # Project creation (5 methods), cards, context menu
│       ├── guided-brief.spec.js         # 6-step guided brief wizard
│       ├── crawl.spec.js                # Website crawl & analysis (colors, text, nav, CTAs)
│       ├── sitemap-editor.spec.js       # Visual sitemap editor (pages, sections, globals)
│       ├── sitemap-chat.spec.js         # AI Sitemap Chat (multi-turn, undo)
│       ├── design.spec.js               # Design editor canvas, variants, inline text editing
│       ├── colors.spec.js               # Color system & theming (palettes, HSL, dark/light)
│       ├── typography.spec.js           # Google Fonts integration, heading/body selection
│       ├── ai-text.spec.js              # Inline AI text popup (quick actions, token gate)
│       ├── images.spec.js               # Image picker, logo management, AI image selection
│       ├── responsive.spec.js           # Tablet/mobile iframe rendering, CSS/font sync
│       ├── ai-design.spec.js            # AI Design Agent chat, model selection, undo/redo
│       ├── styleguide.spec.js           # Button/card/form/section style customization
│       ├── pitch.spec.js                # Pitch concepts, shareable link generation
│       ├── comments.spec.js             # Pin-based comments, threads, clustering
│       ├── export.spec.js               # Elementor, Gutenberg, Figma export + plan gates
│       ├── team.spec.js                 # Member list, invite (email + link), pending invites
│       ├── roles.spec.js                # 5 built-in roles, 12 permission groups, custom roles
│       ├── tokens.spec.js               # Token dashboard, usage table, color thresholds
│       ├── settings.spec.js             # Avatar upload, name/password, OAuth status
│       ├── manage-overview.spec.js      # Manage → Overview (scan, approval queue, activity)
│       ├── manage-actions.spec.js       # Manage → Actions, playbooks, automations, threads
│       ├── manage-build.spec.js         # Manage → Build module lifecycle (draft → release)
│       ├── manage-connectors.spec.js    # Manage → External MCP connectors
│       └── sitemap.spec.js              # sitemap.xml + robots.txt reachability
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

### Create Mode

#### 1. Login Pages (`login-pages.spec.js`)
Public-facing, no credentials required. Checks form rendering, validation, error states, and OAuth button presence across `/login`, `/signup`, `/forgot-password`.

#### 2. Onboarding (`onboarding.spec.js`)
First-time user flow: 5-question discovery survey (referral source, role, primary role, building for, needs), confetti animation, slide-to-start interaction, 15-day trial banner.

#### 3. Dashboard & Workspaces (`dashboard.spec.js`)
**Requires `TEST_USER_EMAIL` + `TEST_USER_PASSWORD`** in `.env`. Tests workspace switcher, plan badge, token allocation display, project grid/list toggle, search, sort options, and auth-gating for unauthenticated users.

#### 4. Projects (`projects.spec.js`)
Project creation via all 5 methods (blank, URL, brief text, PDF, template). Project card rendering (3-layer preview, name, time, avatars), right-click context menu (move, remove), recent projects sidebar.

#### 5. Guided Brief (`guided-brief.spec.js`)
Full 6-step wizard: Project Basics → Business Snapshot → Copy & Trust → Brand Direction → References → Improve Accuracy. Logo upload, color picker, reference site crawl trigger.

#### 6. Website Crawl & Analysis (`crawl.spec.js`)
URL-triggered crawl — color extraction, text extraction, navigation parsing, contact info, social links, testimonials, CTAs, meta data. Validates auto-population of brief fields.

#### 7. Sitemap Editor (`sitemap-editor.spec.js`)
Visual node-based sitemap: create/rename/delete/duplicate pages, add/reorder/copy/paste sections (51+ types), mark globals (navbar/footer), AI suggestions banner, Dagre auto-layout.

#### 8. AI Sitemap Chat (`sitemap-chat.spec.js`)
Multi-turn chat UI, add/remove pages and sections via conversation, undo applied changes, conversation history persistence.

#### 9. Design Editor (`design.spec.js`)
Infinite canvas render, zoom controls, pan, section library panel, variant picker (thumbnails, AI Picks, bookmarks, search), template presets, inline text editing across h1–h6/p/button elements.

#### 10. Color System & Theming (`colors.spec.js`)
Color palette creation and switching, industry category palettes, global saturation slider, light/dark theme toggle, section background color swatches, HSL/HEX conversion.

#### 11. Typography (`typography.spec.js`)
Google Fonts panel (1000+), priority font list, search and category filter, heading/body font assignment, multi-weight selection, concept-specific font overrides.

#### 12. AI Text Generation (`ai-text.spec.js`)
Inline popup on text elements: Rewrite, Make Shorter, Make Longer, Fix Grammar, Improve Writing, Simplify. Token gate check, smart positioning, iframe mode compatibility.

#### 13. Image Handling & Media (`images.spec.js`)
Image picker (stock, upload, library), aspect ratio presets (Original/1:1/4:3/16:9/3:2), overlay color/opacity, logo management (light/dark variants, 120×40px sizing), AI image selection.

#### 14. Responsive Design (`responsive.spec.js`)
Viewport switching (desktop → tablet → mobile), iframe rendering at correct dimensions, CSS/font sync to iframes, event propagation, auto-height adjustment.

#### 15. AI Design Agent (`ai-design.spec.js`)
Chat panel open/close, model selection (GPT-4o, GPT-4o Mini, Llama 3.3), suggestion selection and real-time application, undo/redo, token usage display.

#### 16. Styleguide (`styleguide.spec.js`)
Button size (S/M/L) and corner radius (Square/Slight/Rounded/Pill), card variants, form field styles, section background patterns, footer color modes.

#### 17. Pitch Concepts (`pitch.spec.js`)
Top-3 color concept display, concept name editing, description field, shareable pitch link generation and copy.

#### 18. Comments & Collaboration (`comments.spec.js`)
Pin drop on design canvas and sitemap, threaded replies, comment mode toggle, pin clustering, permission levels (Off/View/Edit).

#### 19. Export (`export.spec.js`)
Elementor, Gutenberg, and Figma export flows. Plan-gate enforcement per format (React export blocked on FREE), role-based permission check, step-by-step instructions render.

#### 20. Team Management (`team.spec.js`)
Member list (avatar, name, email, role, join date), search/filter, grid/list toggle, email invite (role selection, 7-day expiry, copy link fallback), link invite (reusable, default role), pending invite list, resend/cancel.

#### 21. Roles & Permissions (`roles.spec.js`)
5 built-in roles with correct access levels, 12 permission group toggles, custom role creation (name, description, granular permissions, real-time access level calculation).

#### 22. Token Usage & Billing (`tokens.spec.js`)
Summary cards (allocated, used with progress bar, remaining), usage table (feature, model, sprout tokens, input tokens, output tokens, date), pagination (15/page), color thresholds (normal / >90% / out).

#### 23. User Settings (`settings.spec.js`)
Avatar upload (PNG/JPG/WebP ≤15MB), first/last name save, email display (read-only), password change (current + new, eye toggle), OAuth/email verification status.

---

### Manage Mode

#### 24. Manage Overview (`manage-overview.spec.js`)
Site connection (Application Password auth), post-connection state, capabilities panel, 6-card summary grid, site snapshot panels, 9-area site scan (trigger, polling, results), approval queue (Approve/Reject), activity timeline (20 items, category filter), upcoming work.

#### 25. Manage Actions (`manage-actions.spec.js`)
Action library (categories: Protection, Maintenance, Performance, Security, Quality, Reporting, Content, Launch & Handoff), quick actions, playbook creation and execution (approval checkpoints), automation creation (cron/webhook/manual triggers, execution modes), process thread (tool call timeline, follow-up chat), custom action creation.

#### 26. Manage Build (`manage-build.spec.js`)
Module creation (Quick Prompt and Detailed Setup modes), 8 module types, file editor (PHP/JS/CSS/HTML), version history (semver, diff viewer, rollback), quality gates (Security/Accessibility/Performance/Compatibility), review workflow (client + team), release and rollback, per-module activity log, AI assistant chat.

#### 27. Manage Connectors (`manage-connectors.spec.js`)
Add HTTP connector (URL, basic auth), add Stdio connector (command, args, env vars), test connection, tool count display, delete connector, connector reference in action execution.

---

### Infrastructure

#### 28. Sitemap (`sitemap.spec.js`)
Verifies `sitemap.xml` and `robots.txt` are reachable, well-formed, and that listed URLs resolve (spot-checks first 10).

---

## Credentials

| Variable | Required For |
|---|---|
| `TEST_USER_EMAIL` | All authenticated suites |
| `TEST_USER_PASSWORD` | All authenticated suites |
| `TEST_ADMIN_EMAIL` | Roles, tokens, Manage Mode |
| `TEST_ADMIN_PASSWORD` | Roles, tokens, Manage Mode |

Tests skip gracefully when required credentials are absent.

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
TEST_ADMIN_EMAIL
TEST_ADMIN_PASSWORD
CI=true
```

`CI=true` enables `forbidOnly` and 1 retry on failure.
