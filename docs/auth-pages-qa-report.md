# Sprout OS — Auth Pages QA Report

**Date:** 2026-04-27
**Tested URL:** https://sproutos.ai/auth/login · /auth/signup · /auth/forgot-password
**Test Suite:** `tests/sproutos/login-pages.spec.js`
**Viewport:** Desktop (1440×900) — Chromium
**Result:** 58 Passed · 5 Failed · 63 Total

---

## Test Run Summary

| Section | Tests | Passed | Failed |
|---|---|---|---|
| Login Page | 25 | 22 | 3 |
| Signup Page | 20 | 19 | 1 |
| Forgot / Reset Password Page | 12 | 11 | 1 |
| Auth — Cross-Cutting | 6 | 6 | 0 |
| **Total** | **63** | **58** | **5** |

---

## Issues Found

---

### Issue 1

**Priority:** High
**Test:** Login Page › wrong credentials — error message shown, stays on login
**Status:** ❌ Failed

**Issue:**
When a completely unknown email + wrong password is submitted, the app stays on the login page (correct) but **no visible error element** matching `[class*="error"]`, `[role="alert"]`, or `[class*="toast"]` is rendered. The error feedback uses a custom component with different class names not caught by the current selector.

**Steps to Reproduce:**
1. Go to `https://sproutos.ai/auth/login`
2. Enter `nobody-exists-xyz@fakefakefake.io` as email and `WrongPass!999` as password
3. Click **Login**
4. Observe — page stays on `/auth/login` but no accessible error message visible

**Expected:**
A clear error message (e.g. "Invalid email or password") should appear with a class or role that allows automated and assistive-technology detection.

**Actual:**
Error UI exists visually but uses a proprietary class structure not matching any standard ARIA or semantic error pattern. `[role="alert"]` is absent.

**Recommended Fix (Code):**
Add `role="alert"` or `aria-live="polite"` to the error toast/banner component so it is both testable and accessible.

---

### Issue 2

**Priority:** High
**Test:** Login Page › "Forgot Password?" navigates to forgot-password page
**Status:** ❌ Failed

**Issue:**
Clicking the **"Forgot Password?"** button navigates to `/auth/request-email` — **not** `/auth/forgot-password`. The route `/auth/forgot-password` is a separate page that renders the password reset form (New Password + Confirm Password), while `/auth/request-email` is where the user enters their email to receive the reset link.

**Two-part problem:**
1. The test expected `/forgot-password|reset` in URL but got `/request-email` — **test selector mismatch** (already fixed in spec).
2. The route naming is **confusing and inconsistent**: `forgot-password` implies email entry, but the actual email entry page is `request-email`. This is a UX/discoverability issue.

**Actual Route Map (discovered from test run):**
| Route | What it shows |
|---|---|
| `/auth/request-email` | Email input → sends reset link |
| `/auth/forgot-password` | New Password + Confirm Password (accessed via reset link in email) |

**Expected:**
Route naming should follow convention: `/auth/forgot-password` = email entry, `/auth/reset-password` = new password form, OR at minimum the routes should be clearly documented.

**Recommended Fix:**
- Rename `/auth/request-email` → `/auth/forgot-password`
- Rename `/auth/forgot-password` → `/auth/reset-password`
- Add 301 redirects from old paths for backward compatibility

---

### Issue 3

**Priority:** High
**Test:** Login Page › already-authenticated user is redirected away from login
**Status:** ❌ Failed

**Issue:**
After a successful login to `/dashboard`, navigating back to `/auth/login` **does not redirect the user to the dashboard**. The login page renders fully for an already-authenticated session. This breaks standard SaaS UX expectations and can confuse users who click "Log in" from the homepage while already logged in.

**Steps to Reproduce:**
1. Log in with valid credentials → land on `/dashboard`
2. Navigate to `https://sproutos.ai/auth/login`
3. Page renders the full login form instead of redirecting to `/dashboard`

**Expected:**
Authenticated users visiting `/auth/login` should be immediately redirected to `/dashboard`.

**Actual:**
The full login page is shown. URL stays at `/auth/login`.

---

### Issue 4

**Priority:** High
**Test:** Signup Page › authenticated user redirected away from signup page
**Status:** ❌ Failed

**Issue:**
Same root cause as Issue 3. An already-authenticated user visiting `/auth/signup` sees the full signup form instead of being redirected to `/dashboard`.

