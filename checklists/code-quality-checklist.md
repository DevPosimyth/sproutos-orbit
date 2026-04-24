# Sprout OS — Code Quality Checklist

> Review these items before merging any PR or cutting a release. Focus on correctness, maintainability, security hygiene, and consistency with the existing codebase.

---

## 1. TypeScript / JavaScript

- [ ] No `@ts-ignore` or `@ts-expect-error` without an explanation comment
- [ ] No `any` types used for new code (use proper types or `unknown` + narrowing)
- [ ] No implicit `any` from missing type annotations on function parameters
- [ ] No `console.log` / `console.warn` / `console.error` left in committed code
- [ ] No `debugger` statements
- [ ] No commented-out code blocks (delete instead of comment out)
- [ ] No TODO/FIXME comments without a linked issue or ticket
- [ ] Variables and functions named clearly — no single-letter names outside of loop indices
- [ ] No magic numbers — constants extracted with descriptive names
- [ ] No deeply nested callbacks (max 3 levels; use `async/await` or helper functions)
- [ ] No duplicate logic repeated across 3+ components (extract to a shared utility)

---

## 2. React Components

- [ ] Components have a single responsibility (not doing data-fetch + render + business logic all in one)
- [ ] No prop drilling beyond 2 levels (use Context or Zustand for shared state)
- [ ] Props destructured at the function signature (not accessed as `props.x`)
- [ ] `key` prop on every list item uses a stable, unique ID (not the array index)
- [ ] `useEffect` dependencies array is complete and correct (no missing deps, no over-specified deps)
- [ ] `useEffect` cleanup function provided for: intervals, timeouts, event listeners, SSE connections, iframes
- [ ] No stale closure bugs in event handlers inside `useEffect`
- [ ] `useMemo` / `useCallback` used for expensive computations and stable references — not overused on trivial values
- [ ] Component files ≤ 300 lines; logic split into custom hooks if larger
- [ ] No inline arrow function components defined inside JSX renders (define outside)
- [ ] No anonymous default exports (named exports make refactoring and debugging easier)

---

## 3. Next.js (App Router)

- [ ] Server Components used for data-fetching where possible (not forcing client-side fetch unnecessarily)
- [ ] `"use client"` directive added only where client-side hooks or interactivity is needed
- [ ] `loading.tsx` and `error.tsx` provided for route segments with async data
- [ ] `not-found.tsx` returns a helpful 404 message (not a blank page)
- [ ] Dynamic routes use `generateStaticParams` where pre-rendering is possible
- [ ] `next/image` used for all images (not raw `<img>`) — enforces optimization
- [ ] `next/link` used for all internal navigation (not raw `<a>`)
- [ ] API routes return correct HTTP status codes (200/201/400/401/403/404/500)
- [ ] API routes do not expose internal server paths or stack traces in error responses
- [ ] `NEXT_PUBLIC_` prefix only on env vars that are safe to expose to the browser

---

## 4. State Management (Zustand / Context)

- [ ] Zustand stores have a clear, focused scope (not one mega-store for all app state)
- [ ] Store actions defined inside the store (not as standalone functions that mutate state externally)
- [ ] No direct state mutation — always use the store's setter or `immer` produce
- [ ] Context providers placed at the correct level (not wrapping the entire app for local state)
- [ ] No state duplication between localStorage and Zustand that can fall out of sync
- [ ] Zustand devtools middleware enabled in development for debuggability

---

## 5. API Layer (Axios / Fetch)

- [ ] All API calls go through the centralized Axios instance (not raw `fetch` scattered in components)
- [ ] Auth token attached via request interceptor (not copy-pasted into each call)
- [ ] Token refresh / 401 handling in response interceptor
- [ ] All API error responses handled — no silent `catch(() => {})` that swallows errors
- [ ] Loading and error states managed for every async operation
- [ ] No hardcoded `api.sproutos.ai` URLs in component files (use env variable or config constant)
- [ ] No sensitive data (passwords, tokens) logged in API interceptors
- [ ] API response types defined with TypeScript interfaces

---

## 6. Data Persistence (localStorage + Backend Sync)

- [ ] localStorage keys namespaced per project (e.g., `sproutos_project_{id}_sitemap`) to avoid collisions
- [ ] No raw JSON.parse without try/catch (corrupted localStorage will not crash the app)
- [ ] localStorage writes debounced for high-frequency updates (e.g., saturation slider, text editing)
- [ ] Sync to backend happens on user action (save) and/or debounced — not on every keypress
- [ ] On backend sync failure: error surfaced to user, not silently lost
- [ ] Sensitive data (credentials, tokens) never written to localStorage

---

## 7. Security in Code

