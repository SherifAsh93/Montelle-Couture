# Montelle Couture — PROJECT_CONTEXT

## What It Does

Luxury bridal ecommerce store for Montelle Couture. Customers browse and order bridal wear — veils, robes, corsets, dresses, and accessories. Includes a full admin panel for product/order/category/banner management and image uploads via GitHub CDN.

**Live URL:** https://montelle-couture.vercel.app
**GitHub:** https://github.com/SherifAsh93/Montelle-Couture
**Local:** `/home/sherif/sites/Montelle`
**Admin:** triple-click logo → password `1415`
**Status:** LIVE — ready for products to be added
**Stack:** Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Neon PostgreSQL · Prisma 7 · Cormorant Garamond + Montserrat · Jose (JWT) · Zustand 5 · GitHub + jsDelivr CDN

---

## Brand & Design

- **Logo:** `public/logo.jpeg` — floral bouquet with gold ribbon bow, "MONTELLE COUTURE" serif text
- **Color palette:** Cream/ivory backgrounds (#fdfaf6, #faf5ee), gold accents (#c4a35a), dark brown text (#1c1510)
- **Fonts:** Cormorant Garamond (serif headings), Montserrat (body/nav)
- **Design reference:** `resources/website design.jpeg` and `resources/website design 2.jpeg`
- **PDF brand guide:** `resources/Montelle Couture (I).pdf`

---

## Structure

```
Montelle/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout (fonts, metadata)
│   │   ├── globals.css                  # Theme tokens + animations
│   │   ├── (store)/                     # Customer-facing store
│   │   │   ├── layout.tsx               # Store layout (Navbar + Footer)
│   │   │   ├── page.tsx                 # Homepage (banners, categories, products)
│   │   │   ├── about/page.tsx
│   │   │   ├── shop/page.tsx
│   │   │   ├── shop/[category]/page.tsx
│   │   │   ├── products/[id]/page.tsx
│   │   │   └── checkout/page.tsx
│   │   ├── admin/                       # Admin panel (password required)
│   │   └── api/                         # REST endpoints
│   ├── components/
│   │   ├── layout/  Navbar, Footer, AnnouncementBar, MobileBottomNav
│   │   ├── store/   HeroBanner, CategoryGrid, ProductCard, CartDrawer, FeaturesStrip
│   │   ├── admin/   ImageUpload
│   │   └── ui/      Button
│   ├── lib/         prisma.ts, session.ts, utils.ts
│   ├── store/       cart.ts (Zustand)
│   └── generated/   Prisma client
├── prisma/
│   ├── schema.prisma
│   └── seed.cjs     # Seeds categories on every build
├── public/
│   ├── logo.jpeg    # Montelle Couture logo
│   └── images/      # Product images (→ GitHub CDN via jsDelivr)
└── resources/       # Design files (not committed to git — gitignored)
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage — hero banners, categories, featured products |
| `/shop` | All products |
| `/shop/[category]` | Products by category slug |
| `/products/[id]` | Product detail |
| `/checkout` | Order placement |
| `/about` | Brand story |
| `/admin` | Admin login + dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/categories` | Category management |
| `/admin/banners` | Banner management |

---

## How to Run

```bash
cd /home/sherif/sites/Montelle
npm run dev        # Dev server → http://localhost:3002
npm run build      # Production build
npx prisma studio  # DB GUI → http://localhost:5555
```

**Required env vars (`.env.local`):**
- `DATABASE_URL` — Neon PostgreSQL connection string
- `POSTGRES_PRISMA_URL` — pooled URL
- `POSTGRES_URL_NON_POOLING` — non-pooled URL
- `SESSION_SECRET` — JWT signing key (32+ chars)
- `GITHUB_TOKEN` — PAT with `repo` scope (for image uploads)
- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3002`

---

## Image Storage

Images uploaded via admin are pushed to `public/images/products/` in the GitHub repo via GitHub API, served via:
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Montelle-Couture@main/public/images/products/{filename}
```
`GITHUB_TOKEN` must be set in Vercel env vars for uploads to work.

---

## Categories (seeded on build)

Main: Maternity Wear, Robes, Bridal Clothes, Bridal Accessories, Corsets, Dresses
Sub (Bridal Clothes): Pants, Skirts, Shirts
Sub (Bridal Accessories): Veil, Banner, Face Cover, Bags, Gloves
Sub (Dresses): Long Dress, Short Dress

---

## How to Continue

- **Add products:** Admin → `/admin/products/new`
- **Design reference:** `resources/` folder — logo, mockups, PDF brand guide
- **Deploy:** Push to `main` → Vercel auto-deploys
- **Schema changes:** `npx prisma db push` + `npx prisma generate`

---

## UI Notes

- **Logo click:** single click → home `/`; triple-click (within 800ms) → admin `/admin`
- **Hero fallback:** when no banners in DB, renders centered luxury layout with gold corner frames, decorative divider, and CTA. Looks intentional, not empty.
- **Category cards fallback:** when no category images, warm champagne-gold gradients with dark text overlay (intentional luxury look)
- **Secondary nav (desktop):** 6 items (Veils/Robes/Corsets/Bridal Sets/Gift Cards/Custom Orders) with `rgba(0,0,0,0.12)` separators and "Book an Appointment" gold CTA pinned right via `position:absolute`
- **Tailwind v4 quirk:** `px-N` utilities give unexpectedly small values — use inline `style={{ padding: '...' }}` for critical spacing
- **FeaturesStrip:** 2-col on mobile, 4-col on desktop

## Known Issues

- `GITHUB_TOKEN` must be set in Vercel env for image uploads to work (needs GitHub PAT with `repo` scope).

---

## Next Steps

- Set `GITHUB_TOKEN` in Vercel env vars to enable image uploads from admin
- Add real product data (Admin → `/admin/products/new`)
- Add hero banners (Admin → `/admin/banners`)
- Last updated: 2026-06-28
