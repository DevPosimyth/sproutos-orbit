# Sprout OS — Pre-Release Checklist

> Run every item before tagging a release / deploying to production.

---

## Code & Build

- [ ] All CI checks green on main branch
- [ ] Version number bumped in `package.json`, git tag, and release notes
- [ ] Build output is reproducible (clean `npm install && npm run build` passes)
- [ ] No `console.log` / debug statements in production build
- [ ] Environment variables documented in `.env.example`

---

## Auth & Onboarding

- [ ] Login with valid credentials → dashboard
- [ ] Login with invalid credentials → clean error message
- [ ] Signup flow end-to-end (including email verification)
- [ ] Forgot password → email received → reset → login
- [ ] Google OAuth sign-in completes successfully
- [ ] Session expiry redirects to login
- [ ] Logout clears session fully
- [ ] First-time user sees 5-step onboarding discovery flow
- [ ] Confetti animation fires on onboarding completion
- [ ] Slide-to-start interaction works after onboarding
- [ ] 15-day free trial banner displays correctly

---

## Dashboard & Workspaces

- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Authenticated user sees their own workspace data (no cross-tenant leak)
- [ ] Default workspace auto-created on first login
- [ ] Workspace switcher dropdown opens and switches correctly
- [ ] Plan badge (FREE / Professional / STUDIO_PLUS) displays per workspace
- [ ] Token allocation display (e.g., "1.2K / 5K tokens") is accurate
- [ ] Trial days remaining badge shown
- [ ] Project grid and list view toggle works
- [ ] Project search by name works
- [ ] Project sort (last viewed, last created, alphabetical) works
- [ ] "Get Started" checklist displays with progress tracking
- [ ] Confetti fires on checklist completion

---

## Projects

- [ ] Create blank project — opens successfully
- [ ] Create from URL — crawl triggers, brief auto-populated
- [ ] Create from brief text — AI extracts structure
- [ ] Create from PDF upload — AI extracts and structures content
- [ ] Create from template — template applies correctly
- [ ] Project cards show: 3-layer preview, name, last updated, member avatars
- [ ] Right-click context menu: Move to workspace, Remove from workspace
- [ ] Recent projects sidebar shows ≤10 projects with thumbnails
- [ ] Recent project right-click: Rename, Duplicate, Copy Link, Delete

---

## Guided Brief (Client Discovery)

- [ ] Step 1 (Project Basics): URL field triggers crawl, all fields save
- [ ] Step 2 (Business Snapshot): Tone chips, USP fields save
- [ ] Step 3 (Copy & Trust): Proof type selection, file/link upload saves
- [ ] Step 4 (Brand Direction): Style selection, logo upload, color hex input
- [ ] Step 5 (References): Liked/disliked site URLs crawl and extract data
- [ ] Step 6 (Improve Accuracy): Competitor URLs, preferred sections save
- [ ] Wizard progress indicator accurate across all 6 steps
- [ ] AI analysis runs on provided URL and populates brief fields

---

## Website Crawl & Analysis

- [ ] Color extraction (CSS vars, hex, RGB) clusters correctly by saturation
- [ ] Text extraction captures headings (h1–h6), paragraphs, list items
- [ ] Navigation parsing captures top-level nav items
- [ ] Contact info (emails, phones, addresses) detected
- [ ] Social links detected
- [ ] Testimonials (quote + author + role) extracted
- [ ] CTAs extracted
- [ ] OG tags and meta descriptions captured

---

## Sitemap Editor

- [ ] Visual sitemap loads with correct nodes
- [ ] Create new page with unique name
- [ ] Rename page with real-time validation
- [ ] Delete page (confirmation dialog, prevents deleting last page)
- [ ] Duplicate page preserves section structure
- [ ] Add sections from library (51+ types available)
- [ ] Reorder sections via drag-and-drop
- [ ] Copy/Cut/Paste sections between pages
- [ ] Mark navbar/footer sections as global
- [ ] Dagre auto-layout renders correctly
- [ ] AI suggestions banner appears (blog/legal pages) with 30s cooldown
- [ ] Blog and Legal page containers grouped correctly

---

## AI Sitemap Chat

