# Sprout OS — Dashboard QA Report

**Date:** 2026-04-27
**Tested URL:** https://sproutos.ai/
**Test Suite:** `tests/sproutos/dashboard/` (5 spec files)
**Viewport:** Desktop (1440×900) — Chromium
**Result:** 203 Passed · 29 Failed · 232 Total

---

## Test Run Summary

| Spec File | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|
| `home.spec.js` | 48 | 39 | 8 | 1 |
| `security.spec.js` | 49 | 34 | 15 | 0 |
| `settings.spec.js` | 40 | 32 | 6 | 2 |
| `sidebar.spec.js` | 48 | 48 | 0 | 0 |
| `workspace.spec.js` | 47 | 47 | 0 | 0 |
| **Total** | **232** | **200** | **29** | **3** |

---

## Issues Found

---

### Auth guard missing on all dashboard routes

**Priority:** Critical
**Category:** Security / Auth

Issue: Unauthenticated users visiting `/`, `/?tab=workspace`, `/?tab=team-management`, `/?tab=roles`, `/?tab=settings`, and `/?tab=token-usage` are not redirected to the login page. The dashboard content (or blank shell) renders without any session, exposing protected routes to unauthenticated access.

Step to Reproduce:

Step 1 — Open a private/incognito browser tab (no session)
Step 2 — Navigate to `https://sproutos.ai/` or any `/?tab=*` URL directly
Step 3 — Observe that the page loads without redirecting to `/auth/login`

Expected Result: Any unauthenticated visit to a dashboard route should immediately redirect to `/auth/login`.

---

### XSS payload executes in prompt editor

**Priority:** Critical
**Category:** Security

Issue: A script injection payload (`<img src=x onerror="window.__xss_executed=true">`) entered into the dashboard prompt editor executes successfully. The flag `window.__xss_executed` is set to `true`, confirming that unsanitized HTML is being interpreted by the browser from the contenteditable prompt field.

Step to Reproduce:

Step 1 — Log in and navigate to the dashboard home tab
Step 2 — Click the prompt editor (`#dashboard-prompt-card` contenteditable area)
Step 3 — Type or paste `<img src=x onerror="window.__xss_executed=true">` and submit or wait
Step 4 — Run `window.__xss_executed` in browser console — value is `true`

Expected Result: All user input in the prompt editor must be treated as plain text. HTML tags should be stripped or escaped before rendering. `window.__xss_executed` should remain `undefined`.

---

### Cloudflare analytics script blocked by CSP

**Priority:** High
**Category:** Console Errors / Security

Issue: On every dashboard page load, the Cloudflare Insights beacon script is blocked by the Content Security Policy. The console logs a CSP violation for `static.cloudflareinsights.com`. This means analytics data is not being collected and the CSP is misconfigured for an intentional third-party.

Step to Reproduce:

Step 1 — Log in and open browser DevTools → Console
Step 2 — Navigate to `https://sproutos.ai/`
Step 3 — Observe the CSP violation error for `cloudflareinsights.com`

Expected Result: If Cloudflare Analytics is intentionally used, its domain should be added to the `script-src` CSP directive. If not used, the script tag should be removed.

---

### Paddle CSS stylesheet blocked by CSP

**Priority:** High
**Category:** Console Errors / Security

Issue: The Paddle billing stylesheet (`https://cdn.paddle.com/paddle/v2/assets/css/paddle.css`) is blocked by the CSP `style-src` directive on every dashboard load. This causes Paddle checkout UI to render unstyled or broken.

Step to Reproduce:

Step 1 — Log in and open DevTools → Console
Step 2 — Navigate to `https://sproutos.ai/`
Step 3 — Observe the CSP violation error for `cdn.paddle.com` stylesheet

Expected Result: `https://cdn.paddle.com` should be added to the `style-src` directive in the Content Security Policy.

---

### Paddle billing SDK not initialized — Seller ID missing

**Priority:** High
**Category:** Console Errors / Integration

Issue: The browser console shows `[PADDLE BILLING] You must specify your Paddle Seller ID or token within the Paddle.Initialize() method.` on every dashboard load. Paddle is loaded but not initialized, which means billing and checkout functionality is completely non-functional.

Step to Reproduce:

Step 1 — Log in and open DevTools → Console
Step 2 — Navigate to `https://sproutos.ai/`
Step 3 — Observe the Paddle initialization error in the console

