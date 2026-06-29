# 01 — Project Overview

## What It Is

Montelle Couture is a luxury bridal e-commerce platform built for an Egyptian brand selling handcrafted bridal wear: robes, veils, corsets, bridal sets, dresses, and accessories. The site is deployed on Vercel at `montelle-couture.vercel.app` and targets mobile-first shoppers browsing on phones.

---

## Target Market

Egyptian bridal market. Currency is EGP. Phone numbers follow `+20 xxx xxx xxxx` pattern (placeholder text in checkout). Free shipping threshold is 800 EGP; flat shipping fee is 60 EGP. The brand language is luxury: gold accents, serif headings, uppercase micro-labels, champagne color palette throughout.

---

## Store Features

### Customer-Facing

| Feature | Description |
|---|---|
| Hero Banner | Auto-rotating image carousel (5s interval), manual prev/next arrows, dot indicators. Falls back to editorial typographic layout when no banners exist. |
| Category Grid | Up to 6 category cards in 2/3-col grid with 4:5 aspect ratio. Champagne gradient fallbacks when no category image is set. |
| Brand Story Strip | Static editorial section on homepage with nested gold frame decorative elements. |
| Featured Products | Up to 8 products flagged `featured=true`, newest first. |
| New Arrivals | Up to 8 newest active products, newest first. |
| Shop (All Products) | `/shop` — all active products; query param `?cat=slug` filters by category. |
| Shop by Category | `/shop/[category]` — resolves parent + all child category slugs, shows products across the hierarchy. |
| Product Detail | `/products/[id]` — gallery with zoom overlay, thumbnail strip, breadcrumb, add-to-bag button (flashes gold for 2s on add), out-of-stock guard. |
| Cart Drawer | Slide-in from right. Quantity controls, remove button, live shipping calculation, checkout link. Persists to `localStorage`. |
| Checkout | Form: name, phone, city, address, notes. Shows order summary. On success shows order number and clears cart. |
| About Page | Brand story, values grid, appointment booking contact form (UI only — form submission not wired to a backend). |
| Announcement Bar | Infinite marquee ticker with 5 rotating messages. |
| Mobile Bottom Nav | Fixed 4-tab bar (Home / Shop / Search / Cart) hidden on `md:` breakpoint. Cart badge with count. |

### Navigation

- Desktop: 3-column header (nav links | centred logo | icons). Secondary category bar with "Book an Appointment" CTA.
- Mobile: Hamburger + logo + cart icon. Drawer slides in from left.
- Triple-click logo within 800 ms navigates to `/admin` (secret entry point).

---

## Admin Features

The admin panel lives at `/admin` (no route-group). All pages are `'use client'` and auth-check on mount by hitting `/api/admin/stats`. If that returns 401, they redirect to `/admin` login.

| Section | Path | Capabilities |
|---|---|---|
| Dashboard | `/admin` | Login form, stats cards (products / total orders / pending orders / revenue), nav cards |
| Products list | `/admin/products` | Grid view, toggle active, single delete, bulk delete (checkbox select), add product link |
| New product | `/admin/products/new` | Full form with ImageUpload component |
| Edit product | `/admin/products/[id]` | Same form pre-populated |
| Orders | `/admin/orders` | Accordion list, status filter tabs, status update dropdown, delete |
| Categories | `/admin/categories` | Tree view (parent + children), inline name edit, add form with parent selector |
| Banners | `/admin/banners` | List with thumbnail, toggle active, delete, add form with ImageUpload |

---

## Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.6 |
| UI Runtime | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 | ^4 |
| ORM | Prisma | ^7.8.0 |
| DB Driver | `@prisma/adapter-pg` + `pg` | ^7.8.0 / ^8.21.0 |
| Database | PostgreSQL via Neon | (hosted) |
| Auth | Jose HS256 JWT | ^6.2.3 |
| State | Zustand with persist | ^5.0.13 |
| Image optimization | Sharp | ^0.34.5 |
| Icons | lucide-react | ^1.16.0 |
| Server guard | server-only | ^0.0.1 |

---

## Annotated Folder Tree

