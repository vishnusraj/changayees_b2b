# CHANGAYEES — EXECUTION PLAN

Version: 1.0
Status: **Pre-Build Review — Awaiting Approval**
Author: Engineering / Product Review
Date: 2026-06-10
Source documents reviewed (12): PRD v3, UX Strategy, System Architecture, Design System, Screens, UX Specification, Database Schema, API Specification, Component Library, Build Roadmap, Figma Blueprint, Claude Build Instructions
Brand asset reviewed: `/public/logo/images.png`

> **No code has been written.** This document is the analysis + plan requested. It is intended to be read, corrected, and approved before any implementation begins. Findings carry IDs (e.g. `C-01`, `R-03`) so we can track resolution.

---

## 0. EXECUTIVE SUMMARY

The documentation set is unusually complete for vision, IA, screens, and surface-level API/DB shape. It is **internally consistent on the big strokes** (not ecommerce; RFQ replaces cart; WhatsApp-first; no customer accounts; admin RBAC; order tracking with timeline). The product is buildable.

However, it is **not yet buildable without decisions**. The gaps cluster in five places:

1. **Design tokens are named but never valued** — no hex colors, no type scale, no radius/shadow numbers. Two of the named colors (primary blue / dark navy) don't match the actual logo. Building UI now would mean inventing the brand and reworking later.
2. **The WhatsApp notification engine** — the single most-emphasised feature — collides with how the Meta WhatsApp Business API actually works (template pre-approval, opt-in consent, 24-hour session window) and with a Vercel serverless deployment (no long-lived workers for queues, retries, weekly cron).
3. **Three documents describe three different notification trigger lists**, and the API exposes a per-update "send notification" toggle that contradicts "every update auto-notifies, no manual intervention."
4. **The data model lags the UX**: RFQ collects structured products + location + student/staff counts + attachments that the `rfqs` table and `/rfqs` API can't store. "Bulk Order" exists as screens with no table, no API, no defined relationship to RFQ.
5. **The 8-week (8×1-week sprint) roadmap is not realistic** for ~85 screens across two distinct design languages (enterprise desktop + native-style mobile) plus full RBAC CMS, order tracking, and WhatsApp automation.

**Recommendation:** Hold a short decision session to close the ~20 blocking items in §7, lock design tokens and the WhatsApp architecture first, re-baseline the timeline, then build in the phased plan in §8.

---

## 1. CONTRADICTIONS

Severity: 🔴 blocking · 🟠 significant · 🟡 minor

### Notifications

- **C-01 🔴 "Every status update notifies" vs. per-update toggle vs. partial trigger lists.**
  PRD ("Every status update must trigger a WhatsApp notification. No manual intervention required.") and Claude Build Instructions ("Every Order Status Update → Automatically Trigger Notification") say *all* updates auto-notify. But `API /orders/{id}/status` accepts `sendNotification: true/false`, and the UX Update-Status screen has a "Notification Toggle" — i.e. notifications are *optional per update*. Decide: automatic-always, or admin-controlled.

- **C-02 🟠 Three different trigger lists.**
  The 15-stage workflow (PRD/DB) ≠ PRD "Triggers" list (adds Delay Alerts, Customer Notes Added, Weekly Summary; drops Inquiry Received, Quotation Sent/Approved, Cutting Completed, Stitching Completed, Closed) ≠ System Architecture "Supported Events" (same as PRD triggers but **drops Customer Notes Added**). We need one canonical map of {status → does it notify? which template?}.

### RFQ / Bulk Order

- **C-03 🔴 RFQ UX fields exceed the data model and API contract.**
  UX collects: Institution Name, Contact Person, Email, Phone, **Location**, **selected Products**, Custom Requirements, Estimated Quantity, **Student Count**, **Staff Count**, **Expected Delivery**, **Attachments**. The `rfqs` table has: organization, contact_person, phone, email, industry_id, requirements (free text), expected_quantity, expected_delivery. Missing: location, student/staff counts, and any structured product selection (no `rfq_items`). The `POST /rfqs` body is even thinner (no products, no attachments, no location, no industry, no delivery, no counts). These three must be reconciled.

