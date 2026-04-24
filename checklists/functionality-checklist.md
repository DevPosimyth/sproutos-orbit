# Sprout OS — Functionality Checklist

> Covers every product feature end-to-end. Tick each item only after the feature works correctly under real conditions with real data.

---

## 1. Authentication & Onboarding

### Sign Up / Login
- [ ] Register with email + password → account created, verification email sent
- [ ] Verify email via link in email → account activated
- [ ] Login with verified credentials → lands on dashboard
- [ ] Login with wrong password → error shown, account not locked prematurely
- [ ] Login with unverified email → appropriate message shown
- [ ] Google OAuth → redirects to Google, returns authenticated, lands on dashboard
- [ ] Forgot password → email received within 60s → reset link works → new password accepted → old password rejected
- [ ] Session persists across browser tabs and page refreshes
- [ ] Session expires after inactivity and redirects to login

### Onboarding Flow
- [ ] First login triggers 5-step discovery flow
- [ ] Each step validates and requires selection before advancing
- [ ] Step 1: referral source options selectable
- [ ] Step 2: role/title free-text accepted
- [ ] Step 3: primary role chips (Designer, Developer, Marketer, Agency Owner, etc.) work
- [ ] Step 4: building-for options selectable
- [ ] Step 5: needs checkboxes multi-selectable
- [ ] Confetti animation fires on completion
- [ ] Slide-to-start interaction advances to dashboard
- [ ] 15-day free trial banner shows on first dashboard view
- [ ] Subsequent logins skip onboarding flow

---

## 2. Workspaces

- [ ] Default workspace auto-created on first login
- [ ] Create new workspace with custom name → appears in switcher
- [ ] Switch between workspaces → projects scoped correctly per workspace
- [ ] Workspace plan badge (FREE / Professional / STUDIO_PLUS) displays accurately
- [ ] Token allocation (e.g., "1.2K / 5K tokens") reflects correct workspace plan
- [ ] Trial days remaining badge counts down correctly
- [ ] Admin/Owner can move projects between workspaces
- [ ] Non-admin cannot move projects between workspaces

---

## 3. Projects

- [ ] Create blank project → opens with empty sitemap
- [ ] Create from website URL → crawl runs, brief auto-populated with extracted data
- [ ] Create from brief text → AI extracts and structures brief fields
- [ ] Create from PDF upload → AI extracts and structures brief fields
- [ ] Create from template → template sections applied to design
- [ ] Project grid view shows cards with 3-layer preview, name, last updated, member avatars
- [ ] Project list view shows same data in row format
- [ ] Search projects by name → results filter in real-time
- [ ] Sort by last viewed → most recently opened appears first
- [ ] Sort by last created → most recently created appears first
- [ ] Sort alphabetically → A–Z order correct
- [ ] Right-click card → "Move to workspace" opens workspace picker and moves project
- [ ] Right-click card → "Remove from workspace" removes with confirmation
- [ ] Recent projects sidebar shows ≤10 most recent with thumbnails
- [ ] Recent project right-click → Rename → name updates everywhere
- [ ] Recent project right-click → Duplicate → creates independent copy
- [ ] Recent project right-click → Copy Link → link works when opened
- [ ] Recent project right-click → Delete → project removed with confirmation
- [ ] Recent project right-click → Remove from Recent → removed from sidebar, not deleted
- [ ] "Get Started" checklist tracks completion state per project
- [ ] Confetti fires once on checklist completion

---

## 4. Guided Brief (6-Step Wizard)

