# Project Overview

**Montelle Couture** is a luxury bridal ecommerce store. Customers browse and purchase bridal wear — veils, robes, corsets, dresses, and accessories. The site features a full admin panel for product, order, category, and banner management, with image uploads via GitHub CDN.

- **Live URL:** https://montelle-couture.vercel.app
- **GitHub:** https://github.com/SherifAsh93/Montelle-Couture
- **Local path:** `/home/sherif/sites/Montelle`
- **Admin access:** Triple-click logo within 800ms → password-protected panel
- **Status:** LIVE — ready for products to be added
- **Last audited:** 2026-07-24

---

## Features

- Homepage with hero banners, category grid, and featured products
- Shop page with product listing and category filtering
- Product detail page with image gallery and add-to-cart
- Cart drawer (Zustand, client-side state)
- Checkout flow — customer name, phone, city, address, order notes
- Admin panel:
  - Dashboard with stats (orders, products, revenue)
  - Product CRUD with multi-image upload via GitHub CDN
  - Category management (nested: parent/child)
  - Order management with status tracking
  - Banner management for homepage hero
- Mobile-first responsive design (mobile bottom nav bar)
- RTL-ready Arabic support
- Announcement bar with marquee animation
- Luxury brand design: Cormorant Garamond + Montserrat fonts, cream/gold palette
- Custom 5px gold scrollbar (desktop/mouse only)
- Triple-click logo easter egg → admin login

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma 7.8.0 (with `@prisma/adapter-pg`) |
| Auth | JWT via `jose` 6 (HTTP-only cookie sessions) |
| State | Zustand 5 (cart) |
| Image CDN | GitHub + jsDelivr (`cdn.jsdelivr.net/gh/...`) |
| Image Processing | Sharp 0.34.5 |
| Icons | Lucide React 1.16 |
| Deployment | Vercel (auto-deploy on push to `main`) |
| DB client | `pg` 8 |

---

## Folder Structure