- **C-04 🔴 "Bulk Order System" has screens but no model, no API, no defined relation to RFQ.**
  PRD has a distinct Bulk Order System; Screens 32–33 are Bulk Order Wizard + Success; System Architecture files "Bulk Order Wizard" under the RFQ module. There is no `bulk_orders` table and no `/bulk-orders` endpoints. Decide: Bulk Order = a variant/preset of RFQ (recommended — reuse `rfqs`), or a separate entity (needs full model + API + screens).

- **C-05 🟡 RFQ step count varies (6 vs 5+success).**
  PRD/UX-Strategy/UX-Spec say 6 steps; Screens and Figma show 4–5 input steps + a Success screen ("Submit" is the action on Review, not a screen). Cosmetic, but lock it so the progress indicator is right.

### Brand / Design

- **C-06 🔴 Stated palette ≠ actual logo.**
  Design System: primary = "logo blue," secondary = "dark navy." The supplied logo has **blue + teal-green + magenta** figures and a **black wordmark with teal shadow** — there is no navy. Separately, "Order Tracking Colors" introduce a 5-hue status system (blue/orange/purple/teal/green). The real palette is multi-color, not blue+navy. Resolve the canonical brand palette before any UI.

- **C-07 🟠 No design-token *values* anywhere.**
  Colors (neutral 50–900, semantic, status), type scale (H1–Caption / mobile), radius (S/M/L/XL/2XL), shadows (L1–L4), spacing labels — all are *named*, none are *valued*. Code needs hex/px/rem. Currently underspecified to the point of being a contradiction with "use design tokens."

- **C-08 🟡 Storage and hosting are "either/or."**
  PRD: storage "AWS S3 / Cloudinary," hosting "Vercel / AWS." Architecture/Claude pick S3 + Vercel. Pick one of each and delete the alternative.

### Email

- **C-09 🟠 Email is both in-scope (schema + API) and Phase 2 (roadmap).**
  `email_notifications` table and `/notifications/email` + `/settings/email` exist now, but PRD Future Roadmap puts "Email Automation" in Phase 2. Note that **password reset email is mandatory in MVP** regardless (see `M-04`). Clarify MVP email scope.

### Tracking / Identity

- **C-10 🔴 Shareable deep-link vs. phone-verified access.**
  Customer "receives a tracking link via WhatsApp" implying the link opens the order directly (Architecture marks Tracking as SSR). But UX Track-Order-Search **requires Order ID + Phone**, and the API has `POST /track/verify`. If the WhatsApp link renders the order directly it bypasses phone verification; if it requires phone, the "tap link to view" flow breaks. Also there are **three identifiers** (`order_number`, `tracking_id`, `tracking_links.tracking_token`) and the example `CHG-SCH-2026-00124` is human-readable/enumerable. Decide the exact access model (recommendation in `M-09`).

### Architecture / Stack

- **C-11 🔴 "Backend: Node.js" (separate) vs. Next.js API routes (monolith on Vercel).**
  Deployment lists Frontend→Vercel and Backend→Node.js as if separate, but the API architecture nests endpoints under Next.js `/api`. These imply different topologies (and different answers for queues/cron). Decide: single Next.js app (route handlers) or Next.js + separate Node service.

- **C-12 🟠 Roles are consistent (good) — note for the record.**
  PRD, Architecture, and the API Role Matrix all list the same 6 roles. No contradiction; flagged only because role→permission *mapping at the permission level* is not defined (see `M-06`).

---

## 2. MISSING REQUIREMENTS

