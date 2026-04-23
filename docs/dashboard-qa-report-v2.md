# Sprout OS — Dashboard QA Bug Report
**Suite:** `tests/sproutos/dashboard/` (Desktop Chrome)
**Result:** 137 passed · 55 failed · 26 skipped
**Date:** 2026-04-23

---

## BUG-01
**Priority:** CRITICAL
**Bug Short Name:** Dashboard Routes Accessible Without Login

**Issue:**
All dashboard routes render content to unauthenticated users instead of redirecting to `/auth/login`. Visiting `/`, `/?tab=workspace`, `/?tab=team-management`, `/?tab=roles`, `/?tab=settings`, `/?tab=token-usage`, `/dashboard?tab=workspace`, `/dashboard?tab=team-management`, or `/dashboard?tab=roles` without a session shows the full authenticated UI.

**Steps to Reproduce:**
1. Open a private/incognito browser window (no active session)
2. Navigate directly to `https://sproutos.ai/`
3. Note the page renders the dashboard home, not the login screen
4. Repeat for `/?tab=settings`, `/?tab=workspace`, `/?tab=team-management`, `/?tab=roles`, `/?tab=token-usage`

**Expected Result:**
All protected routes redirect to `/auth/login` when no valid session exists.

---

## BUG-02
**Priority:** HIGH
**Bug Short Name:** Paddle Billing SDK Not Initialized on Workspace Tab

**Issue:**
Every time the workspace tab loads, a console error fires: `[PADDLE BILLING] You must specify your Paddle Seller ID or token within the Paddle.Initialize() method`. The Paddle billing SDK is loaded without a Seller ID/token, causing a broken billing integration and a noisy error log.

**Steps to Reproduce:**
1. Log in and navigate to `/?tab=workspace`
2. Open browser DevTools → Console tab
3. Observe the Paddle billing error immediately on page load

**Expected Result:**
Paddle SDK initializes with a valid Seller ID/token, or is conditionally loaded only when billing is active. No console error on the workspace tab.

---

## BUG-03
**Priority:** HIGH
**Bug Short Name:** Multiple Console Errors on Dashboard, Workspace, and Settings Pages

**Issue:**
Critical JavaScript console errors are thrown on multiple dashboard tabs:
- Dashboard home: **4 console errors** on load
- Workspace tab: **6 console errors** on load (includes Paddle error)
- Settings tab: **5 console errors** on load

**Steps to Reproduce:**
1. Log in and land on the dashboard home (`/`)
2. Open DevTools → Console
3. Reload the page and count errors
4. Navigate to `/?tab=workspace` — 6 errors appear
5. Navigate to `/?tab=settings` — 5 errors appear

**Expected Result:**
Zero console errors on all dashboard tabs during normal operation.

---

## BUG-04
**Priority:** HIGH
**Bug Short Name:** "Spin up an Idea" Button Does Not Fill Prompt

**Issue:**
Clicking the "Spin up an idea" button on the dashboard home page does not populate the contenteditable prompt editor with a suggestion. After clicking, the editor remains empty (text length = 0). Clicking multiple times also produces no text.

**Steps to Reproduce:**
1. Log in and dismiss the onboarding tour
2. Locate the "Spin up an idea" button below the prompt editor
3. Click the button
4. Check the `#dashboard-prompt-card [contenteditable="true"]` element

**Expected Result:**
Each click fills the prompt editor with a random suggestion from the PLACEHOLDER_SUGGESTIONS list. The editor text length should be greater than 0.

---

## BUG-05
**Priority:** HIGH
**Bug Short Name:** "Start with a Guided Brief" Button Does Not Navigate

**Issue:**
Clicking the "Start with a Guided Brief" button does not change the URL or render the guided brief interface. The URL stays on the dashboard home and no guided brief content appears.

**Steps to Reproduce:**
1. Log in to the dashboard
2. Click the "Start with a Guided Brief" button
3. Wait 3 seconds and observe the URL and page content

**Expected Result:**
Clicking the button navigates to the guided brief flow (URL contains `guided`) or reveals the guided brief form inline on the page.

---

## BUG-06
**Priority:** HIGH
**Bug Short Name:** Invite Button in Team Management Not Clickable

**Issue:**
The "Invite" button in the Team Management tab is visible and resolved by the test runner as enabled and stable, but every click attempt times out after 15 seconds. The button has pointer-events blocked by an overlapping element, making the invite flow completely inaccessible via click.