Expected Result: `Paddle.Initialize({ token: '<seller_token>' })` should be called with a valid seller ID during app boot. No Paddle-related console errors should appear.

---

### Paddle API returns 429 rate limit error on dashboard load

**Priority:** High
**Category:** Console Errors / Performance

Issue: A `Failed to load resource: the server responded with a status of 429` error appears in the console on every dashboard load. This indicates requests to Paddle's API are being made too aggressively — likely due to repeated initialization calls or polling.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Open DevTools → Network tab
Step 3 — Refresh the dashboard page and observe a 429 response from a Paddle endpoint

Expected Result: Paddle API calls should be batched and throttled. No 429 errors should appear during normal page load.

---

### Workspace tab takes 38+ seconds to load

**Priority:** High
**Category:** Performance

Issue: Navigating to the Workspace tab (`/?tab=workspace`) takes over 38 seconds before content is visible. The 5-second performance threshold is exceeded by more than 7×. This makes the workspace tab practically unusable.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Click the Workspace tab or navigate to `/?tab=workspace`
Step 3 — Measure time from navigation to content being visible in the DOM

Expected Result: The workspace tab should render visible content within 5 seconds.

---

### Workspace API endpoint responds in 38+ seconds

**Priority:** High
**Category:** Performance / API

Issue: The `/api/workspaces` endpoint takes over 38 seconds to respond when called from the dashboard workspace tab. This is the root cause of the slow workspace tab load. The 3-second API response threshold is exceeded by 12×.

Step to Reproduce:

Step 1 — Log in and open DevTools → Network tab
Step 2 — Navigate to `/?tab=workspace`
Step 3 — Find the `/api/workspaces` request and observe its response time

Expected Result: The workspace API should respond within 3 seconds under normal conditions.

---

### Settings tab takes 24+ seconds to load

**Priority:** High
**Category:** Performance

Issue: Navigating to the Settings tab (`/?tab=settings`) takes over 24 seconds before content is visible. The 5-second threshold is exceeded by nearly 5×.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Click the Settings tab or navigate to `/?tab=settings`
Step 3 — Measure time from navigation to content being visible

Expected Result: The settings tab should render visible content within 5 seconds.

---

### Data isolation check failed — API response scope unclear

**Priority:** High
**Category:** Security / Data Privacy

Issue: The automated data isolation test failed when verifying that dashboard API responses do not leak data from other accounts. The response structure did not match the expected isolation pattern, raising concern that workspace or project data may not be properly scoped to the authenticated user's session.

Step to Reproduce:

Step 1 — Log in as user A
Step 2 — Capture the response from `/api/workspaces` or `/api/projects`
Step 3 — Verify that the response contains only data belonging to user A's account

Expected Result: All API responses must be scoped to the authenticated user. No cross-account data should be present in any response.

---

### Console errors persist on workspace tab navigation

**Priority:** Medium
**Category:** Console Errors

Issue: When navigating to the workspace tab, new console errors appear beyond the known Cloudflare and Paddle CSP violations, indicating workspace-specific JavaScript or API errors.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Open DevTools → Console and clear it
Step 3 — Navigate to `/?tab=workspace`
Step 4 — Observe new console errors appearing

Expected Result: No new console errors should appear when navigating between dashboard tabs.

---

### Console errors appear on settings tab navigation

**Priority:** Medium
**Category:** Console Errors

Issue: Navigating to the settings tab generates console errors beyond the known Cloudflare and Paddle noise, indicating a settings-specific rendering or data-fetching issue.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Open DevTools → Console and clear it
Step 3 — Navigate to `/?tab=settings`
Step 4 — Observe console errors appearing

Expected Result: No console errors should appear when navigating to the settings tab.

---

### Slash menu does not appear when typing "/" in prompt

**Priority:** Medium
**Category:** Functionality

Issue: Typing "/" into the dashboard prompt editor does not trigger any slash command menu or suggestion popover. If this is a documented feature, it is non-functional.

Step to Reproduce:

Step 1 — Log in to the dashboard home tab
Step 2 — Click into the prompt editor area
Step 3 — Type "/" and wait up to 3 seconds
Step 4 — Observe that no menu or dropdown appears

Expected Result: A slash command menu or suggestion list should appear when "/" is typed into the prompt field.