- **M-01 🔴 Design token values** — full color hex set (brand, neutral 50–900, semantic, 5 status hues, dark-mode set if in scope), type scale (family confirmed = Inter; sizes/line-heights/weights for each role), spacing px map, radius px map, shadow definitions. Blocks all UI.
- **M-02 🔴 Brand asset kit** — vector (SVG) logo, monochrome and reversed/dark variants, favicon set, app icons, default Open Graph image. Current asset is a single low-res PNG (see `R-01`).
- **M-03 🔴 WhatsApp delivery spec** — exact template copy per trigger, template categories (utility/marketing), variable mapping, **opt-in consent capture** at RFQ/order creation, handling of the 24-hour session window, sender number, and the BSP/Cloud-API path. Blocks the headline feature.
- **M-04 🟠 Transactional email** — provider (SES/SendGrid/Resend), and at minimum password-reset + admin-invite templates (mandatory even if "email automation" is Phase 2).
- **M-05 🔴 RFQ persistence model** — `rfq_items` (product_id/custom line, quantity, remarks), `location`, `student_count`, `staff_count`, attachment linkage, and the matching API body. (Resolves `C-03`.)
- **M-06 🟠 Permission catalog** — concrete `permissions` rows per module/action and the `role_permissions` seed mapping the 6 roles. The role matrix is prose only.
- **M-07 🟠 Lead lifecycle rules** — auto-create a `lead` from each source (RFQ, contact, catalog download, product inquiry, bulk order), **dedup/merge rule** (by phone/email), and the note that a *WhatsApp click cannot itself create a lead with PII* (see `C`/UX `U-07`) — only an analytics event.
- **M-08 🟠 Search backend** — "Global search" with autocomplete across products/blogs/case-studies/catalogs is specified in UI but only `/products?search=` exists. Choose Postgres full-text (MVP) vs. external (later) and define the search API.
- **M-09 🟠 Status→percentage and status→color mapping** — `orders.progress_percentage` and the 5 tracking colors must be derived from the 15 statuses by an explicit rule. Recommend: percentage = (stageIndex / totalStages); color buckets = {Confirmed→blue, Cutting/Stitching/Fabric→orange, Quality Inspection→purple, Packing/Dispatched→teal, Delivered/Closed→green}.
- **M-10 🟠 Public-form abuse controls** — captcha/honeypot + rate limit on RFQ, contact, catalog-download, and track endpoints (protects lead quality and WhatsApp cost).
- **M-11 🟠 File-upload constraints** — allowed MIME types, max size, count, signed/direct-to-S3 uploads, and AV scanning for anonymous RFQ attachments.
- **M-12 🟠 Soft-delete + audit columns** — schema rules require soft deletes and audit logs, but most tables lack `deleted_at`, `updated_by`; need a consistent audit interceptor and column additions.
- **M-13 🟠 API envelope details** — pagination meta shape, error-code catalog, validation error format (the response examples are minimal).
- **M-14 🟠 Legal/compliance pages & flow** — Privacy Policy, Terms, cookie/analytics consent, and **India DPDP / PII handling** for stored phone/email leads — including a data-deletion path that conflicts with the "never delete" rules (needs reconciliation: delete leads/PII vs. retain order/audit history).
- **M-15 🟡 SEO assets** — `robots.txt`, dynamic sitemap, JSON-LD schema per content type, canonical strategy with ISR.
- **M-16 🟡 Environments & ops** — staging env, CI/CD, secrets management, DB backup/restore, migration workflow, seed/demo data.
- **M-17 🟡 Content readiness plan** — who supplies product imagery, categories, industries, case studies, catalogs, testimonials before launch (otherwise every screen shows empty states).
- **M-18 🟡 RFQ draft autosave storage** — RFQWizard advertises "Auto Save / Resume" but anonymous users have no account and there's no `rfq_drafts` table; decide localStorage vs. server draft.
- **M-19 🟡 Bulk product operations** — Duplicate/Bulk Upload/Bulk Edit/Import are specified but have no API; define CSV import + bulk endpoints or descope to Phase 2.
- **M-20 🟡 Notification idempotency** — retry mechanism needs an idempotency key to avoid double-sends.
- **M-21 🟡 Accessibility target level** — fix to WCAG 2.1/2.2 **AA**; current docs say "WCAG compliant" without a level.