- [ ] Chat panel opens from sitemap editor
- [ ] Multi-turn conversation supported
- [ ] AI adds/removes pages and sections via chat
- [ ] AI renames pages and sections via chat
- [ ] Undo applied AI changes works
- [ ] Conversation history persists per project

---

## Design Editor

- [ ] Infinite canvas renders all sections
- [ ] Zoom in/out, zoom-to-fit controls work
- [ ] Pan via click-and-drag
- [ ] Desktop viewport mode renders correctly
- [ ] Tablet viewport (768×1024 iframe) renders correctly
- [ ] Mobile viewport (375×812 iframe) renders correctly
- [ ] Section library panel opens and lists sections
- [ ] Variant picker shows thumbnails (19% scale)
- [ ] "AI Picks" variants marked correctly
- [ ] Bookmark variants persist to localStorage
- [ ] Variant search by name/number works
- [ ] Drag-and-drop section reordering works
- [ ] Template presets (6 types) apply correctly
- [ ] Inline text editing on h1–h6, p, span, button, input, textarea
- [ ] Text overrides persist across sessions
- [ ] Legal compliance badge shows on privacy/cookie sections

---

## Color System & Theming

- [ ] Pre-built palettes load and apply to design
- [ ] Industry category palettes (Tech, Health, Finance, Creative, etc.) available
- [ ] Randomize colors within a category works
- [ ] Individual color hex editing applies globally
- [ ] Global saturation slider (0–100) adjusts all colors
- [ ] Light/Dark theme toggle for text colors works
- [ ] Section background color swatches (5 lightness levels) apply on hover/click
- [ ] Saved colors list persists (up to 5)

---

## Typography & Font Management

- [ ] Google Fonts panel loads 1000+ fonts with live preview
- [ ] Priority/curated font list displayed at top
- [ ] Font search by name works
- [ ] Filter by category (serif, sans-serif, display, etc.) works
- [ ] Heading font selection applies globally to headings
- [ ] Body font selection applies globally to paragraph text
- [ ] Font persists across project sessions
- [ ] Concept-specific fonts override global font per concept

---

## AI Text Generation

- [ ] Inline AI popup triggers on clicking any text element
- [ ] Quick actions available: Rewrite, Make Shorter, Make Longer, Fix Grammar, Improve Writing, Simplify
- [ ] Generated text uses project description as context
- [ ] Token check runs before generating (blocks if insufficient)
- [ ] Popup positions correctly, avoids sidebar overlap
- [ ] AI text works inside tablet/mobile iframes

---

## Image Handling & Media

- [ ] Image picker opens on clicking any image
- [ ] Stock images browsable and selectable
- [ ] Custom image upload works
- [ ] Aspect ratio presets (Original, 1:1, 4:3, 16:9, 3:2) apply correctly
- [ ] Overlay color and opacity controls work
- [ ] Image source mapping persists and restores on reload
- [ ] Light logo and dark logo variants upload independently
- [ ] Logo sizing enforced at 120×40px
- [ ] AI image selection suggests images matching detected design style

---

## Responsive Design (Multi-Viewport)

- [ ] Desktop mode renders directly in DOM (no iframe)
- [ ] Tablet mode renders in iframe at 768×1024
- [ ] Mobile mode renders in iframe at 375×812
- [ ] CSS variables sync correctly into iframes
- [ ] Fonts load inside iframes
- [ ] Click, scroll, and touch events propagate correctly in iframes
- [ ] Auto-height adjustment fires on content change

---

## AI Design Agent

- [ ] Chat panel opens within design editor
- [ ] Model selection (GPT-4o, GPT-4o Mini, Llama 3.3) works
- [ ] AI provides design recommendations as selectable options
- [ ] Selecting an option applies change in real-time
- [ ] Undo/Redo works for AI-applied actions
- [ ] Token usage tracked and displayed
- [ ] Conversation history saved per project

---

## Styleguide & Design System

- [ ] Button size (S/M/L) applies globally
- [ ] Button corner radius (Square/Slight/Rounded/Pill) applies globally
- [ ] Card corner radius and variant selection work
- [ ] Form field styling options apply
- [ ] Section background patterns (subtle, inverse, accent) apply
- [ ] Footer color modes (Dark/Light) toggle correctly

---

## Pitch Concepts