- [ ] Step 1 — Project Basics: URL field triggers crawl and auto-populates fields
- [ ] Step 1 — Project name saves and updates project title
- [ ] Step 1 — Website type chips (Business, E-Commerce, Portfolio, etc.) single-select
- [ ] Step 1 — Primary goals chips multi-selectable (Leads, Bookings, Calls, etc.)
- [ ] Step 1 — Target locations single-select (Local / National / Global)
- [ ] Step 2 — Top offers / value propositions text saves
- [ ] Step 2 — Primary customer description saves
- [ ] Step 2 — Unique differentiators saves
- [ ] Step 2 — Tone chips multi-selectable (Premium, Friendly, Bold, etc.)
- [ ] Step 2 — Tones to avoid chips multi-selectable and distinct from preferred tones
- [ ] Step 3 — Customer objections text saves
- [ ] Step 3 — Available proof chips multi-selectable (Testimonials, Case Studies, etc.)
- [ ] Step 3 — Supporting proof document/link upload or entry saves
- [ ] Step 4 — Brand style chips single-select (Minimal, Premium, Playful, etc.)
- [ ] Step 4 — Logo upload (PNG/SVG) shows inline preview
- [ ] Step 4 — Preferred colors hex input saves and shows swatch
- [ ] Step 4 — Colors to avoid saves
- [ ] Step 4 — Typography preferences saved
- [ ] Step 5 — Liked site: URL + reason chips + notes saves and triggers crawl
- [ ] Step 5 — Crawled reference extracts colors, images, nav, structure
- [ ] Step 5 — Disliked site: URL saves
- [ ] Step 6 — Competitor URLs save
- [ ] Step 6 — Preferred sections multi-selectable from list
- [ ] Progress indicator advances correctly through all 6 steps
- [ ] Brief data persists if user navigates away and returns

---

## 5. Website Crawling & Analysis

- [ ] Color extraction: CSS variables, hex, RGB, HSL values captured
- [ ] Colors clustered by saturation, sorted by frequency
- [ ] Text extraction: headings (h1–h6), paragraphs, list items captured with hierarchy
- [ ] Navigation: top-level nav items extracted
- [ ] Contact info: emails, phones, addresses detected
- [ ] Social links: social media URLs detected
- [ ] Testimonials: quote + author + role extracted
- [ ] CTAs: call-to-action button text extracted
- [ ] Internal pages crawled (same-origin, admin/API/CDN/binary paths filtered out)
- [ ] OG tags, meta descriptions, brand statements, copyright text captured
- [ ] Crawl results auto-populate relevant brief fields
- [ ] Crawl handles sites that block bots gracefully (no crash, partial results returned)

---

## 6. Sitemap Editor

- [ ] Visual sitemap loads with all existing nodes and edges
- [ ] Create new page → node appears with unique name
- [ ] Rename page → validates for uniqueness, updates node label
- [ ] Delete page → confirmation shown, deletes node (last page cannot be deleted)
- [ ] Duplicate page → copy created with all sections intact
- [ ] Add section to page from library → section appears in node
- [ ] Rename section → updates node display
- [ ] Reorder sections within page via drag-and-drop
- [ ] Copy section → clipboard holds section data
- [ ] Cut section → removed from source page, held in clipboard
- [ ] Paste section → appears in target page
- [ ] Delete individual section → removed from node
- [ ] Mark section as global (navbar, footer) → shared across all pages
- [ ] Un-mark global section → removed from shared pool
- [ ] Static / Blog / Legal page containers group pages correctly
- [ ] Dagre auto-layout arranges nodes in alternating 3×2 rows
- [ ] Drag-and-drop page reordering updates layout
- [ ] All 51+ section types available in library
- [ ] AI suggestion banner appears for missing blog or legal pages
- [ ] Dismissing AI suggestion starts 30-second cooldown before reappearing

---

## 7. AI Sitemap Chat

- [ ] Chat panel opens from sitemap editor
- [ ] Sending a prompt adds/removes/renames pages as instructed
- [ ] Sending a prompt adds/removes/renames sections as instructed
- [ ] Multi-turn: context from previous message preserved
- [ ] Visual feedback (loading indicator) shown during action execution
- [ ] Undo button reverts AI-applied changes
- [ ] Conversation history persists when navigating away and returning
- [ ] Token usage deducted and reflected in workspace token display

---

## 8. Design Editor

- [ ] Canvas renders all sections in correct order
- [ ] Zoom in / zoom out buttons work in steps
- [ ] Zoom-to-fit shows all sections within viewport
- [ ] Specific zoom level (25%, 50%, 100%, 150%) selectable
- [ ] Canvas panning via click-and-drag
- [ ] Add section from library panel → section appended to canvas
- [ ] Drag-and-drop reordering of sections on canvas
- [ ] Section variant picker opens for each section
- [ ] Variant thumbnails (19% scale) display correct layout previews
- [ ] Selecting a variant replaces section on canvas immediately
- [ ] "AI Picks" variants marked and grouped
- [ ] Bookmark variant → saved to localStorage and restored on reload
- [ ] Variant search by section name or number filters list correctly
- [ ] Template presets (6 types) apply full set of sections when selected
- [ ] Inline text editing: clicking h1–h6, p, span, button, textarea opens editor
- [ ] Edited text persists across sessions (localStorage + backend sync)
- [ ] Legal compliance badge visible on privacy / cookie consent sections
- [ ] AI-generated content notice badge visible where applicable

