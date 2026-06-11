# Changayees

Mobile-first B2B procurement platform for institutional uniforms — product
discovery, RFQ submission, WhatsApp-first communication, and no-login order
tracking. **Not** a retail ecommerce site (no cart/checkout/payments/customer
accounts).

## Stack

Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · shadcn/ui ·
Framer Motion · PostgreSQL · Prisma.

See `CHANGAYEES_FINAL_TECHNICAL_ARCHITECTURE.md` for the full design.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then fill in values

# 3. Generate the Prisma client
npm run prisma:generate

# 4. (with a running Postgres) create the schema + seed roles
npm run prisma:migrate
npm run db:seed

# 5. Run the app
npm run dev                 # http://localhost:3000
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run prisma:*` | generate / migrate / studio |
| `npm run db:seed` | Seed RBAC roles |

## Project structure

```
src/
  app/
    (public)/      # enterprise desktop + app-style mobile shell
    (admin)/admin/ # admin portal (behind auth/RBAC — later phase)
    (track)/track/ # no-login order tracking portal (SSR)
    api/           # route handlers (/api/v1/* in later phases)
  components/
    brand/         # logo
    layout/        # headers, bottom nav, footer, floating WhatsApp
    ui/            # shadcn primitives (generated)
  features/        # domain modules (per build phase)
  services/        # cross-feature services
  hooks/           # shared hooks
  lib/             # utils, env, prisma, constants
  types/           # shared types
prisma/            # schema + seed
```

## Foundation status

This is the **foundation only** (Phase 0): tooling, design tokens, base
layouts, env, and the auth/RBAC Prisma slice. Feature modules are implemented in
subsequent phases per the build roadmap.

> ⚠️ The logo currently renders from `/public/logo/images.png` (low-res raster).
> Replace with an SVG kit (+ favicon/OG variants) before launch — see
> architecture R-01 / M-02.