- [ ] Top 3 color concepts display with thumbnails
- [ ] Concept name editing saves
- [ ] Descriptive text field saves per concept
- [ ] Shareable pitch preview link generates
- [ ] Pitch link accessible without login (public share)

---

## Comments & Collaboration

- [ ] Comment pin drops anywhere on design canvas
- [ ] Comment pin drops on sitemap nodes
- [ ] Threaded replies work
- [ ] User avatars shown on pins
- [ ] Nearby pins cluster automatically
- [ ] Comment mode toggle switches between design and comment modes
- [ ] Permission levels enforced: Off (no commenting), View (read-only), Edit (create/reply)

---

## Export

- [ ] Elementor export — step-by-step instructions render, download works
- [ ] Gutenberg export — step-by-step instructions render, download works
- [ ] Figma export — step-by-step instructions render, download works
- [ ] React export blocked for FREE/STARTER plans (upgrade prompt shown)
- [ ] Role-based export: Developer+ can export, Client/Viewer cannot
- [ ] "Request another platform" modal opens for unsupported formats

---

## Team Management

- [ ] Member list displays avatar, name, email, role, join date
- [ ] Search/filter members by name or email
- [ ] Grid/list view toggle works
- [ ] Current user indicated
- [ ] Change member role saves correctly
- [ ] Remove member from workspace works with confirmation
- [ ] Email invite: enter email + role → invite sent → 7-day expiry countdown
- [ ] Copy invite link fallback works
- [ ] Link invite: generate reusable link with default role
- [ ] Pending invites list shows expiration countdown
- [ ] Resend invite sends new email
- [ ] Cancel invite removes from pending list
- [ ] Accepting email invite: email verification enforced (must match invited email)

---

## Roles & Permissions

- [ ] Admin role has all 12 permissions
- [ ] Designer role has 10/12 permissions (no billing)
- [ ] Developer role has 5/12 permissions (view + export only)
- [ ] Client role has 3/12 permissions (view + comments only)
- [ ] Viewer role has 2/12 permissions (read-only, no comments)
- [ ] Custom role creation: name, description, granular toggles save
- [ ] Real-time access level calculation updates as toggles change
- [ ] Role enforcement: restricted users cannot access gated routes

---

## Token Usage & Billing

- [ ] Summary cards show: Total allocated, Used (with progress bar), Remaining
- [ ] Usage table shows: Feature, AI Model, Sprout Tokens, Input Tokens, Output Tokens, Date & Time
- [ ] Pagination works (15 items per page)
- [ ] Color coding: Blue (normal), Amber (>90% used), Red (out of tokens)
- [ ] AI features blocked when out of tokens (token gate active)
- [ ] Plan badge updates on plan change

---

## User Settings

- [ ] Avatar upload accepts PNG, JPG, WebP up to 15MB
- [ ] Avatar upload rejects files over 15MB with error
- [ ] First and last name update saves
- [ ] Email field is read-only (non-editable)
- [ ] Password change works for non-OAuth users (requires current password)
- [ ] Password eye icon toggles visibility
- [ ] Google login status shown
- [ ] Email verification status shown

---

## Manage Mode — Site Connection

- [ ] Connect WordPress site via URL + username + Application Password
- [ ] Connection test discovers MCP endpoint successfully
- [ ] Credentials encrypted and stored (not exposed in UI)
- [ ] Post-connection: capabilities listed, health baseline established
- [ ] Disconnect removes credentials and clears cached data
- [ ] Demo mode (`?demo=true`) loads mock data without a real site

---

## Manage Mode — Overview Tab

- [ ] Live indicator with site URL shown
- [ ] Manual refresh fetches updated site data
- [ ] 6 summary cards accurate (Site Health, Active Plugins, Active Automations, WP Version, Custom Builds, Capabilities)
- [ ] Site Snapshot panels show: WP/PHP/theme/environment, backup status, plugin counts
- [ ] Site scan triggers manually and polls every 3s
- [ ] Scan evaluates 9 areas: Backups, Updates, Security, Performance, SEO, Environment, Accessibility, Custom Build, Automations
- [ ] Issues classified by type and severity (Critical/High/Medium/Low)
- [ ] Approval queue shows pending approvals with Approve/Reject buttons
- [ ] Recent Activity timeline shows last 20 items with category filter
- [ ] Upcoming Work shows scheduled items