---

### "Spin up an idea" button does not fill the prompt

**Priority:** Medium
**Category:** Functionality

Issue: Clicking the "Spin up an idea" suggestion button does not populate the prompt editor with any text. A product tour overlay intercepts the click, preventing the button action from executing.

Step to Reproduce:

Step 1 — Log in to the dashboard home tab (first-time session with tour active)
Step 2 — Locate the "Spin up an idea" button under the prompt area
Step 3 — Click the button
Step 4 — Observe that the prompt editor remains empty

Expected Result: Clicking "Spin up an idea" should populate the prompt editor with a suggested idea text.

---

### "Spin up an idea" generates the same idea on repeated clicks

**Priority:** Medium
**Category:** Functionality / Logic

Issue: Clicking "Spin up an idea" multiple times returns the exact same idea text, providing no variation. The feature is expected to generate different suggestions on each click.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Click "Spin up an idea" and note the suggestion text
Step 3 — Clear the prompt and click "Spin up an idea" again
Step 4 — Observe that the same text is returned

Expected Result: Each click on "Spin up an idea" should produce a different prompt suggestion.

---

### "Start with a Guided Brief" button does not navigate

**Priority:** Medium
**Category:** Functionality / Navigation

Issue: Clicking the "Start with a Guided Brief" button does not navigate to the guided brief wizard. The tour overlay blocks the click action and the URL does not change after clicking.

Step to Reproduce:

Step 1 — Log in to the dashboard home tab
Step 2 — Click the "Start with a Guided Brief" button
Step 3 — Observe that no navigation occurs and the URL stays at `/`

Expected Result: Clicking "Start with a Guided Brief" should navigate to the guided brief creation flow.

---

### OR divider between prompt and guided brief not visible

**Priority:** Medium
**Category:** UI / Design

Issue: The visual "OR" divider that should separate the prompt submission area from the "Start with a Guided Brief" option is not rendered on the dashboard home tab.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Scroll to the area between the prompt input and the "Start with a Guided Brief" section
Step 3 — Observe that no "OR" divider or separator is visible

Expected Result: A clear visual separator (text "OR" with divider lines) should separate the two content creation options.

---

### Project cards have no thumbnail or placeholder image

**Priority:** Medium
**Category:** UI / Design

Issue: Project cards in the projects grid display the project name but show no thumbnail image or placeholder graphic. Cards render with an empty image area.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Scroll to the Projects section
Step 3 — Observe each project card — no thumbnail, preview, or placeholder image is shown

Expected Result: Each project card should display either a generated thumbnail of the project design or a branded placeholder/fallback image.

---

### Clicking a project card does not navigate to the project

**Priority:** Medium
**Category:** Functionality / Navigation

Issue: Clicking on a project card in the projects grid does not navigate to the project's sitemap or editor. The click times out (30 seconds) with no URL change.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Scroll to the Projects grid and identify a project card
Step 3 — Click anywhere on the card
Step 4 — Observe that no navigation occurs

Expected Result: Clicking a project card should navigate to the project's sitemap editor (e.g., `/projects/{id}/sitemap`).

---

### Project card has no hover state

**Priority:** Low
**Category:** UI / UX Polish

Issue: Hovering over a project card does not produce any visible hover effect — no cursor change, no elevation, no border highlight. This makes the cards feel non-interactive.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Move the cursor over a project card
Step 3 — Observe cursor and card appearance

Expected Result: Project cards should display a hover state — at minimum `cursor: pointer` and a subtle shadow or border highlight to indicate the card is clickable.

---

### Avatar upload area not visible in settings

**Priority:** Medium
**Category:** UI / Settings

Issue: The avatar/profile picture upload area is not visible on the Settings tab. There is no upload button, dropzone, or profile photo element for the user to interact with.

Step to Reproduce:

Step 1 — Log in and navigate to `/?tab=settings`
Step 2 — Look for an avatar upload area, profile photo button, or dropzone
Step 3 — Observe that no such element is visible

Expected Result: An avatar upload control (image, button, or dropzone with initials fallback) should be visible at the top of the settings panel.

---

### Current avatar/profile image not displayed in settings

**Priority:** Medium
**Category:** UI / Settings

Issue: The currently set profile picture or avatar is not rendered anywhere on the settings page. Users have no visual confirmation of their current avatar.

