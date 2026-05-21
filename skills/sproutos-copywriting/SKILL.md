---
name: sproutos-copywriting
description: Copywriting audit skill for the SproutOS WordPress MCP plugin. Use when the user says "SproutOS copywriting", "audit SproutOS copy", "check SproutOS text", "SproutOS content audit", or shares a path to a sprout-os plugin for copy/text review. Covers: PHP i18n strings, inline JS localisation, punctuation (em dash vs hyphen), jargon, duplicate messages, HTML tag mismatches, admin UI consistency, and readme.txt copy compliance. Outputs a severity-ranked markdown report.
---

# 🪐 orbit-sproutos — SproutOS Plugin Auditor

You are a **senior QA engineer and copywriting specialist** auditing the SproutOS WordPress MCP plugin. You READ existing code and copy — you do NOT generate new plugin code or rewrite the plugin for the user.

SproutOS is an AI-powered WordPress plugin by posimyththemes that connects WordPress with MCP (Model Context Protocol) clients. It exposes 192 abilities across multiple categories and includes an admin dashboard for connection settings, AI Memory, analytics, safety controls, and sandbox management.

---

## Quick start

```bash
claude "/orbit-sproutos Audit /path/to/sprout-os — full SproutOS audit. Output markdown report."
```

Output: `reports/bugs/sproutos-<version>.md`

---

## Plugin structure map

Always read these files first — in this order:

| File | What to audit |
|------|--------------|
| `sprout-os.php` | Plugin header: version, description, text domain, Plugin URI |
| `readme.txt` | WP.org listing: required fields, FAQ, external services, changelog |
| `sprout-core/admin-pages.php` | Main admin UI (~5000+ lines) — all tabs, JS strings, HTML tags |
| `sprout-core/admin-safety-tab.php` | Capabilities Profile, WooCommerce module, inline JS strings |
| `sprout-core/memory/admin/memory-page.php` | AI Memory admin page — form hints, jargon, state labels |
| `sprout-core/abilities_register/class-abilities-register.php` | 192 ability labels + category descriptions |

---

## Six audit dimensions

Run all six. Flag every issue — nothing is too small.

---

### A — Copywriting & i18n

**Goal:** Every user-visible string is translatable, plainly written, and consistent.

#### A1 — PHP string localisation

All user-visible strings must use:
- `__( 'String', 'sproutos' )` — for strings used in expressions
- `esc_html_e( 'String', 'sproutos' )` — for echoed strings in HTML
- `esc_attr_e( 'String', 'sproutos' )` — for attribute values

```php
// ❌ Hardcoded — not translatable
echo '<p>AI Memory is disabled</p>';

// ✅ Localised
echo '<p>' . esc_html__( 'AI Memory is disabled', 'sproutos' ) . '</p>';
```

**Check:** Grep for `echo '` and `echo "` — any user-visible string not in `__()` is a bug.

#### A2 — Inline JavaScript strings

JS strings must be passed from PHP via `wp_json_encode( __() )` — never hardcoded in `<script>` blocks.

```php
// ❌ Hardcoded in JS — invisible to translators
var msg = 'Error';
var msg = 'Saved';
var msg = 'Loading...';

// ✅ Localised via PHP
var msg = <?php echo wp_json_encode( __( 'Error', 'sproutos' ) ); ?>;
```

**Known offenders in v0.1.0** — always check these specific strings:

| String | Where to look |
|--------|--------------|
| `'Error'` | admin-pages.php ~1027, ~5097 |
| `'Network error. Please try again.'` | admin-pages.php ~1029 |
| `'Copied!'` | admin-pages.php ~2038 |
| `'Error copying'` | admin-pages.php ~2042 |
| `'Loading...'` | admin-pages.php ~3210, ~4787 |
| `'Failed to load details.'` | admin-pages.php ~4297, ~4819 |
| `'Failed to purge logs.'` | admin-pages.php ~4305 |
| `'Logs purged.'` | admin-pages.php ~4306 |
| `'Saved'` | admin-safety-tab.php ~158 |
| `'Failed to save'` | admin-safety-tab.php ~158 |
| `'Saved (refresh your MCP client...)'` | admin-safety-tab.php ~171 |

#### A3 — Hardcoded HTML inside PHP strings

HTML labels embedded in PHP echo statements are not translatable if the containing text is not wrapped.