---

## 9. Color System & Theming

- [ ] Pre-built color palettes selectable and apply to all sections
- [ ] Industry category palettes (Tech, Health, Finance, Creative, etc.) browsable
- [ ] Multiple palettes available per category
- [ ] Randomize colors within a category produces new valid palette
- [ ] Edit individual color via hex input → applies globally immediately
- [ ] Global saturation slider (0–100) adjusts all palette colors live
- [ ] Light/Dark theme toggle changes text color scheme globally
- [ ] Color visibility toggle hides/shows individual colors
- [ ] Section background color swatches collected from current sections
- [ ] 5 lightness levels shown per background color
- [ ] Hover on swatch previews color on section before applying
- [ ] Click swatch applies background color to selected section
- [ ] Saved colors list stores up to 5 colors and persists

---

## 10. Typography & Font Management

- [ ] Google Fonts panel loads all 1000+ fonts with live preview text
- [ ] Priority/curated font list (Outfit, Sora, Urbanist, etc.) shown at top
- [ ] Search by font name filters list in real-time
- [ ] Filter by category (serif, sans-serif, display, etc.) works
- [ ] Selecting heading font applies globally to all heading elements
- [ ] Selecting body font applies globally to all paragraph text
- [ ] Multiple font weights selectable per family
- [ ] Font selection saved per project and restored on reload
- [ ] Concept-specific font overrides apply only to that concept

---

## 11. AI Text Generation

- [ ] Clicking any text element shows inline AI popup
- [ ] Rewrite → generates new version of same content
- [ ] Make Shorter → shorter version generated
- [ ] Make Longer → longer version generated
- [ ] Fix Grammar → grammar corrected without content change
- [ ] Improve Writing → enhanced version generated
- [ ] Simplify → simpler version generated
- [ ] Generated text uses project description as business context
- [ ] Popup positioned to avoid sidebar overlap
- [ ] Token gate: if tokens exhausted, popup shows blocked state with message
- [ ] AI text works inside tablet iframe (768px)
- [ ] AI text works inside mobile iframe (375px)
- [ ] Accepted text replaces element content and persists

---

## 12. Image Handling & Media

- [ ] Clicking any image opens image picker
- [ ] Stock images grid loads and is browsable
- [ ] Searching stock images returns relevant results
- [ ] Selecting stock image replaces section image
- [ ] Upload custom image (JPEG/PNG/WebP) → replaces section image
- [ ] Image library tab shows previously used images
- [ ] Aspect ratio: Original preserves source ratio
- [ ] Aspect ratio: 1:1 crops to square
- [ ] Aspect ratio: 4:3 crops correctly
- [ ] Aspect ratio: 16:9 crops correctly
- [ ] Aspect ratio: 3:2 crops correctly
- [ ] Overlay color picker applies tint to image
- [ ] Overlay opacity slider adjusts from 0–100%
- [ ] Image source mapping persists and restores on page reload
- [ ] Light logo upload → used on light background sections
- [ ] Dark logo upload → used on dark background sections
- [ ] Logo sizing enforced at 120×40px while preserving aspect ratio
- [ ] AI image selection suggests images matching detected design style

---

## 13. Responsive Design (Multi-Viewport)

- [ ] Desktop mode: sections render directly in main DOM
- [ ] Tablet mode: iframe renders at exactly 768×1024
- [ ] Mobile mode: iframe renders at exactly 375×812
- [ ] CSS custom properties sync into tablet iframe
- [ ] CSS custom properties sync into mobile iframe
- [ ] Google Fonts load inside iframes
- [ ] Click events propagate in iframes (text editing, image picker trigger)
- [ ] Scroll events propagate in iframes
- [ ] Touch events propagate in iframes
- [ ] Auto-height of iframe adjusts when section content changes
- [ ] Switching viewport reapplies all current design overrides

---

## 14. AI Design Agent

- [ ] Chat panel opens within design editor
- [ ] GPT-4o model selectable and used for generation
- [ ] GPT-4o Mini model selectable and used
- [ ] Llama 3.3 model selectable and used
- [ ] AI receives context: current colors, fonts, variants, sitemap, template assignments
- [ ] AI presents multiple design options for user selection
- [ ] Selecting an option applies the change in real-time to the canvas
- [ ] Applied suggestions tracked (accepted status stored)
- [ ] Undo reverts last AI-applied design change
- [ ] Redo re-applies undone change
- [ ] Token usage shown and deducted per request
- [ ] Conversation history saved per project

