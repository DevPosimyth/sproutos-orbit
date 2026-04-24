# Sprout OS — Accessibility Checklist

> Target: WCAG 2.1 Level AA. Run axe-core on all key pages. Zero critical/serious violations before release.

---

## Automated Scan (axe-core)

- [ ] `/login` — 0 critical, 0 serious violations
- [ ] `/signup` — 0 critical, 0 serious violations
- [ ] `/forgot-password` — 0 critical, 0 serious violations
- [ ] `/dashboard` — 0 critical, 0 serious violations
- [ ] Onboarding flow (each step) — 0 critical, 0 serious violations
- [ ] Sitemap Editor — 0 critical, 0 serious violations
- [ ] Design Editor (desktop) — 0 critical, 0 serious violations
- [ ] Design Editor (tablet iframe) — 0 critical, 0 serious violations
- [ ] Design Editor (mobile iframe) — 0 critical, 0 serious violations
- [ ] Team Management — 0 critical, 0 serious violations
- [ ] Roles & Permissions — 0 critical, 0 serious violations
- [ ] Token Usage dashboard — 0 critical, 0 serious violations
- [ ] User Settings — 0 critical, 0 serious violations
- [ ] Manage Mode — Overview tab — 0 critical, 0 serious violations
- [ ] Manage Mode — Actions tab — 0 critical, 0 serious violations
- [ ] Manage Mode — Build tab — 0 critical, 0 serious violations

---

## Semantic HTML

- [ ] Each page has exactly one `<h1>`
- [ ] Heading hierarchy is correct: h1 → h2 → h3 (no skipping levels)
- [ ] Navigation wrapped in `<nav>` with an accessible name (`aria-label`)
- [ ] Main content wrapped in `<main>`
- [ ] Footer wrapped in `<footer>`
- [ ] Sidebar panels wrapped in `<aside>` or have `role="complementary"`
- [ ] Lists (`<ul>`, `<ol>`) used for groups of related items, not `<div>` chains
- [ ] `<button>` used for actions, `<a>` used for navigation — not swapped
- [ ] `<form>` wraps all form fields with a submit mechanism
- [ ] `<table>` used only for tabular data (usage table, permissions table); no layout tables

---

## Color & Contrast

- [ ] Normal text (< 18pt): contrast ratio ≥ 4.5:1 against background
- [ ] Large text (≥ 18pt or ≥ 14pt bold): contrast ratio ≥ 3:1
- [ ] UI components (form borders, icon-only buttons): contrast ratio ≥ 3:1
- [ ] Focus ring visible on all interactive elements (contrast ratio ≥ 3:1 against adjacent color)
- [ ] Error state: red color not the only indicator (icon or text label also present)
- [ ] Disabled state: low-contrast acceptable but element is `disabled` or `aria-disabled`
- [ ] Color palette previews in design editor: color names or hex values shown (not color alone)
- [ ] Token usage progress bar: bar fill color has text label or percentage alongside
- [ ] Issue severity badges: severity label shown in text, not just icon color

---

## Keyboard Navigation

- [ ] All interactive elements reachable by Tab key in logical visual order
- [ ] No keyboard trap: Tab always advances focus, Shift+Tab reverses
- [ ] Dropdowns openable and dismissible with keyboard (Enter/Space to open, Escape to close)
- [ ] Modal dialogs: focus moves into modal on open; Tab cycles within modal; Escape closes
- [ ] Focus restored to trigger element when modal closes
- [ ] Workspace switcher operable with keyboard (open, navigate options, select)
- [ ] Sitemap editor: page nodes navigable by keyboard
- [ ] Design editor: section list navigable by keyboard; variant picker operable
- [ ] Inline text edit trigger accessible by keyboard (Enter or Space on focused element)
- [ ] AI chat panels: input, send button, and conversation navigable by keyboard
- [ ] Comment pins: focusable and activatable by keyboard
- [ ] Drag-and-drop reordering: keyboard alternative (e.g., Up/Down arrow keys) provided for section reorder
- [ ] Data tables (usage table, member list): cells navigable with arrow keys if complex table
- [ ] Pagination controls: Previous/Next accessible by Tab and activated by Enter

---

## Forms & Labels

