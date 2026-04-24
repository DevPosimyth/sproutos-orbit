# Sprout OS — Logic Checklist

> Validates business rules, state management, data persistence, edge cases, and error-handling correctness. These are the "does the right thing happen under the right conditions" checks.

---

## Auth & Session Logic

- [ ] Unauthenticated requests to protected routes (`/dashboard`, `/scope`, `/design`, `/manage`) redirect to `/login`
- [ ] After login redirect, user lands on the originally requested URL (not always `/dashboard`)
- [ ] OAuth state parameter verified on callback (CSRF protection)
- [ ] Email invite: accepting with a different email than the invited one is blocked
- [ ] Password reset token is single-use — second click shows "link expired"
- [ ] Password reset token expires after a defined window (e.g., 1 hour)
- [ ] Session cookie expires after inactivity — re-login required, no ghost session
- [ ] Multiple active sessions (two browsers) both valid; logout in one does not break the other
- [ ] Logout from one device does not invalidate all sessions unless "Log out everywhere" used

---

## Workspace Scoping

- [ ] Projects created in Workspace A are not visible in Workspace B
- [ ] Team members of Workspace A cannot access Workspace B data
- [ ] Token balance is scoped per workspace (Workspace A usage does not consume Workspace B tokens)
- [ ] Plan limits enforced per workspace independently
- [ ] Moving a project between workspaces transfers it completely (not duplicated)
- [ ] Only Admin/Owner can move projects between workspaces; Designer/Developer cannot

---

## Plan & Feature Gating Logic

- [ ] STARTER: creating 3rd project shows upgrade prompt; 2nd project proceeds
- [ ] STARTER: adding 21st page shows upgrade prompt; 20th page proceeds
- [ ] STARTER: adding 21st component on a page shows upgrade prompt; 20th proceeds
- [ ] FREE to STARTER upgrade: previously blocked features unlock immediately
- [ ] Downgrade: excess projects/pages remain but new ones blocked at lower limit
- [ ] Shared Concepts: 2nd concept blocked for FREE/STARTER, not for PRO+
- [ ] React export accessible only for PRO and above; upgrade prompt for others
- [ ] Feature gates enforced server-side (not just hidden in UI — API also rejects)

---

## Project State & Data Persistence

- [ ] Closing tab and reopening: sitemap, design settings, and text overrides restored from localStorage
- [ ] After server sync, localStorage and backend state are consistent
- [ ] Multiple browser tabs open on same project: changes in one tab reflected in other after refresh
- [ ] Image replacements persist across sessions (stored source map restored on reload)
- [ ] Text overrides stable across template variant changes (not wiped when switching variants)
- [ ] Color palette selection persists per project across sessions
- [ ] Font selection persists per project across sessions
- [ ] Section background color saved colors (up to 5) persist across sessions

---

## Guided Brief Logic

- [ ] URL field in Step 1 triggers crawl only when a valid URL is entered (not on every keystroke)
- [ ] Crawl result data does not overwrite user-manually-entered fields without confirmation
- [ ] Tone chips: selecting a tone in "Preferred" also removes it from "Tones to Avoid" if present (and vice versa)
- [ ] Reference site crawl in Step 5 runs independently per URL, not batched with project crawl
- [ ] Wizard state is saved on each step advance (navigating back preserves entered data)
- [ ] Submitting the brief without a URL in Step 1 proceeds without triggering a crawl

---

## Sitemap Editor Logic

- [ ] Cannot delete the last remaining page in a sitemap
- [ ] Page names must be unique — creating a duplicate name shows validation error
- [ ] Global sections (navbar/footer) are shared state: adding to one page adds to all; removing from all pages clears global status
- [ ] Copy/Cut/Paste clipboard holds only one section at a time (new copy overwrites old)
- [ ] Pasting a section into the same page where it was copied creates an independent duplicate
- [ ] Pasting a section cut from Page A into Page B removes it from Page A
- [ ] AI Sitemap Chat: undo reverts only the most recent AI action, not all changes
- [ ] AI suggestions (blog/legal) cooldown: dismissing one restarts 30s timer; banner does not reappear before timer elapses

---

## Design Editor Logic

- [ ] Selecting a variant does not reset user-edited text overrides for that section
- [ ] Selecting a variant does not reset user-replaced images for that section
- [ ] Bookmarked variants survive a page reload (stored in localStorage)
- [ ] Section drag-and-drop reordering updates the canonical section order, not just visual position
- [ ] Template preset application overwrites current section list with confirmation dialog
- [ ] Inline text editing: stable element IDs ensure the override re-applies to the correct element after variant change
- [ ] Legal compliance badge appears only on privacy policy and cookie consent sections, not others
- [ ] Viewport switch (desktop → tablet → mobile) does not reset any overrides

---

## Color System Logic

- [ ] HSL/HEX conversion: editing hex updates HSL fields and vice versa with mathematical accuracy
- [ ] Global saturation slider: applies proportionally to all colors (does not shift hue)
- [ ] Light/Dark theme toggle: changes text color tokens, not background colors
- [ ] Section background auto-collection: only unique colors collected (no duplicates in swatch list)
- [ ] Saved background colors: 6th color replaces the oldest in the saved list (FIFO or prompt user)
- [ ] Color token derivation (primary-tint, dark/light variants) recalculates when primary color changes

---

## Token System Logic