---

## 15. Styleguide & Design System

- [ ] Button size Small (S) applies globally to all button elements
- [ ] Button size Medium (M) applies globally
- [ ] Button size Large (L) applies globally
- [ ] Corner radius Square applies to buttons globally
- [ ] Corner radius Slight applies to buttons globally
- [ ] Corner radius Rounded applies to buttons globally
- [ ] Corner radius Pill applies to buttons globally
- [ ] Button icon display toggle shows/hides icons globally
- [ ] Card corner radius options apply globally
- [ ] Card design variant selection changes card style globally
- [ ] Form field styling options apply globally to input elements
- [ ] Section background patterns (subtle, inverse, accent) apply per selection
- [ ] Footer Dark mode applies dark background to footer section
- [ ] Footer Light mode applies light background to footer section

---

## 16. Pitch Concepts

- [ ] Top 3 color concepts displayed with visual thumbnails
- [ ] Each concept shows the correct palette preview
- [ ] Concept name editable inline and saved
- [ ] Descriptive text field editable and saved per concept
- [ ] Generate shareable pitch preview link → link created
- [ ] Shareable link accessible without login
- [ ] Link shows correct concept thumbnails and descriptions
- [ ] Multiple shared links for different concepts work independently

---

## 17. Comments & Collaboration

### Design Canvas Comments
- [ ] Enter comment mode via toggle
- [ ] Drop pin anywhere on canvas → comment input appears
- [ ] Type comment and submit → pin persists on canvas
- [ ] Multiple pins visible simultaneously
- [ ] Nearby pins cluster automatically (no overlapping pins)
- [ ] Click pin → opens comment thread
- [ ] Reply in thread → reply appears nested
- [ ] User avatars shown on pins and in thread
- [ ] Exit comment mode → design mode restored, pins visible but passive
- [ ] Comment permission "Off" → no comment UI visible
- [ ] Comment permission "View" → pins visible, no input shown
- [ ] Comment permission "Edit" → full pin + reply UI available

### Sitemap Comments
- [ ] Pin comment on sitemap node
- [ ] Comment history panel lists all sitemap comments
- [ ] Real-time sync: comment from one user appears for another without refresh

---

## 18. Export

- [ ] Elementor export: step-by-step instructions render with screenshots
- [ ] Elementor export: download/copy action works
- [ ] Gutenberg export: step-by-step instructions render with screenshots
- [ ] Gutenberg export: download/copy action works
- [ ] Figma export: step-by-step instructions render with screenshots
- [ ] Figma export: download/copy action works
- [ ] React export: blocked for FREE and STARTER plans → upgrade prompt shown
- [ ] React export: works for PRO and above
- [ ] Developer role can access export
- [ ] Client and Viewer roles cannot access export
- [ ] "Request another platform" button opens modal
- [ ] Modal allows submitting platform request

---

## 19. Team Management

- [ ] Member list shows avatar, name, email, role, join date for all members
- [ ] Search members by name → filters list
- [ ] Search members by email → filters list
- [ ] Grid view shows members as cards
- [ ] List view shows members as rows
- [ ] Current user marked distinctly in member list
- [ ] Change member role → role updated immediately in list
- [ ] Remove member → confirmation dialog → member removed from workspace
- [ ] Email invite: enter email + select role → "Invite Sent" confirmation
- [ ] Invited user receives HTML email with invite link
- [ ] Copy invite link fallback works (link copies to clipboard)
- [ ] Invite link expires after 7 days → expired link shows error
- [ ] Active invite link: recipient must be signed in to accept
- [ ] Email invite: accepting with non-matching email → rejected with message
- [ ] Email invite: accepting with matching email → added to workspace
- [ ] Link invite: generate reusable link with default role
- [ ] Link invite: multiple recipients can use same link
- [ ] Pending invites list shows email, role, expiry countdown
- [ ] Resend invite → new email sent, expiry resets to 7 days
- [ ] Cancel invite → removed from pending list, link invalidated

---

## 20. Roles & Permissions