Step to Reproduce:

Step 1 — Log in and navigate to `/?tab=settings`
Step 2 — Look for the user's avatar or profile image
Step 3 — Observe that no avatar or initials fallback is shown

Expected Result: The settings page should display the user's current avatar (or an initials-based fallback) prominently, with an option to change it.

---

### Password show/hide toggle does not reveal text

**Priority:** Medium
**Category:** Functionality / Settings

Issue: The password show/hide toggle button is present in the Password Change section, but clicking it does not change the input field type from `password` to `text`. The password value remains masked.

Step to Reproduce:

Step 1 — Log in and navigate to `/?tab=settings`
Step 2 — Locate the Password Change section
Step 3 — Click the show/hide eye icon next to the password field
Step 4 — Observe that the field type remains `password` (text stays masked)

Expected Result: Clicking the toggle should change `input[type="password"]` to `input[type="text"]`, making the entered password visible. Clicking again should revert to masked.

---

### Token usage — used and remaining counts not displayed

**Priority:** Medium
**Category:** UI / Token Usage

Issue: The Token Usage tab does not display numerical values for "used" and "remaining" tokens. Only the progress bar renders; the actual count labels are missing.

Step to Reproduce:

Step 1 — Log in and navigate to `/?tab=token-usage`
Step 2 — Look for numerical displays showing tokens used and tokens remaining
Step 3 — Observe that only the progress bar is visible, with no count labels

Expected Result: The token usage section should clearly display: allocated tokens, tokens used (numeric), and tokens remaining (numeric), alongside the progress bar.

---

### Token usage percentage label not shown

**Priority:** Low
**Category:** UI / Token Usage

Issue: No percentage label (e.g., "42% used") is displayed on the token usage tab. The progress bar shows usage visually but there is no textual percentage value.

Step to Reproduce:

Step 1 — Log in and navigate to `/?tab=token-usage`
Step 2 — Observe the token allocation area
Step 3 — Note that no "X% used" label appears near or within the progress bar

Expected Result: A percentage label should accompany the token usage progress bar (e.g., "34% of your tokens used").

---

### "Model" column missing from token usage logs table

**Priority:** Low
**Category:** UI / Token Usage

Issue: The usage logs table on the Token Usage tab is missing a "Model" column. Column headers do not include the AI model name used for each action.

Step to Reproduce:

Step 1 — Log in and navigate to `/?tab=token-usage`
Step 2 — Scroll to the usage logs table
Step 3 — Review the column headers — no "Model" column is present

Expected Result: The usage logs table should include a "Model" column displaying which AI model was used for each token-consuming action.

---

### Dashboard makes 21 API calls on initial load (threshold: 20)

**Priority:** Low
**Category:** Performance

Issue: The dashboard triggers 21 network API requests on initial page load, slightly exceeding the 20-request threshold. This indicates potential over-fetching.

Step to Reproduce:

Step 1 — Open DevTools → Network tab and clear it
Step 2 — Navigate to `https://sproutos.ai/` (logged in)
Step 3 — Wait for `networkidle`
Step 4 — Count all XHR/fetch requests to API endpoints

Expected Result: The dashboard should make fewer than 20 API calls on initial load. Non-critical data should be deferred or lazily fetched.

---

### Sitemap API returns 404 for a project resource

**Priority:** Low
**Category:** API / Data

Issue: The network log shows `404 https://api.sproutos.ai/sitemaps/69b7df2b1ce59f2ebfb7d0bf` appearing twice during dashboard load. The app attempts to fetch a sitemap resource that no longer exists, without proper error handling.

Step to Reproduce:

Step 1 — Log in to the dashboard
Step 2 — Open DevTools → Network tab
Step 3 — Observe requests to `api.sproutos.ai/sitemaps/...` returning 404

Expected Result: The app should gracefully handle 404 responses for sitemap resources — remove the stale reference, show an appropriate empty state, or silently suppress the error without polluting the console or network log.

---

## Confirmed Passing (Selected)