- [ ] Every `<input>`, `<select>`, `<textarea>` has an associated `<label>` (via `for`/`id` or `aria-label`)
- [ ] Placeholder text not used as the only label
- [ ] Required fields marked with `required` attribute and visually indicated
- [ ] Error messages linked to the field with `aria-describedby`
- [ ] Success messages announced to screen readers (use `role="status"` or `aria-live="polite"`)
- [ ] Guided Brief wizard: each step's fields have clear labels
- [ ] Color hex input has label "Hex color" (not just the color swatch)
- [ ] Logo upload: `<input type="file">` has accessible label
- [ ] Invite role dropdown: `<select>` or custom dropdown has `aria-label`
- [ ] AI chat input: `<textarea>` or `<input>` has `aria-label="Message"`
- [ ] Search fields have `role="search"` or `aria-label="Search"`

---

## Images & Media

- [ ] All meaningful images have descriptive `alt` text
- [ ] Decorative images have `alt=""`
- [ ] Section variant thumbnails have `alt` describing the layout variant (e.g., "Hero variant 3 — centered text with background image")
- [ ] Project card preview images have `alt` (e.g., project name)
- [ ] Logo images have `alt` reflecting the brand name
- [ ] Stock image picker: selected images have `alt` filled or prompted
- [ ] Color swatch images: `aria-label` with color name/hex value
- [ ] SVG icons that convey meaning have `aria-label` or `<title>` inside `<svg>`
- [ ] SVG icons that are decorative have `aria-hidden="true"`

---

## Dynamic Content & Live Regions

- [ ] Toast notifications use `role="status"` (for non-critical) or `role="alert"` (for errors)
- [ ] AI-generated text insertions announced via `aria-live="polite"`
- [ ] Token usage update announced to screen readers after AI action
- [ ] Sitemap scan progress updates announced via `aria-live="polite"`
- [ ] Process thread new messages (tool call results) announced via `aria-live`
- [ ] Activity timeline "Load more" button announces new items loaded
- [ ] Approval queue count badge announced when updated

---

## Modals & Overlays

- [ ] All modals set `aria-modal="true"` and `role="dialog"`
- [ ] Modal has accessible name via `aria-labelledby` pointing to heading
- [ ] Background scrolling prevented when modal is open
- [ ] Confirmation dialogs (delete page, remove member) use `role="alertdialog"`
- [ ] Dropdown panels (workspace switcher, sort, role picker) use `role="listbox"` or `role="menu"` correctly
- [ ] Variant picker panel: `role="listbox"` with each variant as `role="option"`
- [ ] Tooltip text for icon-only buttons available via `aria-label` or `title`

---

## Focus Management

- [ ] After route change (navigating to a new page), focus moves to page `<h1>` or a skip-nav link
- [ ] Skip navigation link ("Skip to main content") present and visible on focus at page top
- [ ] Opening AI panel/chat: focus moves to the chat input
- [ ] Closing AI panel: focus returns to the trigger button
- [ ] Opening image picker: focus moves to search or first image
- [ ] Closing image picker: focus returns to the image that was clicked
- [ ] After inline text edit accepted: focus returns to the edited element

---

## Reduced Motion

- [ ] Confetti animation respects `prefers-reduced-motion: reduce` (animation disabled or reduced)
- [ ] Canvas pan/zoom animations respect `prefers-reduced-motion`
- [ ] AI panel slide-in transitions respect `prefers-reduced-motion`
- [ ] Framer Motion and GSAP animations respect `prefers-reduced-motion` media query
- [ ] Lenis smooth scroll disabled when `prefers-reduced-motion` is set

---

## Screen Reader Compatibility

- [ ] All checklist items above tested with at least one screen reader:
  - macOS: VoiceOver + Safari
  - Windows: NVDA + Chrome (or Firefox)
- [ ] Login flow narrated correctly (form labels, error messages, success redirect)
- [ ] Dashboard project cards narrated with name, last updated, member count
- [ ] Sitemap node structure narrated correctly (page name, section count)
- [ ] Design editor section list narrated in correct order
- [ ] Variant picker narrates variant name/number when focused
- [ ] Token usage progress bar conveys percentage via `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- [ ] Manage Mode site scan issues narrated with severity and description

---

## Language & Internationalization

- [ ] `<html lang="en">` (or appropriate language code) set on every page
- [ ] `lang` attribute set on any inline content in a different language
- [ ] Dates and times use formats readable by screen readers (avoid ambiguous `01/02/03`)
