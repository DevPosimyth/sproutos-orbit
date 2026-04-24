# Sprout OS — UI / UX Checklist

## Responsive Behaviour

- [ ] Desktop 1440 × 900 — no horizontal scroll, no overflow
- [ ] Tablet 768 × 1024 — nav collapses cleanly
- [ ] Mobile 375 × 812 — buttons reachable, text legible
- [ ] Rotation (portrait ↔ landscape) on mobile does not break layout
- [ ] Design editor iframes (tablet/mobile) render at correct dimensions

## Navigation

- [ ] Primary nav links work on every page
- [ ] Active page highlighted in nav
- [ ] Mobile hamburger menu opens / closes cleanly
- [ ] Footer links work (Privacy, Terms, Contact)
- [ ] Workspace switcher dropdown opens and closes without page reload
- [ ] Sidebar recent projects accessible without full page navigation

## Onboarding Flow

- [ ] 5-step discovery flow renders each question clearly
- [ ] Progress indicator reflects current step
- [ ] Confetti animation fires on completion
- [ ] Slide-to-start interaction is intuitive and responsive
- [ ] 15-day trial banner visible but not intrusive

## Dashboard & Projects

- [ ] Project cards display stacked 3-layer preview effect
- [ ] Grid / list view toggle is clearly labeled and remembers preference
- [ ] Search field is immediately focused or accessible
- [ ] Sort dropdown labels are clear (Last Viewed, Created, A–Z)
- [ ] Empty project state includes helpful CTA
- [ ] "Get Started" checklist items show completion state clearly
- [ ] Right-click context menu appears at cursor position

## Guided Brief Wizard

- [ ] Step labels and progress bar visible throughout all 6 steps
- [ ] URL field clearly suggests entering an existing site URL
- [ ] Logo upload preview renders inline after upload
- [ ] Color hex input shows a color swatch next to the value
- [ ] Tone chips (Premium, Friendly, Bold, etc.) visually toggle on/off
- [ ] "Tones to avoid" area clearly distinguished from preferred tones
- [ ] Reference site crawl shows loading state while extracting

## Sitemap Editor

- [ ] Node labels are legible at default zoom level
- [ ] Section previews within nodes are readable
- [ ] Drag handles visible on hover for page and section reordering
- [ ] Confirmation dialog appears before page deletion
- [ ] Global sections (navbar/footer) visually distinguished from regular sections
- [ ] AI suggestion banner is dismissable and doesn't block the canvas
- [ ] Add page and add section flows are discoverable

## Design Editor

- [ ] Zoom level indicator visible at all times
- [ ] Zoom-to-fit snaps to show all sections
- [ ] Section variant thumbnails clearly differentiated from each other
- [ ] "AI Picks" badge is distinct and recognizable
- [ ] Bookmarked variants separated or marked from non-bookmarked
- [ ] Inline text editing cursor appears on click without delay
- [ ] Active section visually highlighted (border or ring)
- [ ] Drag handle visible on hover for section reordering
- [ ] Legal compliance warning badge is noticeable but not alarming
- [ ] Template preset cards show meaningful preview thumbnails

## Color System

- [ ] Color swatches large enough to distinguish shades
- [ ] Active palette clearly selected
- [ ] Saturation slider labeled and shows live preview
- [ ] Light/Dark text toggle shows before-and-after contrast
- [ ] Section background swatches preview on hover before applying
- [ ] Saved colors list shows "up to 5" limit clearly

## Typography

- [ ] Font preview in the panel uses the actual font (not system fallback)
- [ ] Curated/priority fonts visually separated from full list
- [ ] Heading and body font sections clearly labeled
- [ ] Selected font shown in active state

## AI Panels (Text, Sitemap Chat, Design Agent)

- [ ] Chat input clearly focused after panel opens
- [ ] Loading/thinking indicator visible while AI responds
- [ ] AI response distinguishable from user message (avatar, alignment, color)
- [ ] Undo button visible after AI applies a change
- [ ] Token usage shown near the action (not buried in settings)
- [ ] Error state shown clearly if AI request fails or tokens are exhausted

## Image Picker

- [ ] Stock images load with a thumbnail grid layout
- [ ] Upload dropzone clearly indicated
- [ ] Aspect ratio presets labeled and applied visually
- [ ] Overlay opacity slider shows live preview on the image
- [ ] Logo light/dark variant tabs clearly separated

## Export

