# CHANGAYEES — APPLICATION AUDIT & IMPROVEMENTS

Version: 1.0
Date: 2026-06-11
Scope: UX · UI · Mobile · Accessibility · Performance · Security · Scalability · SEO

> Findings + the fixes **applied in this pass**. ✅ = applied, 📌 = recommended next.

---

## Security

**Findings**
- Public POST endpoints (RFQ, inquiry, catalog download, track verify, analytics
  beacon) had no abuse protection — spam, lead-quality, and tracking-ID
  brute-force risk (M-10).
- No HTTP security headers (clickjacking, MIME-sniffing, referrer leakage).

**Applied**
- ✅ **Rate limiting** (`lib/rate-limit.ts`) on all public POST endpoints:
  RFQ 5/min, inquiry 8/min, catalog 10/min, track 10/min, analytics beacon
  120/min (silently dropped). Sliding-window, per-IP.
- ✅ **Security headers** (`next.config.mjs`): `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`,
  HSTS, and a pragmatic **Content-Security-Policy** (frame-ancestors none,
  scoped img/connect/font/script sources).
- Already in place: httpOnly + `SameSite=lax` auth cookies (CSRF-mitigating),
  RBAC guards, audit logging, hashed reset/refresh tokens, opaque tracking tokens.

**Next**
- 📌 Swap the in-memory limiter for **Upstash Redis** (cross-instance on Vercel).
- 📌 Add a captcha/honeypot on the highest-value forms (RFQ, catalog).
- 📌 Tighten CSP with per-request nonces.

---

## Performance

**Findings**
- The homepage (dynamic) read CMS settings from the DB on **every request**
  (Hero + Footer), adding latency and DB load per view.

**Applied**
- ✅ **Cached settings** (`unstable_cache`, 5-min revalidate, tag-invalidated on
  save) — settings are read once per window, not per render. CMS edits still
  appear immediately via `revalidateTag('settings')`.
- Already in place: SSG/ISR for content, `next/image` (AVIF/WebP) for product
  images, self-hosted Inter font, `optimizePackageImports` for lucide/framer.

---

## Scalability

**Findings**
- `analytics_events` grows quickly (every product view / WhatsApp click); the
  report queries filter by `event_name` + `created_at`.

**Applied**
- ✅ **Composite index** `analytics_events(event_name, created_at)` (migration
  `20260611000200`) — keeps the analytics overview + top-products queries fast.
- Already in place: composite indexes on leads/orders, append-only history,
  batched name resolution (no N+1), Prisma client singleton.

**Next**
- 📌 Monthly **partitioning + retention** for `analytics_events` and the
  append-only notification/audit logs at volume.
- 📌 Use Neon's **pooled** connection string for `DATABASE_URL` in production.

---

## Accessibility

**Findings**
- No skip-to-content link for keyboard users.
- The Drawer (modal dialog) didn't manage focus.

**Applied**
- ✅ **Skip-to-content** link + labelled `<main id="main-content">` landmark in
  the public layout.
- ✅ **Drawer focus management** — moves focus into the dialog on open, restores
  it to the trigger on close, `aria-label` from the title.
- Already in place: WCAG-tuned focus rings, `prefers-reduced-motion`, ARIA
  labels on icon buttons, semantic headings, the automated **axe** test suite.

**Next**
- 📌 Full focus-trap inside open dialogs; an automated axe pass over full pages
  (Playwright + axe) in addition to the component-level checks.

---

## SEO

**Findings**
- Strong already (metadata, OG/Twitter, JSON-LD, sitemap, robots, canonical).
- No web app manifest.

**Applied**
- ✅ **Web app manifest** (`app/manifest.ts`) — name, theme colour, standalone
  display, icons.
- Already in place: canonical URLs (filters canonicalize to the base path),
  Organization/WebSite/Product/Breadcrumb/Article JSON-LD, DB-driven sitemap
  (degrades to static when the DB is down), robots, per-entity OG images.

**Next**
- 📌 A proper **1200×630 branded OG image** (or dynamic `next/og`) — currently
  the logo is the default.

---

## Mobile Experience

**Findings**
- App-like shell already solid (bottom nav, sticky CTA, search sheet, safe
  areas, momentum scroll).

**Applied**
- ✅ **Installable PWA** via the manifest (standalone display, theme colour) —
  reinforces the "native app" goal.

**Next**
- 📌 Service worker for an offline shell + proper maskable 192/512 icons.

---

## UX & Resilience

**Findings**
- A server error showed the raw, opaque platform 500 (the exact issue seen
  during first deploy) — no friendly recovery.
- A transient settings-read failure could 500 the whole marketing site.

**Applied**
- ✅ **Error boundaries** — `app/error.tsx` (recoverable, branded, "Try again")
  and `app/global-error.tsx` (root fallback).
- ✅ **Resilient settings read** — `getResolvedSettings` degrades to built-in
  defaults if the DB is unreachable, so public pages render regardless.
- Already in place: skeletons/empty/error states, success confirmations,
  remembered lead details (one-tap repeat downloads).

---

## UI

**Findings**
- Design system is consistent (valued tokens, typography scale, elevation,
  status colours, light/dark).

**Applied**
- No code changes needed.

**Next**
- 📌 Replace the low-resolution `logo/images.png` with an **SVG brand kit**
  (+ favicon/OG/maskable variants) — the one outstanding brand-asset gap from
  the original review (R-01/M-02).

---

## Verification

`typecheck` ✅ · `lint` ✅ · `vitest` (70 tests) ✅ · `build` ✅ (0 errors).
New migration `20260611000200_analytics_composite_index` applies on next deploy.