---

## Manage Mode — Actions Tab

- [ ] Action library grouped by category (Protection, Maintenance, Performance, Security, Quality, Reporting, Content, Launch & Handoff)
- [ ] Quick Actions section shows 4–6 most-used actions
- [ ] Risk level color-coded (low/medium/high)
- [ ] Estimated time shown per action
- [ ] Run action → process thread generated with tool call timeline
- [ ] High-risk actions require approval before executing
- [ ] Follow-up chat input in process thread works
- [ ] Playbook creation: name, summary, ordered action list
- [ ] Playbook drag-drop action reordering works
- [ ] Approval checkpoints pause playbook until approved
- [ ] Automation creation: title + trigger (cron/webhook/manual) saves
- [ ] Automation pause/resume toggle works
- [ ] Custom action creation: title, category, risk, prompt template save

---

## Manage Mode — Build Tab

- [ ] Module creation via Quick Prompt mode
- [ ] Module creation via Detailed Setup (6 sections)
- [ ] Status pipeline: Draft → In Progress → Testing → Ready for Review → Released
- [ ] Files tab: code editor with syntax highlighting, add/edit/delete files
- [ ] Versions tab: semver list, diff viewer, Use and Rollback buttons
- [ ] Quality gates: run Security/Accessibility/Performance/Compatibility gates
- [ ] Reviews tab: client and team review status, change request handling
- [ ] Releases tab: deployment history, rollback to previous release
- [ ] Activity tab: per-module change log
- [ ] AI assistant chat is context-aware (loaded files, requirements)
- [ ] Module deployed to `wp-content/sproutos-mcp-sandbox/{module-name}/`

---

## Manage Mode — External Connectors

- [ ] Add HTTP connector (URL + optional basic auth)
- [ ] Add Stdio connector (command + args + env vars)
- [ ] Test connection → tool count returned
- [ ] Delete connector removes it
- [ ] Connector tools merge with WordPress MCP tools in action execution

---

## Plan Tiers & Feature Gating

- [ ] FREE plan limits enforced (unlimited projects and pages)
- [ ] STARTER plan limits enforced (2 projects, 20 pages/project, 20 components/page)
- [ ] Section lock shows upgrade prompt when limit hit
- [ ] Page lock shows upgrade prompt when limit hit
- [ ] Shared Concepts: FREE/STARTER limited to 1, PRO to 3, STUDIO/STUDIO+ unlimited
- [ ] React export blocked below PRO plan

---

## Performance

- [ ] Lighthouse performance ≥ 75 (target: 85+) on landing, login, dashboard
- [ ] No unused 3rd-party scripts
- [ ] JS bundle size not increased > 10% vs previous release
- [ ] Core Web Vitals (LCP, CLS, INP) within Google thresholds
- [ ] Design editor canvas loads within 3s on desktop

---

## Security

- [ ] HSTS header set with `max-age ≥ 31536000`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options` or CSP `frame-ancestors` set
- [ ] `Referrer-Policy` set to `strict-origin-when-cross-origin` or stricter
- [ ] No platform version leaked in `Server` or `X-Powered-By`
- [ ] HTTP → HTTPS redirect works on all origins
- [ ] Rate limiting active on `/login`, `/signup`, `/forgot-password`
- [ ] SQL injection / XSS spot-checks on user inputs
- [ ] Manage Mode: WordPress Application Passwords encrypted at rest
- [ ] Cross-tenant data isolation: Workspace A cannot access Workspace B data

---

## Accessibility

- [ ] axe-core: 0 critical / serious violations on key pages
- [ ] All interactive elements keyboard-reachable
- [ ] Color contrast ≥ AA on text
- [ ] Forms have proper `<label>` associations

---

## SEO

- [ ] Meta title & description on every public page
- [ ] Canonical URL on every page
- [ ] Open Graph (og:title, og:description, og:image) set
- [ ] `robots.txt` and `sitemap.xml` accessible
- [ ] 404 page returns proper 404 status

---

## Monitoring

- [ ] Error tracking (Sentry / similar) receiving events
- [ ] Uptime monitoring green on all critical endpoints
- [ ] Log aggregation shows no post-deploy error spikes
- [ ] Mixpanel events firing for key user actions

---

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