---

## 3. IMPLEMENTATION RISKS

- **R-01 🔴 Logo asset quality.** Supplied `images.png` is low-resolution, compressed, with blurry shadows and visible artifacts; no vector, no transparent/mono/dark variants. Unusable for "enterprise-grade" headers, retina, favicon, or OG. Need a clean SVG kit. (Pairs with `M-02`.)
- **R-02 🔴 WhatsApp Business API is on the critical path and is externally gated.** Requires a verified Meta Business, an approved WABA + sender number, and **pre-approved message templates** (review can take days and templates get rejected). Free-form "Customer Notes Added" and "Weekly Summary" messages must fit utility/marketing template rules and the 24-hour window. Start verification + template submission in week 1 or the headline feature slips.
- **R-03 🔴 Serverless ⊥ background work.** Vercel functions are short-lived/stateless; the spec needs a notification **queue**, **retries**, **weekly cron**, and **background jobs**. Needs an explicit choice (e.g. Vercel Cron + a managed queue/worker such as Upstash QStash / BullMQ on a small worker host / a separate Node service). Otherwise reliability targets can't be met.
- **R-04 🔴 Timeline realism.** ~85 screens × **two design languages** (enterprise desktop + app-style mobile, which Figma itself splits into separate pages per view) + RBAC + CMS + tracking + WhatsApp + analytics in **8×1-week sprints** is not achievable at the stated quality bars (skeletons everywhere, Framer Motion polish, WCAG AA, Lighthouse > 90). Re-baseline (see §8) or cut scope.
- **R-05 🟠 Anonymous file uploads** (RFQ attachments) are a malware/abuse surface; needs validation, size/type limits, signed uploads, scanning. (Pairs with `M-11`.)
- **R-06 🟠 Tracking-ID enumeration.** A guessable `CHG-SCH-2026-00124` URL without enforced phone/token check leaks customer order data. Use the opaque `tracking_token` for direct links. (Pairs with `C-10`/`M-09`.)
- **R-07 🟠 Undefined tokens cause UI rework.** Building components before `M-01`/`C-06` are locked guarantees a re-skin pass.
- **R-08 🟠 Lead double-write / quality.** No dedup means one buyer who submits an RFQ, downloads a catalog, and contacts sales becomes 3 leads. (Pairs with `M-07`.)
- **R-09 🟡 ISR vs. CMS freshness.** Products/blogs use ISR; CMS edits won't show until revalidation. Need on-demand revalidation (tags) wired into CMS save.
- **R-10 🟡 Industry data is modeled three ways** — `industries` table (FK from leads/rfqs) but `case_studies.industry` and `testimonials` are free strings; can't reliably filter case studies/testimonials by industry. Normalize.

---

## 4. SCALABILITY CONCERNS

- **S-01 🟠 `analytics_events` table growth.** High-volume inserts (every product view, WhatsApp click) into Postgres will bloat fast, and PostHog/GA already cover this. Decide: use PostHog as source of truth and keep only business-critical events in Postgres (partitioned + retention), or don't dual-write.
- **S-02 🟠 "Never delete" + audit + status history grow unbounded.** Order history, notification logs, and audit logs are append-only by rule. Need an archival/partitioning/retention strategy so admin queries stay fast.
- **S-03 🟠 Notification throughput & cost.** WhatsApp has per-message pricing and rate limits; weekly summaries + per-status sends across many orders must be queued and rate-limited, with cost monitoring.
- **S-04 🟡 Search scaling.** Postgres FTS is fine for MVP catalog size; plan a path to a dedicated index if the catalog/blog grows.
- **S-05 🟡 Indexing gaps.** Listed indexes cover slugs/tracking/status singletons; missing useful composites (e.g. `leads(assigned_to, status)`, `orders(current_status)`, `products(category_id, status)`, `order_status_history(order_id, created_at)`).
- **S-06 🟡 Media at scale.** Image optimization pipeline (next/image + S3/Cloudinary loader + CDN) and large-catalog ISR revalidation need a defined approach.
- **S-07 🟡 "Future ERP without schema redesign" is aspirational.** No locale columns, no multi-region/multi-tenant seams exist; the claim should be softened or partially prepared (e.g. UUIDs ✓, but add `locale`/`metadata` JSON where cheap).