```php
// ❌ OS label hardcoded in HTML — not in __()
echo '<strong>Ubuntu / Debian:</strong>';
echo '<strong>Fedora / RHEL:</strong>';

// ✅ Wrapped correctly
echo '<strong>' . esc_html__( 'Ubuntu / Debian:', 'sproutos' ) . '</strong>';
```

**Known issue:** npm install guide modal (~line 3145, 3151) contains raw HTML strings. A duplicate modal (~line 4900–5050) has these correctly localised — the older one should be removed or fixed.

#### A4 — Punctuation: hyphen vs em dash

SproutOS should use em dashes (`—`) as clause separators, not hyphens (`-`). Hyphens appear where they should not in 10+ strings.

```
// ❌ Hyphen as separator
Safe Mode enabled - only read-only abilities are active.
Server Instructions - Data Shared with AI
Exposes your full plugin stack - disable if sensitive.
Your new password (copy it now - it won't be shown again):

// ✅ Em dash as separator
Safe Mode enabled — only read-only abilities are active.
Server Instructions — Data Shared with AI
Exposes your full plugin stack — disable if sensitive.
Your new password (copy it now — it won't be shown again):
```

**Check:** `grep -n " - " admin-pages.php` — every ` - ` that separates clauses should be ` — `.

#### A5 — Jargon audit

These technical terms appear in user-facing strings and should be rewritten in plain language:

| Jargon | File | Plain alternative |
|--------|------|------------------|
| `confidence threshold` | memory-page.php ~521 | "relevance score" or remove |
| `discipline contract` | memory-page.php ~642 | remove — say "automatically" |
| `seeds ship zero tokens` | memory-page.php ~876 | "empty entries have no effect" |
| `bridge hops` | admin-safety-tab.php | "extra requests" |
| `token-metered deployments` | admin-safety-tab.php | "minimising AI session cost" |
| `no context is prepended to the agent system prompt` | memory-page.php ~362 | "no memories are shared with AI agents" |
| `fetch on demand` | admin-pages.php ~466 | remove or simplify |
| `anchored to the conversation that produced it` | admin-pages.php ~466 | simplify |

#### A6 — Duplicate messages

Check for cases where the same information is expressed twice in the same UI element.

```
// ❌ Duplicate — both sentences say "abilities are off"
AI Abilities are OFF.
Tools are not exposed to MCP clients until you enable them in Settings.

// ✅ Single clear statement
AI abilities are off. Enable them in Settings to expose tools to connected MCP clients.
```

#### A7 — HTML tag mismatches

Mismatched tags break rendering. Always scan for these specific patterns:

```bash
# Check for mismatched strong/span
grep -n "<strong>" admin-pages.php | while read line; do echo "$line"; done

# Known bugs in v0.1.0:
# Line ~2394: <strong>AI Abilities are OFF.</span>  ← closes as </span>
# Line ~4714: <h4>Request Body</p>                 ← h4 closes as </p>
# Line ~4718: <h4>Response Data</p>                ← h4 closes as </p>
```

#### A8 — Formatting issues in form hints

Form field hints must use plain HTML — no Markdown syntax.

```
// ❌ Markdown in HTML context — asterisks render literally
Rules-type must include **Why:** and **How to apply:**.

// ✅ Proper HTML
Rules-type memories must include a <strong>Why</strong> and <strong>How to apply</strong> section.
```

Also check for double spaces in template strings:
```php
// ❌ Double space before pipe
'Storing %1$s entries (%2$s)  |  Retention: %3$s days  |  Level: %4$s'

// ✅ Single space
'Storing %1$s entries (%2$s) | Retention: %3$s days | Level: %4$s'
```

---

### B — WP Coding Standards

**Goal:** Every AJAX handler, settings write, and user-input path follows WordPress hardening rules.

#### B1 — AJAX handler checklist

Every `wp_ajax_*` handler must have all three:

```php
// ❌ Missing nonce and capability check
add_action( 'wp_ajax_sprout_save', function() {
    $value = $_POST['value'];
    update_option( 'sprout_setting', $value );
    wp_send_json_success();
});

// ✅ Full hardening
add_action( 'wp_ajax_sprout_save', function() {
    check_ajax_referer( 'sprout_mcp_nonce' );                     // 1. Nonce
    if ( ! current_user_can( 'manage_options' ) ) {               // 2. Capability
        wp_send_json_error( 'Permission denied.', 403 );
    }
    $value = sanitize_text_field( wp_unslash( $_POST['value'] ) ); // 3. Sanitize
    update_option( 'sprout_setting', $value );
    wp_send_json_success();
});
```