- [ ] Step-by-step instructions are numbered and scannable
- [ ] Screenshots in instructions legible and relevant
- [ ] Plan-gated export shows upgrade prompt (not a broken button)
- [ ] "Request another platform" link visible for unsupported platforms

## Team & Invites

- [ ] Role dropdown in invite form shows all 5 options with descriptions
- [ ] 7-day expiry countdown clearly visible on pending invites
- [ ] Resend and Cancel actions distinct and labeled
- [ ] Current user clearly marked in member list
- [ ] Removing a member requires confirmation

## Roles & Permissions

- [ ] 12 permission toggles labeled clearly (no jargon)
- [ ] Real-time access level indicator updates immediately on toggle change
- [ ] Built-in roles not editable (visually locked)
- [ ] Custom role form clearly separated from built-in role list

## Token Usage

- [ ] Progress bar color changes at >90% (amber) and 100% (red)
- [ ] Usage table columns aligned and readable at all viewports
- [ ] Pagination controls clearly labeled (Previous / Next / page numbers)
- [ ] Token exhaustion state shown with a clear message, not a silent failure

## Manage Mode — General

- [ ] Three sub-tabs (Overview, Actions, Build) clearly labeled and always visible
- [ ] Live indicator (green dot) visible when site is connected
- [ ] Demo mode banner visible when `?demo=true` is active
- [ ] Disconnect site action requires confirmation

## Manage Mode — Overview

- [ ] 6 summary cards laid out in a consistent grid
- [ ] Site Scan trigger button is prominent
- [ ] Scan in-progress state shows spinner or polling indicator
- [ ] Issue severity (Critical/High/Medium/Low) color-coded consistently
- [ ] Approval queue items clearly show type, risk level, and action buttons
- [ ] Activity timeline uses relative timestamps (not raw UTC)
- [ ] Category filter chips are selectable and visually toggle

## Manage Mode — Actions

- [ ] Action risk level (low/medium/high) color-coded on cards
- [ ] Estimated time shown per action card
- [ ] "Approval required" flag is visually distinct from standard actions
- [ ] Process thread tool call stages show timestamps and status
- [ ] Follow-up chat input accessible after action completes
- [ ] Playbook canvas view shows flow diagram clearly

## Manage Mode — Build

- [ ] Status pipeline stages (Request → Build → Check → Review → Release) visible
- [ ] File tree clearly shows folder/file hierarchy
- [ ] Code editor has syntax highlighting
- [ ] Diff viewer side-by-side comparison is readable
- [ ] Quality gate results color-coded (Passed / Failed / Warning / Pending)
- [ ] Rollback button clearly labeled with the target version number

## Forms

- [ ] Fields have visible `<label>` or accessible name
- [ ] Placeholder text is not the only label
- [ ] Validation messages appear near the invalid field
- [ ] Submit button shows loading state while request in flight
- [ ] Disabled state is visually distinct
- [ ] Tab order follows visual flow

## Loading & Empty States

- [ ] Skeleton or spinner shows while data loads
- [ ] Empty states include helpful copy and CTA
- [ ] Error states explain what went wrong and how to recover

## Typography

- [ ] Body text ≥ 16 px on desktop, ≥ 14 px on mobile
- [ ] Headings have clear hierarchy (h1 → h2 → h3)
- [ ] Line length 45–85 chars on prose
- [ ] Adequate line-height (1.4–1.6 on body)

## Color & Contrast

- [ ] Text meets WCAG AA contrast (4.5:1 body, 3:1 large)
- [ ] Interactive states (hover, focus, active) visible
- [ ] Focus ring visible for keyboard users
- [ ] Color is not the only indicator (error ≠ just red)

## Accessibility

- [ ] All images have `alt` (empty `alt=""` for decorative)
- [ ] Buttons are `<button>`, links are `<a>` — not swapped
- [ ] Modal dialogs trap focus and restore on close
- [ ] Page has proper landmark regions (`<main>`, `<nav>`, `<footer>`)
- [ ] `lang` attribute set on `<html>`

## Content

- [ ] Copy free of typos and grammar issues
- [ ] No lorem-ipsum or placeholder text in production
- [ ] Dates / times localized correctly
- [ ] Error messages are human, not `{error.code}`

## Microinteractions

- [ ] Hover and focus states on all clickable elements
- [ ] Button press gives visual feedback
- [ ] Transitions are smooth, not jarring (200–300 ms typical)
- [ ] No motion that can't be disabled (respect `prefers-reduced-motion`)
- [ ] Confetti animation (onboarding, checklist completion) plays once and stops