**Steps to Reproduce:**
1. Log in and navigate to `/?tab=team-management`
2. Locate the "Invite" button in the team management panel
3. Click the button
4. Observe that nothing happens

**Expected Result:**
Clicking the Invite button opens the invite modal with "Invite by email" and "Share link" tabs.

---

## BUG-07
**Priority:** HIGH
**Bug Short Name:** Create/Manage Mode Toggle Not Found on Workspace Tab

**Issue:**
The Create/Manage workspace mode toggle (`[role="tablist"]` with Create/Manage tabs) is not found on the workspace tab. Tests for tab active state, tab switching, and the sparkles icon all fail because the toggle UI element does not exist on the page at `/?tab=workspace`.

**Steps to Reproduce:**
1. Log in and navigate to `/?tab=workspace`
2. Look for the Create / Manage toggle in the workspace panel
3. Inspect the DOM for `[role="tablist"]` or `[role="tab"]` elements with text "Create" or "Manage"

**Expected Result:**
A Create/Manage mode toggle is clearly visible on the workspace tab, allowing users to switch between creating new projects and managing existing ones.

---

## BUG-08
**Priority:** MEDIUM
**Bug Short Name:** Workspace Tab Performance — 14.7s Load Time

**Issue:**
The workspace tab (`/?tab=workspace`) takes **14.7 seconds** to reach `networkidle` state. This is approximately 3× over the acceptable 5-second threshold, severely degrading the user experience when switching to workspace management.

**Steps to Reproduce:**
1. Log in to the dashboard
2. Record the time when navigating to `/?tab=workspace`
3. Wait for all network requests to settle (networkidle)
4. Observe total elapsed time ≈ 14.7s

**Expected Result:**
The workspace tab should reach an interactive state within 5 seconds.

---

## BUG-09
**Priority:** MEDIUM
**Bug Short Name:** Workspace API Response Time — 19s (Threshold 3s)

**Issue:**
The workspace API endpoint responds in **19 seconds**, which is over 6× the acceptable 3-second threshold. This causes the workspace UI to render a loading state for an unreasonably long time before data appears.

**Steps to Reproduce:**
1. Log in and open DevTools → Network tab
2. Navigate to `/?tab=workspace`
3. Find the API calls to `/api/workspace` or `/api/org`
4. Observe response time ≈ 19s

**Expected Result:**
Workspace API should respond within 3 seconds under normal conditions.

---

## BUG-10
**Priority:** MEDIUM
**Bug Short Name:** Settings Tab Performance — 6.9s Load Time

**Issue:**
The settings tab (`/?tab=settings`) takes **6.9 seconds** to reach `networkidle` state, exceeding the 5-second acceptable threshold by 38%.

**Steps to Reproduce:**
1. Log in to the dashboard
2. Navigate to `/?tab=settings`
3. Measure time until network is idle

**Expected Result:**
The settings tab should load within 5 seconds.

---

## BUG-11
**Priority:** MEDIUM
**Bug Short Name:** Excessive API Polling — 16 Calls in 5s Idle

**Issue:**
After the dashboard fully loads (networkidle), the app continues making **16 API calls in a 5-second idle period**. This is excessive background polling that wastes bandwidth and can degrade performance, especially on slower connections.

**Steps to Reproduce:**
1. Log in and let the dashboard fully load
2. Open DevTools → Network tab, filter by XHR/Fetch
3. Sit idle for 5 seconds without any user interaction
4. Count the API calls made

**Expected Result:**
Fewer than 5 background API calls should occur during a 5-second idle period. Long-poll or WebSocket should be used instead of frequent polling.

---

## BUG-12
**Priority:** MEDIUM
**Bug Short Name:** Project Card Click Blocked by Overlay

**Issue:**
Clicking a project card in the dashboard projects grid does not navigate to the project's sitemap page. The card element is found, resolves as visible and stable, but the click action times out after 15 seconds — indicating an invisible overlay is blocking pointer events on the card.

**Steps to Reproduce:**
1. Log in (ensure at least one project exists)
2. On the dashboard home, observe the projects grid
3. Click any project card
4. Observe the URL does not change and no navigation occurs

**Expected Result:**
Clicking a project card navigates to the project's sitemap editor (URL pattern: `/project/[id]/sitemap`).

---

## BUG-13
**Priority:** MEDIUM
**Bug Short Name:** Sidebar Project Item Hover Does Not Reveal 3-Dot Menu

**Issue:**
Hovering over a recent project item in the sidebar does not reveal the 3-dot context menu button. The element is visible and stable, but the hover action times out after 15 seconds. The 3-dot menu is never shown.

