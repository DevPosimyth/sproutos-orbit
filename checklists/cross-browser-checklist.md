# Sprout OS — Cross-Browser Compatibility Checklist

> Test each area in all four primary browsers. Mark the browser column when verified. Flag any browser-specific breakage immediately.

---

## Browser Matrix

| Browser | Version Target | Engine |
|---|---|---|
| Chrome | Latest stable | Blink / V8 |
| Firefox | Latest stable | Gecko / SpiderMonkey |
| Safari | Latest stable (macOS + iOS) | WebKit / JavaScriptCore |
| Edge | Latest stable | Blink / V8 (Chromium) |

> **Priority order:** Chrome → Safari → Firefox → Edge  
> **Mobile browsers:** Chrome for Android, Safari for iOS (test alongside desktop)

---

## Legend

`✓` = Verified working &emsp; `✗` = Broken &emsp; `-` = Not applicable

| Area | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| (use table below per section) | | | | |

---

## 1. Authentication

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Login form renders and submits | | | | |
| Signup form renders and submits | | | | |
| Forgot password form works | | | | |
| Google OAuth redirect and callback | | | | |
| Session cookie set and persists on refresh | | | | |
| Logout clears session and redirects | | | | |
| Password eye toggle shows/hides text | | | | |

---

## 2. Onboarding

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| 5-step flow renders each step | | | | |
| Selection chips clickable and toggling | | | | |
| Confetti animation plays | | | | |
| Slide-to-start interaction works | | | | |

---

## 3. Dashboard & Workspaces

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Project grid renders with card previews | | | | |
| Project list view renders | | | | |
| Search filters in real-time | | | | |
| Sort dropdown works | | | | |
| Workspace switcher dropdown opens/closes | | | | |
| Right-click context menu appears at cursor | | | | |
| "Get Started" checklist checkboxes toggle | | | | |

---

## 4. Guided Brief Wizard

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| All 6 steps render correctly | | | | |
| URL field triggers crawl | | | | |
| Logo file upload (PNG/SVG) works | | | | |
| Color hex input accepts and shows swatch | | | | |
| Tone chips toggle on/off | | | | |
| File upload for proof documents works | | | | |
| Progress bar advances correctly | | | | |

---

## 5. Sitemap Editor

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| React Flow canvas renders | | | | |
| Dagre auto-layout positions nodes | | | | |
| Drag-and-drop page reordering works | | | | |
| Drag-and-drop section reordering works | | | | |
| Node expand/collapse works | | | | |
| Section library panel opens and scrolls | | | | |
| AI suggestions banner appears/dismisses | | | | |

---

## 6. Design Editor — Canvas

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Infinite canvas renders all sections | | | | |
| Zoom in/out controls work | | | | |
| Zoom-to-fit works | | | | |
| Click-and-drag panning works | | | | |
| Section drag-and-drop reordering works | | | | |
| Variant picker opens and thumbnails render | | | | |
| Inline text editing opens on click | | | | |
| Edited text persists on reload | | | | |

---

## 7. Design Editor — Iframes (Tablet / Mobile)

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Tablet iframe renders at 768px | | | | |
| Mobile iframe renders at 375px | | | | |
| CSS variables sync into iframe | | | | |
| Fonts load inside iframe | | | | |
| Click events propagate in iframe | | | | |
| Iframe auto-height adjusts on content change | | | | |
| Safari: no cross-origin iframe restrictions | | | | |

---

## 8. Color System

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Color palette swatches render correctly | | | | |
| Hex input and color picker work | | | | |
| Saturation slider draggable | | | | |
| CSS custom property application to sections | | | | |
| HSL/HEX conversion accurate | | | | |

---

## 9. Typography

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Google Fonts loaded and previewed in panel | | | | |
| Font selection applies to canvas | | | | |
| Font persists on reload | | | | |
| Virtualized font list scrolls smoothly | | | | |

---

## 10. AI Text Generation

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Inline AI popup appears on text click | | | | |
| Popup position avoids sidebar overlap | | | | |
| Quick actions (Rewrite, Shorter, etc.) trigger | | | | |
| Generated text replaces element content | | | | |
| Popup works inside tablet iframe | | | | |
| Popup works inside mobile iframe | | | | |