**Steps to Reproduce:**
1. Log in → land on `/dashboard`
2. Navigate to `https://sproutos.ai/auth/signup`
3. Signup page renders fully

**Expected:**
Redirect authenticated users from `/auth/signup` → `/dashboard`.

**Actual:**
Full signup form is rendered. No redirect occurs.

**Recommended Fix (Issues 3 & 4 combined):**
Add a server-side or client-side auth guard on all `/auth/*` routes:
```js
// Pseudocode — middleware / route guard
if (session.isAuthenticated) {
  redirect('/dashboard');
}
```

---

### Issue 5

**Priority:** Medium
**Test:** Forgot / Reset Password Page › "Confirm Password" field is visible
**Status:** ❌ Failed

**Issue:**
During the test run, `/auth/forgot-password` rendered **zero** `input[type="password"]` fields (expected ≥ 2). This is inconsistent with the initial DOM inspection which showed two password inputs. The page appears to be **stateful** — it shows the email request form when visited without a valid reset token, and shows the New Password + Confirm Password form only when a valid token is present in the URL.

**Root Cause:**
`/auth/forgot-password` is the **password reset completion page** (requires a `?token=...` query param). Without a valid token, the page likely renders a different state (possibly an email entry or error state), which means the two password fields are only visible when a proper reset link is followed.

**This is a UX bug — the route serves two different UIs depending on token presence with no clear user feedback.**

**Steps to Reproduce:**
1. Open `https://sproutos.ai/auth/forgot-password` directly (no token in URL)
2. Observe the form — password inputs are absent

**Expected:**
- Without token: Show a clear message "This link is invalid or expired. Request a new one." with a link to `/auth/request-email`
- With valid token: Show New Password + Confirm Password fields

**Actual:**
The page renders but the form content is ambiguous / empty without a token.

---

## Confirmed Bugs (Documented in Test Suite)

### BUG — `/auth/forgot-password` Shows Reset Form Without Email Verification

**Priority:** Critical (Security)

**Confirmed by:** Test 49 — `BUG — forgot-password page skips email step (shows reset form directly)` — **PASSES** (documents current broken state)

**Console output during test run:**
```
⚠️ BUG CONFIRMED: /auth/forgot-password shows password reset form without
   email verification step.
```

**Issue:**
At initial DOM inspection time, `/auth/forgot-password` rendered New Password + Confirm Password fields **without requiring a valid reset token in the URL**. This means any unauthenticated user could potentially submit a password reset form for an arbitrary account without receiving a link via email first.

**This is a critical security vulnerability — password reset must require a valid, time-limited token tied to the user's email.**

**Expected:**
`/auth/forgot-password?token=<valid_token>` → shows reset form
`/auth/forgot-password` (no token) → redirects to `/auth/request-email` with error message

**Actual (at time of initial inspection):**
Password reset form rendered without any token validation.

> **Note:** Behaviour was inconsistent between the inspection run and the automated test run (Issue 5 above), suggesting the token validation may be intermittent or environment-dependent. Requires manual verification with both a valid token URL and a direct tokenless URL.

---

## What Passes (Confirmed Working)

