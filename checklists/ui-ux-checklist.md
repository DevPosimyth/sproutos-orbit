# Sprout OS — UI / UX Checklist

## Responsive Behaviour

- [ ] Desktop 1440 × 900 — no horizontal scroll, no overflow
- [ ] Tablet 768 × 1024 — nav collapses cleanly
- [ ] Mobile 375 × 812 — buttons reachable, text legible
- [ ] Rotation (portrait ↔ landscape) on mobile does not break layout

## Navigation

- [ ] Primary nav links work on every page
- [ ] Active page highlighted in nav
- [ ] Mobile hamburger menu opens / closes cleanly
- [ ] Footer links work (Privacy, Terms, Contact)

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