---

## 11. Image Handling

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Image picker opens on image click | | | | |
| Stock image grid loads | | | | |
| File upload via drag-and-drop works | | | | |
| File upload via click (file dialog) works | | | | |
| Aspect ratio presets apply correctly | | | | |
| Overlay opacity slider works | | | | |
| WebP images render (logo upload) | | | | |

---

## 12. AI Design Agent

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Chat panel opens | | | | |
| Model selection dropdown works | | | | |
| AI response renders in chat | | | | |
| Design change applied to canvas on selection | | | | |
| Undo/Redo works | | | | |

---

## 13. Export

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Export panel opens | | | | |
| Elementor instructions render with images | | | | |
| Gutenberg instructions render with images | | | | |
| Figma instructions render with images | | | | |
| Download/copy action works | | | | |
| Upgrade prompt shown for gated exports | | | | |

---

## 14. Team Management

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Member list renders | | | | |
| Search/filter works | | | | |
| Email invite form submits | | | | |
| Copy invite link works (clipboard API) | | | | |
| Role change dropdown works | | | | |
| Remove member confirmation dialog works | | | | |

---

## 15. Token Usage

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Summary cards render with progress bar | | | | |
| Usage table renders with all columns | | | | |
| Pagination works | | | | |
| Color thresholds (amber/red) display | | | | |

---

## 16. Manage Mode — Overview

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Overview tab renders with summary cards | | | | |
| Site scan triggers and shows polling state | | | | |
| Scan results and issues display | | | | |
| Approval queue Approve/Reject buttons work | | | | |
| Activity timeline renders | | | | |

---

## 17. Manage Mode — Actions

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Action library renders grouped categories | | | | |
| Run action → process thread opens | | | | |
| Process thread tool call steps render | | | | |
| Follow-up chat input works | | | | |
| Playbook canvas view renders | | | | |

---

## 18. Manage Mode — Build

| Check | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Module list renders with status badges | | | | |
| File tree renders | | | | |
| Code editor with syntax highlighting renders | | | | |
| Diff viewer renders side-by-side | | | | |
| Quality gate results render | | | | |

---

## 19. Browser-Specific Known Issues

### Safari
- [ ] `CSS custom properties` in iframes: verify cross-origin restrictions do not block style sync
- [ ] `<input type="color">` availability: verify hex input fallback works if color picker differs
- [ ] Clipboard API (`navigator.clipboard.writeText`): requires user gesture — verify invite link copy works
- [ ] `IndexedDB` / localStorage quota: verify no silent failures on large project state
- [ ] WebP image format: verify Safari 14+ accepts WebP in logo upload
- [ ] Smooth scroll (Lenis): verify no conflicts with Safari's native momentum scroll
- [ ] `backdrop-filter` CSS: verify panel blur effects render correctly

### Firefox
- [ ] `CSS grid` subgrid: verify layout of cards and panels
- [ ] `<dialog>` element: verify modal behavior (Firefox had partial support; confirm polyfill not needed)
- [ ] Drag-and-drop events: verify `dnd-kit` drag handles fire correctly (Firefox sometimes differs)
- [ ] Clipboard write permission: verify invite link copy prompts correctly
- [ ] WebGL canvas (if used in design editor): verify rendering

### Edge
- [ ] Chromium-based: most Chrome tests should pass; focus on any Edge-specific extension interference
- [ ] PDF upload in Guided Brief: verify Edge file picker accepts PDF

---

## 20. Progressive Enhancement

- [ ] If JavaScript fails to load (CDN block, script error): page shows a meaningful fallback, not a blank screen
- [ ] If Google Fonts fail to load: system font fallback applied gracefully
- [ ] If API is unreachable: user sees error state, not broken UI with no message

---

## 21. Mobile Browsers

| Check | Chrome Android | Safari iOS |
|---|---|---|
| Login form usable with mobile keyboard | | |
| Dashboard project cards scroll/tap | | |
| Design editor canvas scrollable | | |
| Inline text editing with on-screen keyboard | | |
| Image picker opens and file selection works | | |
| AI chat input focused above keyboard | | |
| Sitemap editor canvas pinch-to-zoom | | |
| Manage Mode tabs navigable | | |
