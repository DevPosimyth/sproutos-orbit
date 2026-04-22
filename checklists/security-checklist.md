# Sprout OS — Security Checklist

## HTTP Security Headers

- [ ] `Strict-Transport-Security` — `max-age >= 31536000; includeSubDomains`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` **or** CSP `frame-ancestors 'none'`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` (or stricter)
- [ ] `Content-Security-Policy` set and not `unsafe-inline` on scripts
- [ ] `Permissions-Policy` restricts geolocation, camera, mic

## Transport

- [ ] HTTP → HTTPS redirect returns 301/308
- [ ] TLS 1.2+ only (no TLS 1.0 / 1.1)
- [ ] Valid certificate, not near expiry
- [ ] `www` and apex both resolve correctly

## Version / Platform Leakage

- [ ] `Server` header does not expose version number
- [ ] `X-Powered-By` absent or generic
- [ ] No debug / error stack traces in production responses

## Authentication

- [ ] Rate limiting on `/login`, `/signup`, `/forgot-password`
- [ ] Brute-force lockout or CAPTCHA after N failures
- [ ] Passwords hashed with bcrypt / argon2 (never MD5 / SHA-1)
- [ ] Password reset tokens single-use and time-limited
- [ ] OAuth state parameter verified (CSRF protection)
- [ ] Session cookies `HttpOnly; Secure; SameSite=Lax` or stricter
- [ ] Session expiry enforced server-side

## Authorization

- [ ] Unauthenticated users cannot access `/dashboard`, `/settings`, `/api/*`
- [ ] Tenant A cannot read / modify Tenant B data (IDOR checks)
- [ ] Admin routes require admin role server-side (not just hidden in UI)

## Input Handling

- [ ] All user input validated server-side
- [ ] SQL queries parameterized — no string concatenation
- [ ] XSS: user-generated content escaped on output
- [ ] File uploads: type + size + content validated; stored outside web root
- [ ] JSON APIs check `Content-Type: application/json`

## Secrets & Config

- [ ] No secrets in git history (`git log -p | grep -iE 'api_key|password|token'` clean)
- [ ] `.env` in `.gitignore`
- [ ] Production secrets in vault / secret manager — not in repo
- [ ] Webhooks signed / verified

## Dependencies

- [ ] `npm audit` — 0 critical / high vulnerabilities
- [ ] Dependabot / Renovate enabled
- [ ] Third-party scripts (analytics, chat widgets) reviewed quarterly

## Monitoring

- [ ] Failed login attempts logged
- [ ] Unusual traffic patterns trigger alerts
- [ ] Error tracking (Sentry / similar) scrubs PII
