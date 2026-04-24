# Sprout OS — Responsiveness Checklist

> Test every surface at each breakpoint. Use real devices or accurate emulators. Flag overflow, broken layouts, and unreachable interactive elements.

---

## Viewports to Cover

| Label | Dimensions | Device Reference |
|---|---|---|
| Desktop Large | 1920 × 1080 | Full-HD monitor |
| Desktop Standard | 1440 × 900 | MacBook Pro 14" |
| Desktop Small | 1280 × 800 | Laptop |
| Tablet Landscape | 1024 × 768 | iPad landscape |
| Tablet Portrait | 768 × 1024 | iPad portrait (primary) |
| Mobile Large | 414 × 896 | iPhone 11 Pro Max |
| Mobile Standard | 375 × 812 | iPhone X / Pixel 5 (primary) |
| Mobile Small | 320 × 568 | iPhone SE (1st gen) |

> **Playwright projects:** `sproutos-desktop` (1440×900), `sproutos-tablet` (768×1024), `sproutos-mobile` (375×812)

---

## Global Layout

- [ ] No horizontal scrollbar at any breakpoint
- [ ] No content overflow clipped behind screen edges
- [ ] Page body does not exceed screen width at any breakpoint
- [ ] Minimum tap target size ≥ 44×44 px on mobile
- [ ] Font sizes legible without pinch-to-zoom on mobile (≥14px body)
- [ ] Images scale within containers and do not overflow
- [ ] Fixed/sticky elements do not block main content on mobile

---

## Header & Navigation

- [ ] Desktop: full navigation links visible in header
- [ ] Tablet: navigation links still visible or collapsed cleanly
- [ ] Mobile: hamburger menu icon visible and tappable
- [ ] Mobile: hamburger menu opens a full nav overlay
- [ ] Mobile: nav overlay closes on menu item tap or close button
- [ ] Workspace switcher dropdown accessible at all breakpoints
- [ ] Token allocation display and plan badge readable on mobile
- [ ] Trial days badge does not overflow header on small screens

---

## Authentication Pages

### Login (`/login`)
- [ ] Desktop: form centered with appropriate max-width
- [ ] Tablet: form fills available space without overflow
- [ ] Mobile: fields stack vertically, full-width, tappable
- [ ] Mobile: keyboard does not push form off screen
- [ ] Google OAuth button visible and tappable at all sizes
- [ ] Error messages appear without breaking layout

### Signup (`/signup`)
- [ ] All fields stack cleanly on mobile
- [ ] "Already have an account?" link visible on mobile

### Forgot Password (`/forgot-password`)
- [ ] Form centered and usable at all breakpoints

---

## Onboarding Flow

- [ ] Each step fills the screen without scroll on desktop
- [ ] Option chips wrap cleanly on tablet and mobile
- [ ] CTA button ("Next", "Get Started") always visible without scrolling on mobile
- [ ] Confetti animation contained within viewport (no full-page overflow)
- [ ] Slide-to-start interaction operable with touch on mobile

---

## Dashboard & Projects

- [ ] Desktop: project grid shows 3–4 cards per row
- [ ] Tablet: project grid shows 2 cards per row
- [ ] Mobile: project grid shows 1 card per row
- [ ] Project list view: all columns readable at tablet and mobile
- [ ] Search bar full-width on mobile
- [ ] Sort dropdown accessible and usable on mobile
- [ ] Project card 3-layer preview scales proportionally
- [ ] "Get Started" checklist readable and interactive on mobile
- [ ] Recent projects sidebar hidden or collapsed on mobile

---

## Guided Brief Wizard

- [ ] Step navigation (progress bar + buttons) visible without scrolling on each step
- [ ] All form fields full-width on mobile, readable on tablet
- [ ] Logo upload dropzone usable on touch (tap to select file)
- [ ] Color hex input and swatch side-by-side on mobile
- [ ] Tone chips wrap to multiple lines cleanly on mobile
- [ ] Multi-step wizard does not lose data when orientation changes

---

## Sitemap Editor

- [ ] Desktop: canvas fills available width with sidebar panels alongside
- [ ] Tablet: canvas usable, sidebar panels accessible
- [ ] Mobile: canvas pinch-to-zoom and pan functional
- [ ] Sidebar panels collapsible on tablet/mobile
- [ ] Section type library panel scrollable on mobile
- [ ] Node labels legible at default zoom on mobile
- [ ] Drag-and-drop reordering operable with touch on tablet/mobile
- [ ] AI chat panel opens as overlay on mobile without blocking canvas

---

## Design Editor

- [ ] Desktop: infinite canvas fills full content area
- [ ] Desktop: section library and settings panels sidebar alongside canvas
- [ ] Tablet: canvas still usable, panels accessible via tabs or icons
- [ ] Mobile: canvas scrollable vertically, full-width
- [ ] Zoom controls accessible on mobile (no hidden behind panel)
- [ ] Variant picker panel slides up or overlays on mobile
- [ ] Variant thumbnails legible at mobile screen size
- [ ] Inline text editor popup does not overflow screen on mobile
- [ ] Drag handles visible on touch hover for section reordering
- [ ] Toolbar icons minimum 44×44px tap target on mobile