**Steps to Reproduce:**
1. Log in (ensure at least one recent project exists in the sidebar)
2. Hover the mouse over a project item in the "Last Opened" sidebar section
3. Wait for the 3-dot menu button to appear
4. Observe that nothing appears

**Expected Result:**
On hover, a 3-dot menu button becomes visible on the project row, allowing users to rename, delete, or duplicate the project.

---

## BUG-14
**Priority:** MEDIUM
**Bug Short Name:** Sidebar Recent Project Click Does Not Navigate

**Issue:**
Clicking a project name in the sidebar "Last Opened" section does not navigate away from the dashboard. The URL remains `https://sproutos.ai/dashboard` after clicking.

**Steps to Reproduce:**
1. Log in (ensure at least one recent project exists)
2. Click any project name in the sidebar "Last Opened" list
3. Wait 2 seconds and observe the URL

**Expected Result:**
Clicking a recent project navigates to the project's page (URL should contain `/project` or `/sitemap`).

---

## BUG-15
**Priority:** MEDIUM
**Bug Short Name:** Driver.js Tour Creates Duplicate `<header>` Element in DOM

**Issue:**
The driver.js onboarding tour injects a `<header id="driver-popover-title">Write Project Prompt</header>` element that remains in the DOM even after the tour is dismissed. This causes strict mode violations when tests or screen readers query `header`, which now resolves to 2 elements instead of 1.

**Steps to Reproduce:**
1. Log in (driver.js tour is triggered)
2. Dismiss the tour by clicking Skip or pressing Escape
3. Inspect the DOM and search for `<header>` elements
4. Observe 2 header elements present: the real app header and a stale driver.js one

**Expected Result:**
After the tour is dismissed, all driver.js DOM injections (popover, overlay, extra elements) are fully cleaned up. Only one `<header>` element should exist in the DOM.

---

## BUG-16
**Priority:** MEDIUM
**Bug Short Name:** 3 Failed Network Requests on Dashboard Load

**Issue:**
On every dashboard page load, 3 HTTP requests return error status codes (4xx or 5xx). This can cause missing data, broken UI states, or degraded functionality that may not be immediately obvious to users.

**Steps to Reproduce:**
1. Log in and open DevTools → Network tab
2. Reload the dashboard page
3. Filter by status codes ≥ 400
4. Observe 3 failed requests

**Expected Result:**
Zero failed network requests on a normal authenticated dashboard load.

---

## BUG-17
**Priority:** LOW
**Bug Short Name:** User Avatar/Initials Not Found in Header Pill

**Issue:**
The user avatar or initials element inside the header workspace pill is not found via `header [class*="avatar"]` or `header [class*="Avatar"]`. Either the avatar is rendered using a different class naming convention, or it is missing from the header entirely.

**Steps to Reproduce:**
1. Log in and observe the header
2. Inspect the header HTML for an avatar/initials element
3. Note that no element with `avatar` or `Avatar` in its class name exists inside `<header>`

**Expected Result:**
The user's avatar or initials are clearly visible in the header pill area, providing visual confirmation of the logged-in user.

---

## BUG-18
**Priority:** LOW
**Bug Short Name:** SproutOS Logo Hidden in Header

**Issue:**
The SproutOS logo (`header img` or `header svg`) is present in the DOM but in a `hidden` visibility state. The logo is not displayed to the user in the header area.

**Steps to Reproduce:**
1. Log in and observe the dashboard header
2. Inspect the HTML inside `<header>` for `<img>` or `<svg>` elements
3. Check the computed CSS visibility/display property

**Expected Result:**
The SproutOS logo is clearly visible in the header on all authenticated pages.

---

## BUG-19
**Priority:** LOW
**Bug Short Name:** Team Member List Does Not Render on Team Management Tab

**Issue:**
After navigating to `/?tab=team-management`, neither a member list nor an empty-state message is rendered. The page appears to load but the member content area is blank — no member rows, no "No members" text, and no loading indicator.

**Steps to Reproduce:**
1. Log in and navigate to `/?tab=team-management`
2. Wait for the page to fully load
3. Look for member cards, a member table, or an empty-state message

**Expected Result:**
The team management tab shows either the list of workspace members (with their roles and avatars) or a clear empty-state UI if no additional members have been invited.

---

*Generated by Playwright Test Suite — Sprout OS Orbit QA Framework*
*Total: 137 passed · 55 failed · 26 skipped across 218 desktop tests*