| # | Test | Area |
|---|---|---|
| 1 | Dashboard renders without console errors on load | UI / Load |
| 2 | No 4xx/5xx asset requests on dashboard load | Network |
| 3 | Dashboard has correct page title | SEO |
| 4 | Main content area is visible | Layout |
| 5 | No layout overflow or horizontal scroll | Responsive |
| 6 | No cumulative layout shift after 3s | Performance |
| 7 | Prompt card (`#dashboard-prompt-card`) is visible | Prompt |
| 8 | Clicking prompt area focuses the contenteditable editor | Prompt |
| 9 | Typing in prompt editor reflects entered text | Prompt |
| 10 | Prompt supports pasting plain text | Prompt |
| 11 | Prompt does not submit on Shift+Enter | Prompt |
| 12 | Generate/submit button is visible and enabled | Prompt |
| 13 | Empty prompt shows error or disables submit | Validation |
| 14 | "Need a starting point?" hint is visible | Suggestions |
| 15 | "Spin up an idea" button is visible | Suggestions |
| 16 | "Start with a Guided Brief" button is visible | Suggestions |
| 17 | Projects section heading is visible | Projects Grid |
| 18 | Projects grid renders at least one card | Projects Grid |
| 19 | Loading skeleton disappears after data loads | Projects Grid |
| 20 | Project cards display a name | Projects Grid |
| 21 | Projects grid is responsive at different widths | Responsive |
| 22 | Sidebar search/filter narrows project list | Sidebar |
| 23 | Keyboard navigation reaches the prompt editor | Accessibility |
| 24 | Header has correct landmark role | Accessibility |
| 25 | Sidebar has aside landmark | Accessibility |
| 26 | Session cookie is HttpOnly | Security |
| 27 | Session cookie has Secure flag on HTTPS | Security |
| 28 | Clearing cookies redirects to login | Security |
| 29 | XSS in search input does not execute | Security |
| 30 | CSP header is present | Security |
| 31 | X-Frame-Options / frame-ancestors prevents clickjacking | Security |
| 32 | X-Content-Type-Options: nosniff present | Security |
| 33 | CSRF: POST without token returns 401/403 | Security |
| 34 | Dashboard page has `<title>` tag | SEO |
| 35 | Dashboard title contains brand keyword | SEO |
| 36 | Dashboard has meta description | SEO |
| 37 | Dashboard has Open Graph title | SEO |
| 38 | Sidebar and main content do not overlap | Layout |
| 39 | CSS custom properties / design tokens are applied | Design System |
| 40 | Settings tab accessible via `?tab=settings` | Navigation |
| 41 | First name / last name inputs visible and pre-filled | Settings |
| 42 | Email field shows logged-in user's email | Settings |
| 43 | Email field is read-only | Settings |
| 44 | Save/update profile button is present | Settings |
| 45 | Password fields default to `type="password"` | Settings |
| 46 | Show/hide toggle button exists | Settings |
| 47 | Empty password fields show required validation | Settings |
| 48 | Token usage tab accessible via `?tab=token-usage` | Token Usage |
| 49 | Token allocation bar renders | Token Usage |
| 50 | Usage log table is visible with column headers | Token Usage |
| 51 | Feature and token count columns present in logs | Token Usage |
| 52 | Log rows display numeric token values | Token Usage |
| 53 | Desktop (1440px): prompt and projects visible | Responsive |
| 54 | Tablet (768px): layout renders without overflow | Responsive |
| 55 | Mobile (<426px): shows "Coming Soon on Mobile" block | Responsive |
| 56 | Dashboard JS bundle does not produce memory warnings | Performance |
| 57 | No unhandled promise rejections on dashboard | Reliability |
| 58 | No 5xx network errors on dashboard load | Network |

---

## Summary Table