- [ ] No secrets, API keys, or credentials in source code or git history
- [ ] `.env` in `.gitignore`; `.env.example` has placeholder values only
- [ ] User-supplied URLs (crawl, reference sites) validated before use (no SSRF risk)
- [ ] File uploads validated: file type checked (magic bytes, not just extension) + size limit enforced
- [ ] No `dangerouslySetInnerHTML` with unsanitized user input (use DOMPurify if HTML rendering is needed)
- [ ] MongoDB queries use parameterized fields (Mongoose schema enforces types — no raw string concat)
- [ ] Application Passwords for Manage Mode stored encrypted (not plaintext) in MongoDB
- [ ] AI prompt construction: user input not injected directly as a system prompt (use template with placeholders)

---

## 8. Performance in Code

- [ ] No `document.querySelector` or direct DOM access inside React render cycles
- [ ] Google Fonts list virtualized (not 1000+ DOM nodes rendered at once)
- [ ] Design editor canvas: sections outside viewport not rendered (virtual scroll or intersection observer)
- [ ] Image picker stock image grid: virtualized or paginated (not all images loaded at once)
- [ ] Heavy libraries (GSAP, Framer Motion) imported only where used (not bundled globally)
- [ ] `React.lazy` + `Suspense` used for heavy route components (editor, manage mode)
- [ ] No `setInterval` without corresponding `clearInterval` in cleanup
- [ ] ResizeObserver disconnected in cleanup functions (not left attached after component unmount)

---

## 9. Error Handling

- [ ] All `async/await` calls wrapped in `try/catch` or handled with `.catch()`
- [ ] Error boundaries (`<ErrorBoundary>`) wrapping the design editor, sitemap editor, and manage mode
- [ ] User-facing error messages are human-readable (not raw error codes or stack traces)
- [ ] 404 responses from API result in a clear UI message, not an empty/broken page
- [ ] Network timeout errors handled gracefully (not spinning indefinitely)
- [ ] AI streaming errors (SSE disconnect) handled with a retry or error message

---

## 10. Manage Mode — MCP Code Quality

- [ ] `WPMcpClient` and `StdioMcpClient` use proper cleanup on connection close
- [ ] JSON-RPC responses parsed safely (no raw `JSON.parse` without try/catch)
- [ ] Retry logic limited to appropriate status codes (405, 502, 503, 504) — not all errors
- [ ] Agentic tool-calling loop has a maximum iteration limit (prevent infinite Claude loops)
- [ ] Skill.md content sanitized before inclusion in Claude system prompt
- [ ] MCP tool name deduplication runs before every Claude call (not assumed to be pre-deduplicated)
- [ ] Process thread stored in MongoDB before execution starts (not after, to survive crashes)
- [ ] Credentials never logged in MCP client code (even in debug logs)

---

## 11. Testing & Testability

- [ ] Pure business logic (color conversion, token calculation, plan gating) extracted to utility functions that can be unit tested without a browser
- [ ] API route handlers separated from business logic (handlers are thin; logic in service layer)
- [ ] No hardcoded test data in production code paths
- [ ] Feature flags or environment checks (`process.env.NODE_ENV === 'test'`) not used to bypass real logic in tests

---

## 12. Code Style & Consistency

- [ ] ESLint passes with 0 errors (warnings reviewed and addressed or documented)
- [ ] Prettier formatting applied (no manual formatting inconsistencies)
- [ ] File names: kebab-case for components (`design-editor.tsx`), PascalCase for component names (`DesignEditor`)
- [ ] Import order: external packages first, then internal (enforced by lint rule or reviewed manually)
- [ ] No relative imports crossing module boundaries (e.g., `../../../../lib/utils` — use path aliases)
- [ ] CSS/Tailwind: no inline styles for design logic (use Tailwind classes or CSS variables)
- [ ] Tailwind classes not duplicated in logic (extract to component variants using `cva` or `clsx`)

---

## 13. Documentation in Code

- [ ] Complex algorithms (color clustering, token deduction, MCP tool merge) have a one-line explanation comment
- [ ] Non-obvious side effects documented inline (e.g., why a specific `useEffect` dependency is excluded)
- [ ] Public API route handlers have a JSDoc comment with `@param` and `@returns`
- [ ] No redundant comments explaining what obvious code does (`// increment i by 1`)

---

## 14. Dependency Management

- [ ] `npm audit` — 0 critical/high vulnerabilities
- [ ] No unused packages in `package.json` (run `depcheck` or equivalent)
- [ ] No duplicate packages at different versions in `node_modules` (check `npm ls`)
- [ ] Peer dependency warnings resolved
- [ ] `package-lock.json` committed and up-to-date
- [ ] No `*` version ranges in `dependencies` (use exact or `^` with a locked lockfile)

---

## 15. Git & PR Quality

- [ ] PR description explains what and why (not just what)
- [ ] No single commit containing unrelated changes
- [ ] No merge commits from main into feature branch (rebase preferred)
- [ ] No secrets in git history (`git log -p | grep -iE 'api_key|password|secret|token'` clean)
- [ ] Branch deleted after merge
- [ ] PR linked to a ticket/issue in ClickUp or the tracker
