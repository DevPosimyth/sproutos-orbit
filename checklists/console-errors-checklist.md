# Sprout OS — Console Errors Checklist

> Open DevTools → Console + Network before every test session. Zero errors/warnings policy for production. Log every issue with URL, message, and reproduction steps.

---

## How to Monitor

1. Open Chrome DevTools → **Console** tab
2. Set filter to: **All levels** (Errors + Warnings + Info)
3. Open **Network** tab → filter by **`XHR`** and **`Fetch`** to watch API calls
4. Filter Network by **`status:≥400`** to catch failed requests
5. Use `console.clear()` before each user action to isolate errors per step

---

## General Rules

- [ ] Zero `console.error()` calls on any page under normal usage
- [ ] Zero unhandled `Promise` rejections in console
- [ ] Zero `[Violation]` warnings (long task, forced layout/reflow)
- [ ] No `Failed to load resource` for same-origin assets (JS, CSS, fonts, images)
- [ ] No `net::ERR_BLOCKED_BY_CLIENT` for first-party resources
- [ ] No `CORS` errors for requests to `api.sproutos.ai`
- [ ] No `Mixed Content` warnings (HTTP resources on HTTPS page)
- [ ] No deprecated API warnings (`[Deprecation]`)
- [ ] No React key warnings (`Warning: Each child in a list should have a unique "key" prop`)
- [ ] No React hydration mismatches (`Warning: Prop … did not match`)
- [ ] No Zustand or Context state mutation warnings

---

## 1. Authentication Pages

| Action | Expected Console State | Pass? |
|---|---|---|
| Load `/login` | No errors, no 4xx/5xx network calls | |
| Submit valid credentials | `POST /api/auth/login` → 200 OK | |
| Submit invalid credentials | Error in UI, no uncaught exception | |
| Load `/signup` | No errors | |
| Submit signup form | `POST /api/auth/signup` → 200 or 201 | |
| Load `/forgot-password` | No errors | |
| Submit forgot password | `POST /api/auth/forgot-password` → 200 | |
| Google OAuth button click | Redirect only, no JS errors before redirect | |

---

## 2. Onboarding Flow

| Action | Expected Console State | Pass? |
|---|---|---|
| Load onboarding step 1 | No errors | |
| Advance through all 5 steps | No errors on each transition | |
| Confetti animation fires | No canvas or animation errors | |
| Slide-to-start interaction | No drag event errors | |

---

## 3. Dashboard & Workspaces

| Action | Expected Console State | Pass? |
|---|---|---|
| Load `/dashboard` (authenticated) | No errors; projects API returns 200 | |
| Switch workspace | No errors; workspace-scoped API calls return 200 | |
| Search projects | No errors; filtering is client-side or API 200 | |
| Toggle grid/list view | No errors; no layout reflow violations | |
| Right-click project card | No errors; context menu renders | |

---

## 4. Projects

| Action | Expected Console State | Pass? |
|---|---|---|
| Create blank project | `POST /api/projects` → 200/201, no errors | |
| Create from URL (crawl) | Crawl API calls → 200; no timeout errors | |
| Create from PDF upload | Upload API → 200; no file reader errors | |
| Delete project | `DELETE /api/projects/:id` → 200/204 | |
| Rename project | `PATCH /api/projects/:id` → 200 | |

---

## 5. Guided Brief Wizard

| Action | Expected Console State | Pass? |
|---|---|---|
| Load each of 6 steps | No errors per step | |
| Trigger URL crawl in Step 1 | Crawl API → 200; no CORS errors | |
| Logo upload (PNG) | Upload API → 200; no FileReader errors | |
| Logo upload (file >15MB) | Client-side validation fires; no uncaught error | |
| Advance step with missing fields | Validation error shown; no JS error | |
| Save brief | `POST /api/briefs` or `PATCH` → 200; no errors | |

---

## 6. Sitemap Editor

| Action | Expected Console State | Pass? |
|---|---|---|
| Load sitemap editor | React Flow renders; no WebGL or canvas errors | |
| Add page | State update; no React key warnings | |
| Delete page | State update; no async errors | |
| Drag-and-drop reorder | `dnd-kit` events; no errors | |
| Open AI Sitemap Chat | No errors; chat API endpoint available | |
| AI chat submit | `POST /api/sitemap-chat` → 200; no token errors | |

---

## 7. Design Editor

| Action | Expected Console State | Pass? |
|---|---|---|
| Load design editor | All section templates load; no 404 for template assets | |
| Zoom in/out/fit | No reflow violations | |
| Open variant picker | Variant thumbnails load; no 404 for thumbnail images | |
| Select a variant | Section re-renders; no React hydration errors | |
| Click to inline edit text | ContentEditable event handlers; no errors | |
| Switch to tablet viewport | Iframe created; no cross-origin errors | |
| Switch to mobile viewport | Iframe created; no cross-origin errors | |
| CSS sync into iframe | `iframe.contentDocument.adoptedStyleSheets` or `<style>` injection; no errors | |
| Font load in iframe | `@import` or `<link>` in iframe head; no 404 | |
| Drag section to reorder | No drop event errors | |

---

## 8. Color System

| Action | Expected Console State | Pass? |
|---|---|---|
| Change color palette | CSS variables set; no errors | |
| Edit hex input | Color parse; no `NaN` in RGB conversion | |
| Saturation slider drag | No `[Violation]` forced reflow warnings | |
| Light/Dark toggle | CSS token update; no errors | |

---

## 9. AI Text Generation