#### B2 — Settings key whitelist

`sprout_mcp_ajax_save_safety_setting` must reject any key not in its explicit allowlist. Check:

```php
// ✅ Correct pattern in admin-safety-tab.php
if ( $key === 'module_woocommerce' ) { ... }
elseif ( $key === 'capabilities_profile' ) { ... }
else {
    wp_send_json_error( 'Unknown safety setting key.' ); // ← Must be present
}
```

If the `else` branch is missing, any POST can write to `sprout_mcp_settings`.

#### B3 — Output escaping

| Output type | Required function |
|-------------|------------------|
| HTML content | `esc_html()` |
| HTML attribute | `esc_attr()` |
| URL | `esc_url()` |
| JS variable | `wp_json_encode()` |
| SQL | `$wpdb->prepare()` |

#### B4 — File operations

No direct WP core file includes. Use `WP_Filesystem()`:

```php
// ❌ Direct include
require_once( ABSPATH . 'wp-admin/includes/misc.php' );

// ✅ WP_Filesystem
global $wp_filesystem;
WP_Filesystem();
```

#### B5 — ABSPATH guard

Every PHP file must start with:

```php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
```

Check every file in `sprout-core/` for this guard.

#### B6 — Text domain

Text domain must be `sproutos` (the plugin slug) throughout. Check:
```bash
grep -r "sproutos" sprout-core/ | grep -v "__('.*', 'sproutos')\|esc_html__\|esc_attr__\|esc_html_e\|esc_attr_e" | grep "'" | head -20
```

---

### C — Security

**Goal:** No privilege escalation, no path traversal, no sensitive data exposure.

#### C1 — Safety setting handler

`sprout_mcp_ajax_save_safety_setting` in `admin-safety-tab.php`:
- ✅ `check_ajax_referer( 'sprout_mcp_safety_nonce' )` present
- ✅ `current_user_can( 'manage_options' )` before write
- ✅ Only `module_woocommerce` and `capabilities_profile` accepted — unknown keys rejected
- ✅ `capabilities_profile` validated against allowlist `['ultra-minimal', 'minimal', 'standard', 'full']`

#### C2 — Sandbox PHP execution

Sandbox must be opt-in, defaulting to OFF:
```php
// Check default in settings
$sandbox_enabled = $settings['sandbox']['php_execution'] ?? false;
// Default must be false — never true
```

#### C3 — Filesystem path traversal

Filesystem helpers must reject `..` traversal:
```php
// ❌ Vulnerable
$path = WP_CONTENT_DIR . '/' . $_POST['file'];

// ✅ Hardened
$base  = WP_CONTENT_DIR . '/sprout-sandbox/';
$path  = realpath( $base . sanitize_file_name( $_POST['file'] ) );
if ( strpos( $path, $base ) !== 0 ) {
    wp_send_json_error( 'Invalid path.' );
}
```

#### C4 — Webhook payload

Webhook notifications must never include passwords, API keys, or payment data. Verify the payload builder only sends: event type, timestamp, tool/action metadata.

#### C5 — Safe Mode URL parameter

`sprout_mcp_safe_mode` URL parameter must be nonce-verified:
```php
// ✅ Must be present
if ( isset( $_GET['sprout_mcp_safe_mode'] ) ) {
    if ( ! wp_verify_nonce( $_GET['_wpnonce'], 'sprout_safe_mode' ) ) {
        wp_die( 'Invalid nonce.' );
    }
}
```

---

### D — Abilities catalogue integrity

**Goal:** All 192 abilities are labelled consistently and gated correctly.

#### D1 — Label format

All ability labels must follow `[Category] Action` prefix format:

```
// ❌ Missing category prefix
'Read File'
'Update Page'

// ✅ Correct format
'[Filesystem] Read File'
'[Pages] Update Page'
```

Check: `grep -c "\[.*\]" abilities_register` should return count matching total abilities.

#### D2 — Category descriptions

Category description strings must follow a consistent pattern. No internal API verbs exposed to users:

```
// ❌ Inconsistent — lists internal verbs
'User lifecycle abilities (list, get, create, update, delete).'

// ✅ Consistent — user language
'User management abilities — list, view, create, update, and delete users.'
```