---

## 5. UX CONCERNS

- **U-01 🟠 Lead-gate friction on every catalog download** (Name/Phone/Email/Organization/Location) contradicts "minimal typing" and will depress download conversion. Recommend: remember the visitor (cookie/localStorage) so the gate appears once, and trim required fields.
- **U-02 🟠 Mobile bottom-bar stack collision.** Persistent bottom nav + global FloatingWhatsApp + page-level StickyBottomCTA (product/RFQ) can overlap at the bottom of the viewport. Define a single layering/visibility rule per screen.
- **U-03 🟠 "Never long forms" vs. real RFQ length.** Five steps with many fields is still a lot; autosave/resume (`M-18`) and progressive disclosure are essential to hit the stated completion-rate goal.
- **U-04 🟠 "Native app feel" expectation vs. web reality.** It's a responsive web app, not a native app; PullToRefresh is explicitly "future." Decide if this ships as a **PWA** (installable, offline shell) to meet the expectation, and set stakeholder expectations either way.
- **U-05 🟡 Tracking access friction.** Phone verification protects privacy but adds a step to a WhatsApp-delivered link; the tokenized-link model (`M-09`) gives one-tap view while staying secure.
- **U-06 🟡 Empty-state-first launch.** Without seeded content (`M-17`), the homepage, listings, industries, and case studies all render empty states on day one.
- **U-07 🟡 WhatsApp-click can't produce a lead with PII.** A `wa.me` click is an outbound redirect; you capture an analytics event, not a name/phone. Don't promise WhatsApp-sourced leads with contact details unless the buyer later messages and an agent logs them.
- **U-08 🟡 WhatsApp-only excludes some buyers.** Keep the web RFQ/contact path as a first-class fallback for users who don't use WhatsApp (already present — keep it prominent, not secondary).
- **U-09 🟡 Mobile search discoverability.** Search isn't in the bottom nav; the only entry is the home header. Confirm that's acceptable or add a search affordance.
- **U-10 🟡 Customer-note terminology.** "Customer Notes" is ambiguous (notes *to* the customer from admin vs. *from* the customer). Today only admins can post (`POST /orders/{id}/notes`); the tracking page only displays. Confirm customers cannot reply, and rename for clarity (e.g. "Updates for you").

---

## 6. WHAT'S ACTUALLY SOLID (so we don't relitigate it)

To keep the decision session focused, these are aligned across all docs and need no rework: the non-ecommerce / RFQ-replaces-cart model; no customer accounts; admin-only RBAC with 6 roles; the 15-stage production workflow (DB matches PRD); WhatsApp-first positioning; no-login order tracking concept; the screen inventory and IA; the Next.js 15 + TS + Tailwind + shadcn/ui + Framer Motion + Prisma/Postgres stack; UUID PKs, UTC timestamps, append-only history rules; the component taxonomy. Build on these as-is.

---

## 7. DECISIONS NEEDED BEFORE BUILD (blocking gate)

Resolve these ~20 items first; each maps to findings above.