- [ ] Admin: all 12 permission groups accessible
- [ ] Designer: 10/12 permissions (no billing access)
- [ ] Developer: 5/12 permissions (view + export only, no design edit)
- [ ] Client: 3/12 permissions (view + comments only)
- [ ] Viewer: 2/12 permissions (read-only, no commenting)
- [ ] Role enforcement: Designer cannot access billing page
- [ ] Role enforcement: Developer cannot edit design
- [ ] Role enforcement: Client cannot access team management
- [ ] Role enforcement: Viewer cannot create comments
- [ ] Create custom role: name + description + permission toggles save
- [ ] Custom role permission toggles granularly control each of the 12 groups
- [ ] Real-time access level counter updates as toggles change
- [ ] Custom role assignable to new workspace members

---

## 21. Token Usage & Billing

- [ ] Summary card: Total Allocated shows correct plan allocation
- [ ] Summary card: Used shows current consumption with progress bar
- [ ] Summary card: Remaining reflects Used subtracted from Allocated
- [ ] Progress bar fills proportionally to usage
- [ ] Color: Blue shown when usage is normal (<90%)
- [ ] Color: Amber shown when usage >90%
- [ ] Color: Red shown when out of tokens (100%)
- [ ] Usage table rows: Feature, AI Model, Sprout Tokens, Input Tokens, Output Tokens, Date & Time
- [ ] Usage table paginated at 15 rows per page
- [ ] Pagination Next / Previous controls work
- [ ] Each AI action (text gen, design agent, sitemap chat) appears as a row after use
- [ ] AI features blocked when token balance is 0

---

## 22. User Settings

- [ ] Avatar upload: PNG accepted and shown
- [ ] Avatar upload: JPG accepted and shown
- [ ] Avatar upload: WebP accepted and shown
- [ ] Avatar upload: file >15MB rejected with size error
- [ ] First name and last name saved and reflected in header
- [ ] Email field is read-only (non-editable)
- [ ] Password change: correct current + valid new → password updated
- [ ] Password change: wrong current password → error shown
- [ ] Password change: new password < minimum length → validation error
- [ ] Password eye toggle shows/hides password in input
- [ ] Password change section hidden for Google OAuth users
- [ ] Google login status shown accurately
- [ ] Email verification status shown accurately

---

## 23. Manage Mode — Site Connection

- [ ] Enter site URL + username + Application Password → connection tested
- [ ] Successful connection: MCP endpoint discovered, capabilities listed
- [ ] Failed connection: clear error message (wrong URL, wrong credentials, site unreachable)
- [ ] Post-connection: site data (plugins, theme, version) fetched and displayed
- [ ] Cached data shown immediately; background refresh updates stale data
- [ ] Disconnect site → credentials removed, cached data cleared
- [ ] Demo mode (`?demo=true`) bypasses real connection and loads mock data

---

## 24. Manage Mode — Overview Tab

- [ ] Live indicator shows site URL and sync status
- [ ] Manual refresh button fetches latest site data from MCP
- [ ] Summary card: Site Health (Good / Warning / Critical) reflects scan results
- [ ] Summary card: Active Plugins count accurate
- [ ] Summary card: Active Automations count accurate
- [ ] Summary card: WordPress Version accurate
- [ ] Summary card: Custom Builds count accurate
- [ ] Summary card: Capabilities count accurate
- [ ] Site Snapshot: WP version, PHP version, theme name, environment shown
- [ ] Site Snapshot: backup status and last backup date shown
- [ ] Site Snapshot: active plugins, total installed, updates available shown
- [ ] Trigger site scan → polling starts at 3-second intervals
- [ ] Scan completes within 60 seconds (timeout handled gracefully)
- [ ] Scan evaluates: Backups, Updates, Security, Performance, SEO, Environment, Accessibility, Custom Build, Automations
- [ ] Issues displayed with type and severity (Critical / High / Medium / Low)
- [ ] Approval queue shows pending approvals with Approve / Reject buttons
- [ ] Approving item → proceeds to execution
- [ ] Rejecting item → execution cancelled, status updated
- [ ] Activity timeline shows last 20 events with relative timestamps
- [ ] Category filter (Operations, Build, Approvals, AI/System, Security, Content) filters timeline
- [ ] "Load more" loads additional activity events

---

## 25. Manage Mode — Actions Tab