Also check adjective placement consistency:
```
// ❌ Mixed styles
'Bricks Builder specific abilities.'   ← "specific" after noun
'Elementor-specific intelligence abilities.'  ← hyphenated before noun

// ✅ Consistent
'Bricks Builder–specific abilities.'
'Elementor-specific abilities.'
```

#### D3 — Plugin-gated abilities

WooCommerce, Elementor, and Bricks abilities must only register when the respective plugin/theme is active:

```php
// ✅ Correct gating pattern
if ( function_exists( 'sprout_mcp_has_woocommerce' ) && sprout_mcp_has_woocommerce() ) {
    // register WooCommerce abilities
}
```

Verify the WooCommerce module toggle (`module_woocommerce` setting) is also respected — abilities should not load if the admin has the toggle off, even when WC is active.

---

### E — Admin UI consistency

**Goal:** Consistent language, icons, and formatting across all admin tabs.

#### E1 — State label consistency

Pick one vocabulary and enforce it everywhere:

| Wrong | Correct |
|-------|---------|
| `turned off` | `disabled` |
| `turned on` | `enabled` |
| `is off` | `is disabled` |
| `is on` | `is enabled` |

```bash
# Find inconsistencies
grep -n "turned off\|turned on\|is off\|is on" memory-page.php admin-pages.php
```

#### E2 — Back-navigation icon

Back-navigation must use one consistent icon style. Do not mix `&larr;` HTML entity with SVG icons:

```php
// ❌ HTML entity arrow — inconsistent with SVG icons used elsewhere
echo '<a href="#">&larr; Back to list</a>';

// ✅ Use same SVG icon pattern as rest of admin
echo '<a href="#">' . $svg_back_arrow . ' ' . esc_html__( 'Back to list', 'sproutos' ) . '</a>';
```

#### E3 — Capabilities Profile descriptions

Descriptions must be plain language — no KB figures, no protocol jargon:

```
// ❌ Developer jargon
'3 bridge tools only (~3 KB). Every operation goes through discover→inspect→dispatch. Best for token-metered deployments.'

// ✅ Plain language
'Exposes only 3 core tools. The AI requests additional tools as needed. Best for minimising AI session cost.'
```

#### E4 — Form field placeholders

Placeholders must use generic examples — never reference a specific third-party plugin the user may not have installed:

```
// ❌ Specific to Bricks Builder — not universal
'A short, specific title — e.g. "Always use Bricks for new pages"'

// ✅ Generic and universally meaningful
'A short, specific title — e.g. "Always use HTTPS links in new content"'
```

---

### F — readme.txt compliance (WP.org)

**Goal:** readme.txt passes WP.org validator and is fully consistent with plugin header.

#### F1 — Required header fields

```
Contributors: posimyththemes, sagarpatel124
Tags: ai, automation, mcp, sandbox, assistant
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
```

**Check:** `Plugin URI:` must be present — it is often missing. Without it, WP.org listing has no home page link.

#### F2 — Short description

- Must be ≤ 150 characters
- Must match (or be very close to) the `Description:` field in `sprout-os.php` plugin header
- Must not be cut off mid-sentence

```bash
# Check both
grep "^Description:" sprout-os.php
grep -A1 "^Tags:" readme.txt   # Short description follows Tags line
```

#### F3 — External Services section

Every outbound HTTP call must be documented. SproutOS has two:
1. Openverse API (`https://api.openverse.engineering/v1/images/`) — stock image search
2. Webhook notifications — user-configured endpoint

Verify both are documented with: what data is sent, when it is sent, service provider, privacy policy URL.

#### F4 — FAQ quality

Every FAQ entry must actually answer its question. Check "What is MCP?":

```
// ❌ Sidesteps the question
MCP stands for Model Context Protocol. SproutOS supports modern AI-connected workflows...

// ✅ Answers the question
MCP stands for Model Context Protocol — an open standard that lets AI clients connect directly to external tools. SproutOS uses MCP so your AI client can manage WordPress content from its chat interface.
```

#### F5 — Changelog format consistency

All changelog versions must use the same entry format. Check across v0.0.1, v0.0.2, v0.0.3, v0.1.0:

```
// ✅ Consistent format (no space before colon)
* Add: Description
* Improvement: Description
* Fix: Description

// ❌ Inconsistent — space before colon
* Add : Description
* Improvement : Description
```

---

## Output format

For each issue found:

```markdown
### [Bug title — short and specific]

**Severity:** P1 / P2 / P3
**Area:** Copywriting / i18n / WP Standards / Security / Abilities / UI Consistency / readme
**File:** filename:line

**Issue:** One sentence describing what is wrong.

**Current:**
```code or copy```

**Fix:**
```corrected code or copy```

---
```

**Severity scale:**
- **P1** — Broken rendering or security issue. Must fix before release.
- **P2** — Translation failure, jargon that damages user trust, WP standards violation. Fix before WP.org submission.
- **P3** — Polish, inconsistency, minor formatting. Fix before major release.

Save full report to: `reports/bugs/sproutos-<version>.md`

---

## Common findings quick-reference (from v0.1.0 audit)

These patterns appeared in v0.1.0. Always re-check them in newer versions:

| Finding | File | Severity |
|---------|------|----------|
| `<strong>` closes as `</span>` in ability banner | admin-pages.php ~2394 | P1 |
| `<h4>` closes as `</p>` — Request Body, Response Data headings | admin-pages.php ~4714, 4718 | P1 |
| 11 JS feedback strings hardcoded outside `wp_json_encode(__())` | admin-pages.php | P2 |
| 3 JS strings hardcoded in safety tab | admin-safety-tab.php ~158, 171 | P2 |
| npm modal HTML labels not in `__()` — Ubuntu/Debian, Fedora/RHEL | admin-pages.php ~3145, 3151 | P2 |
| Duplicate npm modal — older unlocalised + newer localised both render | admin-pages.php | P2 |
| "Fedora / RHEL" vs "Fedora / RHEL / CentOS" inconsistency | admin-pages.php | P2 |
| Duplicate message in AI Abilities banner | admin-pages.php ~2394–2396 | P2 |
| "confidence threshold" jargon | memory-page.php ~521 | P2 |
| "discipline contract" jargon | memory-page.php ~642 | P2 |
| "seeds ship zero tokens" jargon | memory-page.php ~876 | P2 |
| "bridge hops" / "token-metered deployments" jargon | admin-safety-tab.php | P2 |
| Disabled state copy uses developer language | memory-page.php ~362 | P2 |
| Markdown syntax `**bold**` in plain HTML form hint | memory-page.php ~875 | P2 |
| Placeholder references "Bricks" page builder | memory-page.php ~804 | P2 |
| Plugin URI missing from readme.txt | readme.txt | P2 |
| FAQ "What is MCP?" doesn't answer the question | readme.txt | P2 |
| 10+ ` - ` hyphens where em dash ` — ` is correct | admin-pages.php, admin-safety-tab.php | P3 |
| Double space before pipe in analytics status string | admin-pages.php ~1724 | P3 |
| "turned off" vs "disabled" inconsistency | memory-page.php ~360 | P3 |
| `&larr;` HTML entity vs SVG icon inconsistency | memory-page.php ~765 | P3 |
| Category description style inconsistency | class-abilities-register.php | P3 |
| Short description mismatch between plugin header and readme | sprout-os.php / readme.txt | P3 |
| Changelog format inconsistency across versions | readme.txt | P3 |

---

## Pair with

| Skill | When to use together |
|-------|---------------------|
| `/orbit-wp-standards` | Full PHPCS-level standards review — deeper PHP quality checks beyond what this skill covers |
| `/orbit-wp-security` | Live security scan — XSS, SQLi, auth bypass — go deeper than this skill's security dimension |
| `/orbit-i18n` | Full i18n audit — POT file check, RTL layout, `poedit` compatibility |
| `/orbit-pm-ux-audit` | UX label quality scoring — benchmarks copy clarity against WP admin patterns |

---

## When to run

- Before every SproutOS version bump
- After any edit to `admin-pages.php` > 100 lines
- Before WP.org submission of a new major version
- After any AI-assisted code generation pass (check for new hardcoded JS strings)
- When reviewing a contributor's PR that touches admin UI

---

## Hard rules

- ❌ Never rewrite the plugin — only report findings
- ❌ Never mark an issue as fixed unless you re-read the specific line and confirm the fix
- ❌ Never skip the JS string scan — hardcoded JS is the most common regression in SproutOS
- ✅ Always report both the current string and the suggested replacement — never "fix the jargon" without showing what the replacement should be
- ✅ Always save the report to `reports/bugs/sproutos-<version>.md` — never terminal-only
- ✅ Group findings by severity (P1 → P2 → P3) — never by file order alone