```
Montelle/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, metadata)
│   │   ├── globals.css                   # Theme tokens, animations, scrollbar
│   │   ├── (store)/                      # Customer-facing store group
│   │   │   ├── layout.tsx                # Store layout (Navbar + Footer)
│   │   │   ├── page.tsx                  # Homepage (banners, categories, products)
│   │   │   ├── about/page.tsx            # Brand story
│   │   │   ├── shop/page.tsx             # All products
│   │   │   ├── shop/[category]/page.tsx  # Products by category
│   │   │   ├── products/[id]/page.tsx    # Product detail
│   │   │   └── checkout/page.tsx         # Order placement
│   │   ├── admin/                        # Admin panel (password required)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard/stats
│   │   │   ├── products/page.tsx         # Product list
│   │   │   ├── products/new/page.tsx     # Create product
│   │   │   ├── products/[id]/page.tsx    # Edit product
│   │   │   ├── orders/page.tsx           # Order list
│   │   │   ├── categories/page.tsx       # Category management
│   │   │   └── banners/page.tsx          # Banner management
│   │   └── api/                          # REST API routes
│   │       ├── admin/login, logout, stats
│   │       ├── admin/products, products/[id]
│   │       ├── admin/orders, orders/[id]
│   │       ├── admin/categories, categories/[id]
│   │       ├── admin/banners, banners/[id]
│   │       ├── admin/upload              # Image upload to GitHub CDN
│   │       ├── banners                   # Public banners
│   │       ├── categories                # Public categories
│   │       ├── orders                    # Order placement
│   │       ├── products                  # Public products list
│   │       └── products/[id]             # Public product detail
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx               # Top nav with logo triple-click
│   │   │   ├── Footer.tsx
│   │   │   ├── AnnouncementBar.tsx      # Marquee with double overflow-hidden
│   │   │   └── MobileBottomNav.tsx
│   │   ├── store/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── FeaturesStrip.tsx
│   │   ├── admin/
│   │   │   └── ImageUpload.tsx          # Upload to GitHub via API
│   │   └── ui/
│   │       └── Button.tsx
│   ├── lib/
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   ├── session.ts                   # JWT session helpers (jose)
│   │   └── utils.ts                     # Shared utilities
│   ├── store/
│   │   └── cart.ts                      # Zustand cart store
│   └── generated/
│       └── prisma/                      # Auto-generated Prisma client
├── prisma/
│   ├── schema.prisma                    # DB schema
│   ├── prisma.config.ts                 # Prisma config (adapter-pg)
│   └── seed.cjs                         # Seeds categories on every build
├── public/
│   ├── logo.jpeg                        # Montelle Couture logo
│   └── images/                          # Static images
├── docs/                                # Detailed developer docs (10 files)
├── resources/                           # Design files (gitignored)
│   ├── website design.jpeg
│   ├── website design 2.jpeg
│   └── Montelle Couture (I).pdf
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Database

**Provider:** Neon PostgreSQL (serverless)
**ORM:** Prisma 7.8.0 with `@prisma/adapter-pg`

### Models

| Model | Purpose |
|-------|---------|
| `Category` | Product categories — supports parent/child nesting (self-relation via `parentId`). Fields: id, name, slug, image, parentId, sortOrder |
| `Product` | Store products. Fields: id, name, description, price, comparePrice, images (String[]), stock, featured, active, categoryId, createdAt, updatedAt |
| `Order` | Customer orders. Fields: id, orderNumber, customerName, customerPhone, city, address, notes, status (enum), subtotal, shipping, total, createdAt, updatedAt |
| `OrderItem` | Line items linking Order ↔ Product. Fields: id, orderId, productId, name, price, quantity, image |
| `Banner` | Homepage hero banners. Fields: id, title, subtitle, image, link, active, sortOrder, createdAt |

### Order Status Enum
`PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED`

### Seeded Categories (on every build)
Main: Maternity Wear, Robes, Bridal Clothes, Bridal Accessories, Corsets, Dresses
Sub (Bridal Clothes): Pants, Skirts, Shirts
Sub (Bridal Accessories): Veil, Banner, Face Cover, Bags, Gloves
Sub (Dresses): Long Dress, Short Dress

---

## Environment Variables

Set in Vercel dashboard and locally in `.env.local` (never committed):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string (required) |
| `SESSION_SECRET` | JWT signing key — 32+ random chars (required) |
| `ADMIN_PASSWORD` | Admin panel password (required) |
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope — needed for image uploads via admin |
| `NODE_ENV` | Set automatically by Next.js/Vercel |

> Note: `GITHUB_TOKEN` must be set in Vercel env vars for image uploads to work. Without it, the upload endpoint will fail.

---

## Local Development

```bash
# Start dev server (port 3002)
cd /home/sherif/sites/Montelle
npm run dev
# → http://localhost:3002

# Build (requires DATABASE_URL in .env.local for prisma db push)
npm run build

# TypeScript check only
npx tsc --noEmit

# Database GUI
npx prisma studio  # → http://localhost:5555

# Push schema changes
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

---

## Deployment

- **Platform:** Vercel
- **Auto-deploy:** Push to `git push origin main` triggers a Vercel build
- **Build command:** `prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build`
- **Note:** `prisma db push --accept-data-loss` runs on every deploy — safe because seed only inserts categories if not present
- **Image domains allowed:** `cdn.jsdelivr.net`, `res.cloudinary.com`, `images.unsplash.com`, `*.githubusercontent.com`

```bash
# Deploy to production
git add -A && git commit -m "..." && git push origin main
# Vercel auto-deploys on push to main
```

---

## Current Status

- **Build:** PASSING (verified 2026-07-24 — TypeScript clean, all 24 pages generate)
- **Live:** https://montelle-couture.vercel.app is online
- **Git:** Clean (`main` branch, up to date with `origin/main`)
- **Database:** Neon PostgreSQL connected, schema pushed, categories seeded
- **Image uploads:** Requires `GITHUB_TOKEN` in Vercel env — confirm this is set
- **Products/Banners:** Needs real content added via admin panel

---

## Known Issues

1. **`GITHUB_TOKEN` required for image uploads** — admin image upload will fail without a GitHub PAT (`repo` scope) set in Vercel env vars.
2. **Build requires `DATABASE_URL`** — `npm run build` locally requires `.env.local` with `DATABASE_URL` because it runs `prisma db push`. Use `npx next build` to build without DB (for TypeScript/compile checks only).
3. **`location is not defined` SSR warning** — Non-fatal `ReferenceError` during static generation from a browser API reference in checkout page. Does not affect runtime or build exit code.
4. **`pg` SSL warning** — `pg` v8 warns about SSL mode aliases changing in v9. Non-breaking, monitor when upgrading `pg`.