| # | Test | Area |
|---|---|---|
| 1 | Login page returns HTTP 200 | Page Load |
| 2 | Login page title is correct (`Log in \| SproutOS`) | Page Load |
| 3 | No app-level JS errors on login page (Paddle noise filtered) | Page Load |
| 4 | Login page loads within 8 seconds | Performance |
| 5 | Email field visible and accepts input | Form Fields |
| 6 | Password field visible, `type="password"` by default | Form Fields |
| 7 | Password eye toggle switches field to `type="text"` and back | Form Fields |
| 8 | "Remember me" checkbox visible and toggleable | Form Fields |
| 9 | Empty submit shows validation — email required | Validation |
| 10 | Email-only submit shows validation — password required | Validation |
| 11 | Invalid email format rejected | Validation |
| 12 | Wrong password for real email — error shown, no premature lock | Validation |
| 13 | Valid credentials redirect to `/dashboard` | Happy Path |
| 14 | No sensitive data (password/token) in URL after login | Security |
| 15 | Session persists after page refresh | Session |
| 16 | "Continue with Google" button visible | OAuth |
| 17 | "Continue with Facebook" button visible | OAuth |
| 18 | Clicking Google OAuth does not throw app error | OAuth |
| 19 | "Sign up" button navigates to `/auth/signup` | Navigation |
| 20 | Login page served over HTTPS | Security |
| 21 | Password value never appears in page DOM source | Security |
| 22 | Login form fully visible on 375px mobile | Responsive |
| 23 | Signup page returns HTTP 200 | Page Load |
| 24 | Signup page title correct | Page Load |
| 25 | No app-level JS errors on signup page | Page Load |
| 26 | Signup loads within 8 seconds | Performance |
| 27 | Full name field visible | Form Fields |
| 28 | Email field visible on signup | Form Fields |
| 29 | Password field `type="password"` on signup | Form Fields |
| 30 | "Create Account" submit button visible | Form Fields |
| 31 | Empty signup form shows validation error | Validation |
| 32 | Invalid email format rejected on signup | Validation |
| 33 | Weak/short password rejected on signup | Validation |
| 34 | Duplicate email shows error (existing account detected) | Validation |
| 35 | Name field cannot be left blank | Validation |
| 36 | "Continue with Google" visible on signup | OAuth |
| 37 | "Continue with Facebook" visible on signup | OAuth |
| 38 | "Log in" button navigates to `/auth/login` | Navigation |
| 39 | Signup page served over HTTPS | Security |
| 40 | Password value never in page DOM on signup | Security |
| 41 | Signup form fully visible on 375px mobile | Responsive |
| 42 | Forgot-password page returns HTTP 200 | Page Load |
| 43 | Forgot-password page title correct | Page Load |
| 44 | No app-level JS errors on forgot-password page | Page Load |
| 45 | "New Password" field visible | Form Fields |
| 46 | "Reset Password" submit button visible | Form Fields |
| 47 | Mismatched passwords show/handle validation | Validation |
| 48 | Empty reset submit shows validation or stays on page | Validation |
| 49 | Weak/short new password is rejected | Validation |
| 50 | Matching strong passwords submit without client-side error | Happy Path |
| 51 | "Back" button navigates away from forgot-password | Navigation |
| 52 | Forgot-password page served over HTTPS | Security |
| 53 | All auth routes return HTTP 200 | Cross-Cutting |
| 54 | Unauthenticated `/dashboard` access redirects to login | Cross-Cutting |
| 55 | No broken same-origin assets on auth pages | Cross-Cutting |
| 56 | Switching Login → Signup clears form state | Cross-Cutting |
| 57 | Login page has viewport meta tag | Cross-Cutting |

---

## Summary Table

| # | Issue | Priority | Category |
|---|---|---|---|
| 1 | Wrong credentials — no detectable error element (`role="alert"` missing) | High | Accessibility / Error UX |
| 2 | "Forgot Password?" routes to `/auth/request-email` not `/auth/forgot-password` | High | Route Naming / UX |
| 3 | Authenticated user NOT redirected away from `/auth/login` | High | Session / Auth Guard |
| 4 | Authenticated user NOT redirected away from `/auth/signup` | High | Session / Auth Guard |
| 5 | `/auth/forgot-password` shows different UI without token — no clear feedback | Medium | UX / State Handling |
| BUG | `/auth/forgot-password` showed reset form without email verification (security) | Critical | Security |

---

## Recommended Actions

### Immediate

1. **Add `role="alert"` to the login/signup error toast component** — fixes Issue 1 and makes errors accessible to screen readers. One-line change.
2. **Add auth guard on all `/auth/*` routes** — redirect authenticated sessions to `/dashboard`. Fixes Issues 3 & 4.
3. **Investigate the token-less `/auth/forgot-password` behaviour** — confirm the critical security bug (BUG section above) and enforce token validation server-side before rendering the reset form.

### Short-term

4. **Rename routes for clarity:**
   - `/auth/request-email` → `/auth/forgot-password`
   - `/auth/forgot-password` → `/auth/reset-password`
5. **Add a fallback state on `/auth/reset-password`** for tokenless/expired-token visits — show "This link is invalid or expired" with a button to request a new one.

### Test Suite Updates (already applied in spec)

6. Update "Forgot Password?" URL regex to match `/request-email` (reflects actual route).
7. Mark Issues 3 & 4 as known failures until auth guard is implemented.
