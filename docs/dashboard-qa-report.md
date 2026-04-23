# Sprout OS — Dashboard QA Report

**Date:** 2026-04-23
**Tested URL:** https://sproutos.ai/dashboard
**Test Suite:** `tests/sproutos/dashboard-ui.spec.js`
**Result:** 23 Passed · 7 Failed · 30 Total

---

## Issues Found

---

### Issue 1

**Priority:** High
**Issue Name:** Onboarding Tour Overlay Blocks "Spin up an Idea" Button Click

**Issue:**
When a user logs in for the first time (or when the onboarding driver tour is active), a full-screen `driver.js` overlay SVG (`driver-overlay`) intercepts all pointer events on the dashboard. This makes the "Spin up an idea" button completely unclickable despite being visible on screen.

**Steps to Reproduce:**
1. Log in to https://sproutos.ai with a new or returning account that has the onboarding tour active
2. On the dashboard, observe the onboarding tour popover ("Write Project Prompt")
3. Try clicking the "Spin up an idea" button below the prompt card

**Expected:**
The "Spin up an idea" button should be clickable. Clicking it should fill the prompt editor with a random suggestion from the preset list.

**Actual:**
The click is blocked by `driver-overlay` SVG path. The button never receives the click event. The prompt remains empty.

---

### Issue 2

**Priority:** High
**Issue Name:** Onboarding Tour Overlay Blocks "Start with a Guided Brief" Button Click

**Issue:**
The same `driver.js` onboarding overlay that blocks "Spin up an idea" also blocks the "Start with a Guided Brief" button. Both buttons are covered by the animated overlay SVG during the tour.

**Steps to Reproduce:**
1. Log in to https://sproutos.ai with an account that has the onboarding tour active
2. On the dashboard, observe the onboarding tour popover
3. Try clicking the "Start with a Guided Brief" button below the OR divider

**Expected:**
Clicking "Start with a Guided Brief" should dismiss or bypass the tour and navigate to the guided brief tab.

**Actual:**
Click is intercepted by the `driver-overlay`. The guided brief tab never opens. The user is stuck unless they manually dismiss the tour first.

---

### Issue 3

**Priority:** High
**Issue Name:** Onboarding Tour Overlay Blocks Clicking Recent Projects in Sidebar

**Issue:**
The `driver.js` overlay also blocks clicks on recent project items in the sidebar "Last Opened" section while the onboarding tour is active. Users cannot open any recent project during the tour.

**Steps to Reproduce:**
1. Log in with an account that has recent projects and an active onboarding tour
2. Look at the "Last Opened" section in the left sidebar
3. Try clicking on any recent project name to open it

**Expected:**
Clicking a recent project should navigate to `/project/sitemap?id={projectId}`.

**Actual:**
The click is blocked by the `driver-overlay` SVG. Navigation does not occur.

---

### Issue 4

**Priority:** Medium
**Issue Name:** Enter Key in Prompt Field Does Not Trigger Generation Visually

**Issue:**
Pressing Enter in the prompt editor after typing a prompt does not produce a visible loading/generation state or navigate the user forward. The generation may be silently failing or starting without any visual feedback.

**Steps to Reproduce:**
1. Log in and navigate to https://sproutos.ai/dashboard
2. Click the prompt card editor area
3. Type: `Create a portfolio for a photographer`
4. Press Enter (without Shift)

**Expected:**
The app should start generating the sitemap — showing a spinner/loading indicator, or navigating to the project sitemap page.

**Actual:**
No loading indicator appears and the URL remains at `/dashboard`. The Enter key press appears to have no visible effect.

---

### Issue 5

**Priority:** Medium
**Issue Name:** Sidebar "Last Opened" Shows More Than 3 Projects

**Issue:**
The source code slices `recentProjects` to 3 items (`.slice(0, 3)`), but the sidebar renders 6 truncated text items. This suggests either the slice is not applied correctly, or additional truncated elements from other parts of the sidebar are being counted as recent project items.

**Steps to Reproduce:**
1. Log in with an account that has 3 or more recent projects
2. Open the dashboard and look at the "Last Opened" section in the left sidebar
3. Count the number of project name rows visible

**Expected:**
At most 3 recent project items should be shown in the "Last Opened" section.

**Actual:**
6 items with `truncate` class are rendered in the sidebar. The sidebar may be showing projects from both "Last Opened" and an additional section without a clear visual separator, causing confusion.

---

### Issue 6

**Priority:** Low
**Issue Name:** Workspace Team Pill — Mobile Hamburger Button Takes Precedence in DOM

**Issue:**
The first `<button>` in the `<header>` is the mobile hamburger menu toggle (hidden on desktop via `min-[426px]:hidden`). On desktop viewport (1440×900), querying `header button:first` resolves to this hidden mobile button instead of the workspace team name button, making it impossible to interact with the workspace pill via standard DOM traversal.

**Steps to Reproduce:**
1. Open https://sproutos.ai/dashboard on a desktop browser (viewport ≥ 426px)
2. Inspect the header DOM
3. Note the first `<button>` is the hamburger with class `min-[426px]:hidden`

**Expected:**
The first visible and interactive button in the header on desktop should be the workspace team pill (avatar + name), not a hidden mobile element.

**Actual:**
The mobile-only hamburger button is the first button in DOM order but is visually hidden on desktop. This creates confusion for automated testing and may affect screen reader tab order.

---

### Issue 7

**Priority:** Low
**Issue Name:** Workspace Name Button Does Not Update URL to `?tab=workspace`

**Issue:**
Clicking the workspace name button in the header is expected to open the workspace settings tab (navigating to `/dashboard?tab=workspace`). The URL does not reflect the tab change, which breaks deep-linking and browser back/forward navigation for the workspace tab.

**Steps to Reproduce:**
1. Log in and go to https://sproutos.ai/dashboard
2. Click the workspace team name pill in the top header
3. Observe the browser URL bar after the click

**Expected:**
URL should update to `https://sproutos.ai/dashboard?tab=workspace`.

**Actual:**
The URL does not update to include `?tab=workspace`. The tab content may load in the UI, but the URL change is either delayed or not occurring, preventing direct linking to the workspace settings page.

---

## Summary Table

| # | Issue Name | Priority | Area |
|---|---|---|---|
| 1 | Onboarding tour blocks "Spin up an idea" click | High | Prompt Suggestions |
| 2 | Onboarding tour blocks "Start with a Guided Brief" click | High | Prompt Suggestions |
| 3 | Onboarding tour blocks recent project clicks in sidebar | High | Recent Projects |
| 4 | Enter key in prompt field has no visible generation feedback | Medium | Prompt Field |
| 5 | Sidebar shows more than 3 recent projects | Medium | Recent Projects |
| 6 | Mobile hamburger DOM order issue in header | Low | Space / Workspace |
| 7 | Workspace name click does not update URL | Low | Space / Workspace |