| # | Decision | Refs |
|---|----------|------|
| D-01 | Final brand palette + all design-token values (one source of truth) | C-06, C-07, M-01 |
| D-02 | Deliver clean logo SVG kit + favicon/OG | R-01, M-02 |
| D-03 | Notification model: auto-always vs. admin toggle | C-01 |
| D-04 | Canonical status→{notify?, template} map | C-02, M-09 |
| D-05 | WhatsApp path: Cloud API vs. BSP; start business verification + template submission now | R-02, M-03 |
| D-06 | Opt-in consent capture point + copy | M-03, M-14 |
| D-07 | Deployment topology: Next.js monolith vs. + Node worker; queue/cron choice | C-11, R-03 |
| D-08 | Email scope for MVP (password reset mandatory) + provider | C-09, M-04 |
| D-09 | Bulk Order = RFQ variant (recommended) vs. separate entity | C-04 |
| D-10 | RFQ full field set + `rfq_items` model + API body | C-03, M-05 |
| D-11 | Tracking access model: opaque token link vs. ID+phone (recommend token + optional phone) | C-10, R-06, M-09 |
| D-12 | Storage = S3 **or** Cloudinary; hosting = Vercel **or** AWS | C-08 |
| D-13 | Search scope/backend for MVP (Postgres FTS, products-first) | M-08 |
| D-14 | Lead auto-create + dedup rules | M-07, R-08 |
| D-15 | Public-form abuse controls (captcha/rate limit) | M-10 |
| D-16 | File-upload policy (types/size/scan/signed) | M-11, R-05 |
| D-17 | Soft-delete + audit approach; reconcile with PII deletion law | M-12, M-14 |
| D-18 | Analytics source of truth (PostHog vs. DB events) | S-01 |
| D-19 | PWA: yes/no | U-04 |
| D-20 | Re-baselined timeline + scope cut for v1 | R-04 |

---

## 8. EXECUTION PLAN (phased, re-baselined)

> The original 8×1-week roadmap is kept as the *sequence* but re-baselined to realistic durations. Adjust to team size; assumes a small senior team. Each phase has an explicit exit gate.

### Phase 0 — Decisions & Foundations *(before any feature code)*
- Run the §7 decision gate; record answers in this file.
- **Lock design tokens** (D-01) and produce the **logo/brand kit** (D-02).
- **Kick off WhatsApp** business verification + template submission (D-05) — long lead time, must start now.
- Scaffold: Next.js 15 + TS strict, Tailwind + shadcn/ui theme wired to tokens, ESLint/Prettier, Prisma + Postgres, env/secrets, staging + CI/CD, Sentry/PostHog.
- Finalize Prisma schema incl. fixes: `rfq_items`, RFQ extra fields, soft-delete/`updated_by` columns, permission seed, composite indexes, status→color/% mapping, Bulk-Order decision applied.
- **Exit gate:** tokens approved, schema migrated on staging, brand kit in repo, WhatsApp application submitted, CI green.

### Phase 1 — Design System & Component Library
- Build the valued tokens into Tailwind/shadcn; implement primitives (buttons incl. WhatsApp variant, inputs/forms, cards, badges, modals, drawers, toasts, skeleton/empty/error states, tables, bottom nav, sticky CTA, floating WhatsApp).
- Resolve the mobile bottom-bar layering rule (U-02).
- **Exit gate:** component gallery (Storybook or a `/dev` route) renders all primitives in both desktop and mobile language, accessible (AA), tokenized.

### Phase 2 — Public Platform (discovery)
- Homepage (desktop landing + mobile dashboard), Categories, Product Listing (filters drawer/sidebar), Product Detail (gallery/specs/related/sticky CTA), Industries (list + detail), About, Contact, Search results.
- SSG/ISR + on-demand revalidation hooks; SEO metadata/OG/JSON-LD/sitemap; next/image pipeline.
- **Exit gate:** a buyer can discover products on mobile and desktop; Lighthouse mobile ≥ 90 on key pages.

### Phase 3 — Lead Generation (RFQ, Contact, Catalogs)
- RFQ wizard with autosave/resume (D-10/M-18), file uploads (M-11), success + WhatsApp CTA.
- Bulk-order flow per D-09.
- Contact form; Catalog Center + gated download (U-01 one-time gate).
- **Lead auto-create + dedup** (M-07) wired from every source; abuse controls (M-10).
- **Exit gate:** every public conversion path creates exactly one correctly-attributed lead; attachments stored securely.