```
/home/sherif/sites/Montelle/
├── prisma/
│   ├── schema.prisma          # 5 models: Category, Product, Order, OrderItem, Banner
│   ├── seed.cjs               # Category hierarchy seed — runs every build via raw pg queries
│   └── seed-products.cjs      # Sample products with Unsplash images — run manually
├── prisma.config.ts           # Prisma config (schema path, datasource url)
├── next.config.ts             # Image remote patterns (jsDelivr, GitHub, Cloudinary, Unsplash)
├── package.json               # Build script: generate → db push → seed → next build
├── postcss.config.mjs         # @tailwindcss/postcss plugin
├── tsconfig.json              # Standard Next.js TS config
└── src/
    ├── app/
    │   ├── layout.tsx          # Root — Cormorant Garamond + Montserrat fonts, metadata
    │   ├── globals.css         # Tailwind v4 @theme tokens + keyframes + scrollbar
    │   ├── (store)/            # Route group — all public store pages share StoreLayout
    │   │   ├── layout.tsx      # AnnouncementBar + Navbar + main + Footer + CartDrawer + MobileBottomNav
    │   │   ├── page.tsx        # Homepage — ISR 60s, parallel Prisma queries
    │   │   ├── about/page.tsx  # Brand story + appointment form (UI only)
    │   │   ├── shop/
    │   │   │   ├── page.tsx           # All products with category filter pills
    │   │   │   └── [category]/page.tsx # Category + subcategory products
    │   │   ├── products/
    │   │   │   └── [id]/page.tsx      # Client component — fetches via /api/products/:id
    │   │   └── checkout/page.tsx      # Client component — form + order submission
    │   ├── admin/
    │   │   ├── layout.tsx       # Minimal — just min-h-screen bg-gray-50
    │   │   ├── page.tsx         # Login gate + dashboard stats + nav cards
    │   │   ├── products/
    │   │   │   ├── page.tsx     # Product grid with toggle/delete/bulk
    │   │   │   ├── new/page.tsx # Create product form
    │   │   │   └── [id]/page.tsx # Edit product form
    │   │   ├── orders/page.tsx  # Accordion order list with status management
    │   │   ├── categories/page.tsx # Tree editor with inline rename
    │   │   └── banners/page.tsx # Banner list with ImageUpload
    │   └── api/
    │       ├── products/
    │       │   ├── route.ts        # GET — public, filters: category slug, featured, limit
    │       │   └── [id]/route.ts   # GET — public single product
    │       ├── categories/route.ts # GET — public, top-level with children
    │       ├── banners/route.ts    # GET — public, active only
    │       ├── orders/route.ts     # POST — public order creation with nested items
    │       └── admin/
    │           ├── login/route.ts       # POST — password check → JWT cookie
    │           ├── logout/route.ts      # POST — delete cookie
    │           ├── stats/route.ts       # GET — product/order counts + revenue aggregate
    │           ├── upload/route.ts      # POST — file or URL → GitHub API → jsDelivr URL
    │           ├── products/
    │           │   ├── route.ts         # GET list, POST create, DELETE bulk
    │           │   └── [id]/route.ts    # GET, PUT, DELETE single
    │           ├── categories/
    │           │   ├── route.ts         # GET tree, POST create
    │           │   └── [id]/route.ts    # PUT, DELETE
    │           ├── orders/
    │           │   ├── route.ts         # GET all with items
    │           │   └── [id]/route.ts    # PUT status, DELETE
    │           └── banners/
    │               ├── route.ts         # GET all, POST create
    │               └── [id]/route.ts    # PUT, DELETE
    ├── components/
    │   ├── ui/
    │   │   └── Button.tsx       # 3 variants (primary/outline/ghost) × 3 sizes + loading spinner
    │   ├── admin/
    │   │   └── ImageUpload.tsx  # File upload or URL paste → GitHub CDN; shows progress
    │   ├── layout/
    │   │   ├── Navbar.tsx       # Desktop 3-col + mobile drawer + triple-click admin nav
    │   │   ├── Footer.tsx       # Newsletter form + 4-col links + social icons (SVG)
    │   │   ├── AnnouncementBar.tsx # Marquee ticker, 5 messages, GPU-optimized
    │   │   └── MobileBottomNav.tsx # Fixed 4-tab bar, md:hidden, pb-safe
    │   └── store/
    │       ├── HeroBanner.tsx    # Carousel with 5s auto-rotate, opacity transitions
    │       ├── CategoryGrid.tsx  # 6-card grid, champagne gradient fallbacks
    │       ├── ProductCard.tsx   # 3:4 aspect ratio, hover "Add to Bag" slide-up
    │       ├── CartDrawer.tsx    # Right slide-in, qty controls, shipping calc, checkout link
    │       └── FeaturesStrip.tsx # 4-col: Handmade / Premium / Worldwide / Luxury
    ├── lib/
    │   ├── prisma.ts    # Singleton PrismaClient with PrismaPg adapter
    │   ├── session.ts   # server-only; createAdminSession, getAdminSession, deleteAdminSession
    │   └── utils.ts     # formatPrice, calcShipping, generateOrderNumber, cn
    ├── store/
    │   └── cart.ts      # Zustand store with persist middleware → localStorage key 'montelle-cart'
    └── generated/
        └── prisma/      # Auto-generated Prisma client — never edit manually
```