- [ ] Action library grouped by 8 categories
- [ ] Quick Actions shows 4–6 most-used actions
- [ ] Action detail panel shows title, description, category, risk level, estimated time
- [ ] Low-risk action runs without approval prompt
- [ ] High-risk action creates approval request before executing
- [ ] Run action → process thread created with initialization step
- [ ] Process thread shows tool call stages with status
- [ ] Process thread shows Claude's reasoning and final output
- [ ] Follow-up chat in process thread sends additional instructions to Claude
- [ ] Process thread persists when navigating away and returning
- [ ] Playbook creation: name, summary, ordered action list saved
- [ ] Drag-and-drop action reordering in playbook edit mode
- [ ] Approval checkpoint between playbook steps pauses execution
- [ ] Playbook resumes after checkpoint is approved
- [ ] Automation: cron trigger fires at correct scheduled time
- [ ] Automation: webhook trigger fires when endpoint called
- [ ] Automation: pause/resume toggle works
- [ ] Automation: execution mode (direct_mcp, claude_haiku, claude_sonnet) respected
- [ ] Custom action: title, category, risk, prompt template saved and usable
- [ ] Custom actions appear in library alongside default actions

---

## 26. Manage Mode — Build Tab

### Module Creation
- [ ] Quick Prompt mode: name + description + submit → files auto-scaffolded
- [ ] Detailed Setup: all 6 sections (Basic Info, Requirements, References, Technical, Smart Setup, Review) save correctly
- [ ] All 8 module types selectable
- [ ] All related site areas selectable

### Module Workspace
- [ ] Files tab: PHP/JS/CSS/HTML/README files listed in tree
- [ ] Code editor: syntax highlighting active for each file type
- [ ] Add file → appears in tree
- [ ] Edit file content → saved with last-modified timestamp
- [ ] Delete file → removed with confirmation
- [ ] Versions tab: versions listed in semver order
- [ ] Create version → snapshot of current files stored
- [ ] Diff viewer: side-by-side comparison between two versions
- [ ] "Use" button sets selected version as current
- [ ] Rollback reverts files to selected version
- [ ] Quality tab: run Essential / Standard / Advanced gate packs
- [ ] Security gates: code injection, auth, vulnerability scan results shown
- [ ] Accessibility gates: WCAG, contrast, keyboard results shown
- [ ] Performance gates: load time, memory, DB query results shown
- [ ] Compatibility gates: WP version, PHP version, plugin conflicts shown
- [ ] Gate statuses: Passed / Failed / Warning / Pending shown correctly
- [ ] Reviews tab: client review status and team review status shown
- [ ] Submit review comment → appears in thread
- [ ] Change request handling: status updates to "Needs Changes"
- [ ] Releases tab: deploy creates release record with date and deployer
- [ ] Rollback to previous release: files reverted to that release state
- [ ] Activity tab: all file edits, version creates, status changes logged
- [ ] AI assistant: chat is context-aware of current files and requirements
- [ ] Module files deployed to `wp-content/sproutos-mcp-sandbox/{module-name}/` on WordPress site

---

## 27. Manage Mode — External Connectors

- [ ] Add HTTP connector: URL + optional basic auth → saved
- [ ] Test HTTP connector → returns tool count or error
- [ ] Add Stdio connector: command + args + env vars → saved
- [ ] Test Stdio connector → spawns process, returns tool count or error
- [ ] Delete connector → removed from list
- [ ] Tools from connector merged with WordPress MCP tools in action execution
- [ ] Name collision deduplication: no duplicate tool names passed to Claude
- [ ] Connector referenced in action runs correctly with combined tool set

---

## 28. Plan Tiers & Feature Gating

- [ ] FREE plan: unlimited projects and pages allowed
- [ ] STARTER plan: 3rd project blocked with upgrade prompt
- [ ] STARTER plan: 21st page blocked with upgrade prompt
- [ ] STARTER plan: 21st component per page blocked with upgrade prompt
- [ ] Shared Concepts: FREE/STARTER limited to 1 (2nd concept blocked)
- [ ] Shared Concepts: PRO limited to 3 (4th blocked)
- [ ] Shared Concepts: STUDIO/STUDIO+ unlimited
- [ ] React export blocked below PRO with upgrade prompt
- [ ] Export formats available per plan tier shown correctly in export panel
- [ ] Early Access / Studio+ application form submits correctly
- [ ] Application states (Never Applied / Submitted / Pending / Rejected) display correctly
- [ ] Admin can approve/reject Studio+ applications with notes