| # | Issue | Priority | Category |
|---|---|---|---|
| 1 | Auth guard missing — unauthenticated access to all dashboard routes | Critical | Security |
| 2 | XSS payload executes in prompt editor | Critical | Security |
| 3 | Cloudflare analytics script blocked by CSP | High | Console / CSP |
| 4 | Paddle CSS stylesheet blocked by CSP | High | Console / CSP |
| 5 | Paddle billing SDK not initialized | High | Integration |
| 6 | Paddle API returns 429 rate limit on load | High | Console / Performance |
| 7 | Workspace tab takes 38+ seconds to load | High | Performance |
| 8 | Workspace API responds in 38+ seconds | High | Performance / API |
| 9 | Settings tab takes 24+ seconds to load | High | Performance |
| 10 | Data isolation check failed | High | Security |
| 11 | Console errors on workspace tab navigation | Medium | Console Errors |
| 12 | Console errors on settings tab navigation | Medium | Console Errors |
| 13 | Slash menu does not appear on "/" in prompt | Medium | Functionality |
| 14 | "Spin up an idea" does not fill prompt (tour blocks click) | Medium | Functionality |
| 15 | "Spin up an idea" returns the same idea each click | Medium | Logic |
| 16 | "Start with a Guided Brief" does not navigate (tour blocks) | Medium | Functionality |
| 17 | OR divider between prompt and guided brief not visible | Medium | UI |
| 18 | Project cards have no thumbnail or placeholder | Medium | UI |
| 19 | Clicking a project card does not navigate | Medium | Functionality |
| 20 | Project card has no hover state | Low | UI Polish |
| 21 | Avatar upload area not visible in settings | Medium | UI / Settings |
| 22 | Current avatar not displayed in settings | Medium | UI / Settings |
| 23 | Password show/hide toggle does not reveal text | Medium | Functionality |
| 24 | Token usage — used/remaining counts not displayed | Medium | UI / Token Usage |
| 25 | Token usage percentage label not shown | Low | UI / Token Usage |
| 26 | "Model" column missing from usage logs table | Low | UI / Token Usage |
| 27 | Dashboard makes 21 API calls on load (threshold: 20) | Low | Performance |
| 28 | Sitemap API returns 404 for a project resource | Low | API / Data |
| 29 | Product tour overlay blocks multiple dashboard interactions | Medium | UX / Logic |

---

## Recommended Actions

### Immediate (Critical)

1. **Add auth guard on all dashboard routes** — Server-side or middleware redirect: `if (!session) redirect('/auth/login')`. Applies to `/` and all `/?tab=*` paths.
2. **Fix XSS in prompt editor** — Sanitize contenteditable input before rendering. Strip all HTML tags on input using `DOMPurify` or enforce `textContent` instead of `innerHTML`.

### High Priority

3. **Fix CSP to allow Cloudflare Insights and Paddle** — Add `https://static.cloudflareinsights.com` to `script-src` and `https://cdn.paddle.com` to both `script-src` and `style-src`.
4. **Initialize Paddle SDK correctly** — Call `Paddle.Initialize({ token: '...' })` with a valid seller ID during app boot.
5. **Diagnose workspace API latency (38s)** — Profile the `/api/workspaces` endpoint. Likely a missing DB index, N+1 query, or cold-start issue.
6. **Diagnose settings tab latency (24s)** — Profile the settings tab data fetch pipeline.
7. **Investigate data isolation** — Manually verify workspace and project API responses are scoped to the authenticated user.

### Medium Priority

8. **Fix product tour overlay blocking buttons** — Ensure the tour overlay does not intercept clicks on "Spin up an idea" and "Start with a Guided Brief". Implement a tour dismiss mechanism that runs before functional interactions.
9. **Fix "Start with a Guided Brief" navigation** — Verify the click handler is attached and not intercepted by a tour or portal overlay.
10. **Fix "Spin up an idea" randomization** — Ensure the idea generator returns different suggestions on each call.
11. **Add thumbnail/placeholder to project cards** — Display a generated preview image or a branded placeholder with the project name initials.
12. **Fix project card click navigation** — Attach a click handler that routes to `/projects/{id}/sitemap`.
13. **Restore avatar upload UI in settings** — Ensure the avatar upload area and current avatar display are rendered and visible.
14. **Fix password show/hide toggle** — The toggle button exists but doesn't change the input type. Verify the event handler is correctly wired to toggle between `type="password"` and `type="text"`.
15. **Fix token usage count display** — Render numerical values for used and remaining tokens alongside the progress bar.

### Low Priority

16. **Add OR divider between prompt and guided brief** — A simple visual separator to improve layout clarity.
17. **Add hover state to project cards** — At minimum `cursor: pointer` plus a box-shadow on hover.
18. **Add token usage percentage label** — Display "X% used" near the progress bar.
19. **Add "Model" column to usage logs** — Include the AI model name in the token usage history table.
20. **Reduce API calls on load** — Defer non-critical requests to bring initial load count below 20.
21. **Handle 404 sitemap API responses gracefully** — Remove stale sitemap references or show a proper empty state without polluting the network log.