| Action | Expected Console State | Pass? |
|---|---|---|
| Click text element | Popup renders; no errors | |
| Click "Rewrite" | `POST /api/ai/text` → 200; no timeout errors | |
| Token exhausted state | API returns 402 or custom token-error; no uncaught exception | |
| Accept generated text | DOM mutation; no React key or hydration errors | |
| Popup inside tablet iframe | postMessage or iframe event; no cross-origin errors | |

---

## 10. Image Handling

| Action | Expected Console State | Pass? |
|---|---|---|
| Open image picker | Stock images API → 200; no 404 for image thumbnails | |
| Upload custom image | `POST /api/media/upload` → 200; no FileReader error | |
| Upload file >15MB | Client-side validation; no uncaught error | |
| Replace image | DOM image src update; no 404 for new image | |
| Overlay slider drag | No reflow violations | |

---

## 11. AI Design Agent

| Action | Expected Console State | Pass? |
|---|---|---|
| Open chat panel | No errors | |
| Send message | `POST /api/ai/design` → 200; SSE or streaming no errors | |
| Apply AI suggestion | DOM update; no React errors | |
| Undo AI change | State revert; no errors | |

---

## 12. Export

| Action | Expected Console State | Pass? |
|---|---|---|
| Open export panel | No errors | |
| Select Elementor export | Export API → 200; no errors | |
| Select Gutenberg export | Export API → 200; no errors | |
| Select Figma export | Export API → 200; no errors | |
| Access gated export (React) | API returns 403; upgrade prompt shown; no uncaught error | |
| Download exported file | Blob URL created; no file system errors | |

---

## 13. Team Management

| Action | Expected Console State | Pass? |
|---|---|---|
| Load team page | `GET /api/team` → 200; no errors | |
| Send email invite | `POST /api/invites` → 200/201; no SMTP-related JS errors | |
| Copy invite link | `navigator.clipboard.writeText` → fulfilled; no permission errors | |
| Change member role | `PATCH /api/team/:id` → 200 | |
| Remove member | `DELETE /api/team/:id` → 200/204 | |
| Resend invite | `POST /api/invites/:id/resend` → 200 | |

---

## 14. Manage Mode — Site Connection

| Action | Expected Console State | Pass? |
|---|---|---|
| Submit connection form | `POST /api/manage/connect-site` → 200; no credential log in console | |
| Successful connection | MCP capabilities discovery; no errors | |
| Failed connection (wrong credentials) | API → 400/401; error shown; no uncaught exception | |
| Disconnect site | `DELETE /api/manage/connect-site` → 200 | |
| Load demo mode | Mock data loaded; no real API calls fired | |

---

## 15. Manage Mode — Overview

| Action | Expected Console State | Pass? |
|---|---|---|
| Load Overview tab | `GET /api/manage/site-data` → 200; no errors | |
| Trigger site scan | `POST /api/manage/scan` → 200; polling `GET` returns 200 | |
| Scan polling 3s interval | No memory leak warnings from interval accumulation | |
| Approve action | `PATCH /api/manage/approvals/:id` → 200 | |
| Load activity log | `GET /api/manage/activity` → 200; no errors | |

---

## 16. Manage Mode — Actions / Execution

| Action | Expected Console State | Pass? |
|---|---|---|
| Load action library | `GET /api/manage/actions-registry` → 200 | |
| Run action | `POST /api/manage/execute-action` → 200; SSE/streaming no errors | |
| Process thread tool calls | Tool call responses logged; no uncaught errors | |
| Follow-up chat | `POST /api/manage/chat` → 200 | |
| Run playbook | `POST /api/manage/playbooks/run` → 200 | |
| Automation cron trigger | `GET /api/manage/automations/cron` → 200; no scheduler errors | |

---

## 17. Manage Mode — Build

| Action | Expected Console State | Pass? |
|---|---|---|
| Load module list | `GET /api/manage/build/projects` → 200 | |
| Create module (Quick Prompt) | `POST /api/manage/build/projects` → 201; scaffold `POST` → 200 | |
| Open code editor | No syntax highlight library errors | |
| Save file | `PATCH /api/manage/build/files` → 200 | |
| Create version | `POST /api/manage/build/versions` → 201 | |
| Run quality gates | `POST /api/manage/build/sandbox` → 200 | |
| Deploy release | `POST /api/manage/build/releases` → 200; MCP file write logged | |

---

## 18. Network — API Health

- [ ] All `GET` requests to `api.sproutos.ai` return 200 or 304 under normal usage
- [ ] No `GET` requests return 500 during any standard user flow
- [ ] No `POST`/`PATCH`/`DELETE` requests return 5xx under normal usage
- [ ] API requests include proper `Authorization` header (no 401 in normal authenticated state)
- [ ] API responses have correct `Content-Type: application/json` header
- [ ] No duplicate API calls on page load (no double-fetch of the same resource)
- [ ] No infinite retry loops visible in Network tab

---

## 19. Asset Loading

- [ ] All JavaScript bundles load (no 404 for chunk files)
- [ ] All CSS files load (no 404)
- [ ] All Google Fonts load (no 404, no CORS)
- [ ] All section template images/SVGs load (no 404)
- [ ] All stock image thumbnails in image picker load
- [ ] Favicon loads on all pages
- [ ] OG image referenced in meta tags loads (no 404)

---

## 20. Memory & Performance Warnings

- [ ] No `[Violation] 'requestAnimationFrame' handler took <N>ms` in canvas/editor
- [ ] No `[Violation] Added non-passive event listener` warnings on scroll-heavy elements
- [ ] No memory leak indicators: intervals/timeouts that are not cleared on component unmount
- [ ] Sitemap editor: React Flow cleanup on unmount (no dangling event listeners)
- [ ] Design editor: iframes removed from DOM when viewport switches (no orphaned iframes)
- [ ] AI chat: SSE connections closed when panel unmounts (no dangling connections)
