# CHANGAYEES — TESTING STRATEGY

Version: 1.0
Status: Implemented

---

## 1. Philosophy

Test the **logic that can break**, fast and offline. The platform's risk is
concentrated in pure logic (RBAC, status workflow, dedup, validation, SEO) and
in the API contract (envelopes, guards, error mapping). Those are covered by a
fast Vitest suite that needs **no database and no browser**. Full-stack behaviour
(real viewports, navigation) is covered by a Playwright E2E layer that runs
against a deployed/preview URL.

```
        ▲  fewer, slower, higher-fidelity
        │   E2E / Responsive (Playwright, real browsers + viewports)
        │   Accessibility (axe on rendered components)
        │   API (route handlers, guards, envelope)
        │   Integration (services with a mocked Prisma)
        │   Unit (pure functions + domain logic)
        ▼  many, fast, deterministic
```

---

## 2. Tooling

| Concern | Tool | Why |
|---|---|---|
| Unit / Integration / API | **Vitest** | Native ESM + TS, fast, same Vite transform as the app |
| Component / DOM | **@testing-library/react** + jsdom | User-centric queries |
| Accessibility | **vitest-axe** (axe-core) | Automated WCAG checks on rendered output |
| Mocking | **vitest-mock-extended** / `vi.mock` | Mock Prisma + services — no DB needed |
| E2E / Responsive | **Playwright** | Real Chromium/WebKit across mobile/tablet/desktop |
| Coverage | **@vitest/coverage-v8** | Coverage for `lib/`, `services/`, `features/` |

---

## 3. Layout

```
tests/
  unit/          pure functions + domain logic (no mocks)
  integration/   services with a mocked Prisma client
  api/           route handlers, guards, response envelope
  a11y/          axe accessibility checks on components (jsdom)
  responsive/    responsive class-contract checks (jsdom)
  e2e/           Playwright specs (real browsers/viewports)
vitest.config.mts
vitest.setup.ts  (test env defaults + jest-dom + axe matchers)
playwright.config.ts
```

DOM tests opt into jsdom per-file with `// @vitest-environment jsdom`; everything
else runs in Node.

---

## 4. What's covered

**Unit** — `cn`, `slugify`, `whatsappHref`, number/date formatting; the 15-stage
**order-status** workflow (progress %, colour buckets, options); **RBAC**
(`hasPermission` wildcards, the full role→permission matrix); phone normalization
+ reference-number generators; the **notification trigger map** (§7.2);
**SEO** (canonical, OG/Twitter, JSON-LD Product/Breadcrumb); **storage** key
build/parse + **media upload validation** (MIME/size/folder).

**Integration** — `captureLead` dedup-by-(phone, source) with a mocked Prisma:
reuse vs. create, normalized phone in the lookup key, analytics fired only on new.

**API** — the response envelope (`ok`/`created`/`okWithMeta`/`message` + status
codes); `withApi` error mapping (ApiError → status+code, ZodError → 422,
unknown → 500); the RBAC `requirePermission`/`requireAuth` guards (403/401); and a
real public endpoint (`POST /api/v1/analytics/track`) — whitelist enforcement + 204.

**Accessibility** — axe over Button, Badge, StatusBadge, Alert, EmptyState
(landmark/contrast rules tuned for component fragments) + role/name assertions.

**Responsive** — class-contract checks that the mobile-first → desktop utilities
are present (`md:pb-0`, `container-page`, `layout-grid`, square icon button).
Real viewport rendering lives in the Playwright suite (mobile/tablet/desktop
projects) — homepage CTA, bottom-nav visibility per viewport, tracking + product
pages.

---

## 5. Running

```bash
npm test               # full Vitest suite (unit + integration + api + a11y + responsive)
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report (./coverage)

# E2E / responsive (needs browsers + a running app)
npx playwright install
npm run build && npm start        # or set E2E_BASE_URL to a preview/prod URL
npm run test:e2e
```

`E2E_BASE_URL` lets the Playwright suite run against a **Vercel preview URL** —
useful when local DB access is blocked by a firewall.

---

## 6. Conventions

- **No real DB in unit/integration/API tests** — Prisma is mocked. Keeps them
  deterministic and runnable anywhere (incl. CI without a database).
- **`vi.hoisted`** for mocks referenced inside `vi.mock` factories (ESM hoisting).
- Tests are **excluded from the app `tsconfig`** so `npm run typecheck`/`build`
  stay app-focused; Vitest transpiles tests itself.
- New service → add an integration test (mock Prisma) for its branching logic.
  New public endpoint → add an API test for auth + happy path + validation.
  New shared component → add an axe check.

---

## 7. CI recommendation

```
npm ci
npm run typecheck
npm run lint
npm test            # Vitest (no DB)
npm run build
# optional, against a preview deploy:
E2E_BASE_URL=$PREVIEW_URL npm run test:e2e
```