### Phase 4 — Order Management & Tracking
- Admin: order create, order list/detail, status updater (timeline + customer note + notification intent), notification history.
- Public tracking: tokenized link (D-11) + search-by-ID+phone fallback; status card, progress, vertical timeline, support actions; SSR.
- Status→% and status→color mapping (M-09).
- **Exit gate:** admin advances an order through all 15 stages; customer views it via WhatsApp link and via manual search.

### Phase 5 — WhatsApp Notification Engine
- Queue + worker/cron per D-07; template integration per D-05; idempotent sends + retries (M-20); logs; delay alerts + weekly summary cron.
- Canonical trigger map (D-03/D-04) enforced server-side.
- **Exit gate:** a status change reliably enqueues, sends, logs, and updates the timeline; retries and weekly summary verified on staging with a real (sandbox) template.

### Phase 6 — Admin CMS, Media, Settings, RBAC
- Products CMS (+ bulk/import per D-... or descope), Pages/Homepage/Industry/Footer CMS, Blogs, Case Studies, Testimonials, Catalog CMS, Media Library, Settings (general/SEO/WhatsApp/email), Users & Roles (permission catalog M-06).
- Audit logging interceptor (M-12).
- **Exit gate:** business team edits all content without a developer; RBAC enforced and audited.

### Phase 7 — Analytics, Hardening, Launch Readiness
- Dashboard + analytics (source of truth per D-18); legal/consent pages (M-14); accessibility AA pass; performance pass (Core Web Vitals); security pass (rate limits, upload scanning, headers, CSRF/JWT review); backup/restore; seed/real content (M-17); 404/maintenance.
- **Exit gate (MVP success criteria):** mobile-responsive, RFQ working, tracking functional, WhatsApp notifications functional, CMS operational, Lighthouse > 90, WCAG AA, SEO ready.

### Deferred to Phase 2/3 (per docs — keep out of v1)
Sample requests, uniform configurator, CRM/ERP integration, lead scoring, institution portal, reorders, invoices, courier tracking, vendor/distributor portals, multi-language/region.

---

## 9. SEQUENCING NOTES (critical path)

1. **WhatsApp verification + templates (D-05)** and **design tokens/brand (D-01/D-02)** are the two longest-lead items — start both in Phase 0, in parallel with scaffolding.
2. **Deployment/queue decision (D-07)** must precede Phase 5 design; ideally settle it in Phase 0 so the worker/cron host exists early.
3. **Schema fixes** land in Phase 0 to avoid migrations rippling through later phases.
4. Phases 2→3→4→5 are dependency-ordered (discovery → leads → orders → notifications). Phase 6 (CMS) can overlap Phase 2+ once the component library exists. Phase 7 runs continuously but gates launch.

---

## 10. OPEN QUESTIONS FOR STAKEHOLDERS

1. Is this a single Next.js app on Vercel, or Next.js + a separate Node service? (D-07)
2. Are notifications strictly automatic, or can an admin suppress one? (D-03)
3. Is Bulk Order genuinely different from RFQ, or a preset? (D-09)
4. Should tracking links open the order with one tap (tokenized), keeping ID+phone only as a fallback? (D-11)
5. Is email in MVP beyond password reset? (D-08)
6. PWA — required to satisfy "native app feel"? (D-19)
7. Who owns brand finalization (palette + SVG logo) and launch content? (D-01/D-02/M-17)
8. Confirmed WCAG **AA** and Lighthouse **> 90 mobile** as hard gates? (M-21)
9. Realistic team size + target date, so we can re-baseline §8 precisely? (D-20)

---

**Status: awaiting approval.** On approval (and answers to §7/§10), I will update the schema/API/token specs accordingly and begin Phase 0. No implementation will start before then.