---

## Future Improvements

- Add WhatsApp order notification integration
- Product search and filtering UI
- Related products section on product detail
- Wishlist feature
- Order confirmation page with order summary
- Customer-facing order tracking by phone number
- Image optimization: consider moving from GitHub CDN to Cloudinary or Vercel Blob
- Add size/variant system to products (e.g., dress sizes)
- Newsletter signup integration
- Arabic RTL full support (currently partially implemented)

---

## Reusable Assets

| Asset | Location | Reuse Value |
|-------|----------|-------------|
| `ImageUpload.tsx` | `src/components/admin/` | GitHub CDN image upload — reusable in any project with `GITHUB_TOKEN` |
| `session.ts` | `src/lib/` | JWT session with jose — drop-in auth utility |
| `CartDrawer.tsx` | `src/components/store/` | Slide-in cart drawer with Zustand |
| `AnnouncementBar.tsx` | `src/components/layout/` | Marquee with double overflow-hidden fix for Android Chrome |
| `MobileBottomNav.tsx` | `src/components/layout/` | Mobile sticky bottom nav pattern |
| `cart.ts` | `src/store/` | Zustand cart store with persistence |
| Prisma + Neon setup | `prisma/`, `src/lib/prisma.ts`, `prisma.config.ts` | Serverless-safe Prisma with adapter-pg |
| Category seed script | `prisma/seed.cjs` | CJS seed that runs safely on every build |
| Admin panel pattern | `src/app/admin/` | Complete CRUD admin — products, orders, categories, banners |
| Tailwind v4 globals | `src/app/globals.css` | Theme tokens, gold scrollbar, `pb-safe`, luxury color palette |

---

## Lessons Learned

1. **Tailwind v4 unlayered reset bug** — An unlayered `* { margin:0; padding:0 }` CSS reset overrides all `@layer utilities` classes (unlayered beats layered regardless of source order). This killed every `px-*`, `py-*`, `mx-*`, `my-*` site-wide. Fix: remove the reset — Tailwind v4 base layer handles it. Never add unlayered resets after `@import "tailwindcss"`.
2. **Prisma adapter-pg for Neon** — Must use `@prisma/adapter-pg` with a pooled `pg.Pool` for serverless (Neon). Direct `pg.Client` causes connection exhaustion.
3. **jsDelivr CDN for GitHub-hosted images** — `https://cdn.jsdelivr.net/gh/{owner}/{repo}@main/public/images/...` provides free, fast CDN over any public GitHub repo. Cache purge via jsDelivr API if images update.
4. **CJS seed script** — Prisma seed must be `.cjs` (CommonJS) when `package.json` has no `"type": "module"` override, or use `.mjs`. The `node prisma/seed.cjs` approach avoids ESM/CJS conflicts.
5. **Mobile scrollbar** — Scoping custom scrollbar styles to `@media (hover: hover) and (pointer: fine)` prevents hiding native scrollbar on touch devices.
6. **Admin hidden entry** — Triple-click on logo within 800ms as admin entry point avoids exposing `/admin` in the nav. Track click timestamps in an array and check `timestamps[2] - timestamps[0] < 800`.

---

## WebistryDev Metadata

- **Category:** Ecommerce / Bridal
- **Complexity:** High
- **Template Candidate:** Yes — full ecommerce template (products, orders, admin, cart, checkout, CDN images)
- **Priority:** Active
- **Reusable Modules:**
  - GitHub CDN image upload system
  - JWT session auth (jose)
  - Zustand cart store
  - Prisma + Neon serverless setup
  - Admin CRUD panel (products / orders / categories / banners)
  - Mobile bottom nav
  - Announcement bar marquee
  - Luxury bridal design system (colors, fonts, tokens)
- **Similar Projects:** zahrtelkhlig (`/home/sherif/sites/zahrtelkhlig`), Qoya-Furniture (`qoya-furniture.vercel.app`)
- **Notes:** No payment gateway (COD only). Image uploads depend on `GITHUB_TOKEN` in Vercel. Arabic RTL partially supported — full RTL would need `dir="rtl"` on root and font swap to an Arabic serif.