### Tablet/Mobile Iframe Rendering
- [ ] Tablet iframe (768×1024) renders sections at tablet breakpoints
- [ ] Mobile iframe (375×812) renders sections at mobile breakpoints
- [ ] Switching viewport modes does not cause layout flash
- [ ] Iframe auto-heights correctly when content expands

---

## Color System Panel

- [ ] Color swatches grid does not overflow panel on any breakpoint
- [ ] Hex input field and swatch side-by-side on all sizes
- [ ] Saturation slider full-width and draggable on touch
- [ ] Background color swatches (5 lightness levels) accessible on mobile

---

## Typography Panel

- [ ] Font list scrollable on all breakpoints
- [ ] Font preview text legible in panel at mobile size
- [ ] Search input full-width on mobile

---

## AI Panels (Text Gen, Sitemap Chat, Design Agent)

- [ ] AI popup positions correctly within viewport on mobile (no off-screen)
- [ ] Chat input field full-width and focusable on mobile keyboard
- [ ] Chat message bubbles do not overflow container
- [ ] Token usage indicator readable at small sizes
- [ ] Undo button accessible on mobile

---

## Image Picker

- [ ] Stock image grid responds: 3 columns desktop, 2 columns tablet, 1–2 columns mobile
- [ ] Upload dropzone full-width on mobile
- [ ] Aspect ratio preset buttons wrap cleanly on mobile
- [ ] Overlay sliders draggable on touch

---

## Export Panel

- [ ] Step-by-step instructions readable at all breakpoints
- [ ] Instruction screenshots scale within panel (no overflow)
- [ ] Export action button (download/copy) full-width on mobile

---

## Team Management

- [ ] Member grid: 3–4 per row on desktop, 2 on tablet, 1 on mobile
- [ ] Member list view: columns readable at tablet; collapses gracefully on mobile
- [ ] Search/filter bar full-width on mobile
- [ ] Invite form fields stack on mobile
- [ ] Role dropdown accessible on touch
- [ ] Pending invites list scrollable on mobile

---

## Roles & Permissions

- [ ] Permission toggles table scrolls horizontally on mobile if needed
- [ ] Role cards readable at tablet/mobile
- [ ] Custom role form fields stack on mobile

---

## Token Usage Dashboard

- [ ] Summary cards: 3 across on desktop, stack to 1 per row on mobile
- [ ] Usage table: columns readable on tablet; horizontally scrollable on mobile
- [ ] Pagination controls accessible on mobile

---

## User Settings

- [ ] Avatar upload button accessible on mobile
- [ ] Form fields full-width and keyboard-friendly on mobile
- [ ] Password eye toggle tappable on mobile (min 44px)

---

## Manage Mode

### Overview Tab
- [ ] Summary cards: 3×2 grid on desktop, 2×3 on tablet, 1×6 on mobile
- [ ] Site Snapshot panels stack on mobile
- [ ] "Needs Attention" issue list scrollable on mobile
- [ ] Approval queue actions (Approve/Reject) tappable on mobile
- [ ] Activity timeline readable on mobile (relative timestamps, category badges)

### Actions Tab
- [ ] Two-column layout collapses to single column on mobile (detail panel below library)
- [ ] Action library scrollable on all breakpoints
- [ ] Process thread chat input accessible on mobile keyboard
- [ ] Playbook canvas view pannable/zoomable on touch

### Build Tab
- [ ] Three-column layout collapses: nav tab (full-width) → workspace → AI sidebar
- [ ] File tree sidebar collapsible on mobile
- [ ] Code editor horizontally scrollable for long lines
- [ ] Diff viewer side-by-side readable on tablet; stacked on mobile
- [ ] Quality gate result cards stack on mobile

---

## Orientation Changes

- [ ] Portrait → landscape on tablet: sitemap editor canvas reflows without data loss
- [ ] Portrait → landscape on mobile: design editor does not break or crash
- [ ] Orientation change does not close modals or reset form state
- [ ] Iframe viewport mode does not change on orientation switch (viewport is controlled by the UI toggle, not device orientation)

---

## Touch & Pointer

- [ ] All drag-and-drop interactions (section reorder, sitemap nodes) work with touch
- [ ] Sliders (saturation, opacity) draggable with single finger on touch
- [ ] Pinch-to-zoom on design canvas works on mobile
- [ ] Long-press does not trigger browser context menu where undesired
- [ ] Tap target for small icons (bookmark, close) ≥ 44×44px

---

## Keyboard on Mobile

- [ ] Text inputs scroll page to keep input above keyboard (no keyboard covers field)
- [ ] Inline text editing in design editor works with on-screen keyboard
- [ ] Form submission via keyboard "Go" / "Enter" works correctly