- [ ] Token deduction happens after successful AI response (not on request initiation)
- [ ] Failed AI requests (error, timeout) do not deduct tokens
- [ ] Token display in header updates in real-time after each AI action without page reload
- [ ] When workspace reaches 0 tokens: AI features show "out of tokens" state, not a silent failure
- [ ] Token usage table row appears immediately after an AI action completes
- [ ] Token usage scoped to workspace: switching workspaces shows that workspace's usage

---

## AI Text Generation Logic

- [ ] Token gate check runs before showing the generation popup (not after sending the request)
- [ ] Context (project description, element type, designed length) is fetched fresh per popup open
- [ ] "Make Shorter" does not produce output longer than the input
- [ ] "Make Longer" does not produce output shorter than the input
- [ ] Accepted text is bound to the specific element ID (not applied to all elements of same tag)
- [ ] Dismissed popup does not save any partial output

---

## AI Design Agent Logic

- [ ] Model selection persists for the session (not reset on each message)
- [ ] Each design suggestion is independent; selecting one does not auto-apply others
- [ ] Undo reverts the last accepted AI design suggestion only
- [ ] Redo re-applies only if the undo action was the last action (not available after a new change)
- [ ] Context (colors, fonts, sitemap, variants) refreshed before each message send

---

## Team & Invite Logic

- [ ] Sending an invite to an existing member shows an appropriate error
- [ ] Sending an invite to an already-invited (pending) email resends without creating duplicate
- [ ] Invite link: once accepted by one user, the link remains valid for others (it is reusable)
- [ ] Email invite: link becomes invalid after cancellation (not just hidden in UI)
- [ ] Expiry: expired invite link shows "this invite has expired" — not a generic 404
- [ ] Role change takes effect on next action by that user (or immediately on API call)
- [ ] Removing a member revokes all their active sessions in that workspace

---

## Roles & Permissions Logic

- [ ] Permission checks enforced server-side on API routes (not only on UI visibility)
- [ ] Designer cannot call billing API endpoints even if URL is manually entered
- [ ] Developer cannot call design-mutation API endpoints
- [ ] Client comment "View" permission: comment POST API returns 403
- [ ] Custom role permissions sync between all workspace members immediately on save
- [ ] Deleting a custom role: members assigned to it are reassigned to a default role (or blocked from action)

---

## Comments Logic

- [ ] Pin coordinates stored relative to the canvas element, not the viewport (do not drift on scroll/zoom)
- [ ] Clustering: pins within a threshold distance group into a cluster badge
- [ ] Expanding a cluster shows individual pins without layout overlap
- [ ] Comment thread reply is nested under the parent comment, not appended as a new pin
- [ ] Deleting a pin also deletes all replies in its thread
- [ ] Comment mode toggle does not discard unsaved in-progress design edits

---

## Export Logic

- [ ] Export reads the current saved state (not an unsaved draft)
- [ ] Plan gate check on export is server-side (API validates plan, not just the UI button state)
- [ ] "Request another platform" form submission reaches the backend (not a dead form)

---

## Manage Mode Logic

### Site Connection
- [ ] Application Password stored encrypted in MongoDB (not plaintext)
- [ ] Failed connection attempt clears any partially stored credentials
- [ ] Stale-while-revalidate: cached data served immediately; background refetch updates UI without full reload
- [ ] Disconnecting site clears all cached MCP data from database, not just UI state

### Actions & Execution
- [ ] High-risk action creates approval record before any MCP tool is called
- [ ] Approved action proceeds to execution; rejected action logs "cancelled" in process thread
- [ ] Agentic loop: Claude continues calling tools until it decides it's done (not limited to one tool call)
- [ ] Tool name collision during merge of WordPress + connector tools: duplicate names deduplicated before sending to Claude
- [ ] Process thread is persistent: closing and reopening the action shows the same thread
- [ ] Follow-up chat in thread runs as a continuation of the same Claude conversation context

### Playbooks
- [ ] Approval checkpoint halts playbook after the preceding step completes, before the next step starts
- [ ] Playbook resumes from the step after the checkpoint (not from the beginning)
- [ ] If one playbook step fails, subsequent steps are not executed (unless configured to continue on error)

### Automations
- [ ] Cron expression stored and next-run calculated server-side (not client-side)
- [ ] Paused automation does not execute even if cron time elapses
- [ ] Automation resume: next-run recalculated from current time (not the missed time)
- [ ] Webhook automation triggers only on verified webhook calls (not any POST to the endpoint)

### Build Modules
- [ ] Version creation freezes a snapshot of files at that moment; subsequent edits do not modify the version
- [ ] Rollback replaces current files with the selected version's snapshot
- [ ] Deploying a release writes files to WordPress sandbox via MCP
- [ ] Rollback of a release reverts WordPress sandbox files to the previous release's snapshot
- [ ] Quality gate "run" executes against the current file state, not the last saved version

### Site Scanner
- [ ] Scanner uses rule-based analysis (no AI token consumption)
- [ ] Scanner results persisted in `site_scans` collection (not just in-memory)
- [ ] 60-second scan timeout handled gracefully: partial results returned, timeout status shown

---

## Data Sync Logic

- [ ] localStorage writes happen synchronously on user action (no data loss on fast tab close)
- [ ] Backend sync uses REST API at `api.sproutos.ai` — not a local mock in production
- [ ] On network failure during save: user is notified (not silently lost)
- [ ] On reconnect: unsaved localStorage changes reconciled with backend state
- [ ] Skill.md generation reflects current project state at the time of the AI call
