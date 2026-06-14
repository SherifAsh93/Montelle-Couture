# Montal — PROJECT_CONTEXT

## What It Does

Luxury bridal ecommerce store for Montal. Customers browse and order bridal wear, maternity wear, robes, corsets, and dresses online. Includes a full admin panel for product/order/category/banner management and image uploads via GitHub CDN.

**Live URL:** https://montal-fawn.vercel.app  
**GitHub:** https://github.com/SherifAsh93/Montal  
**Local:** `/home/sherif/sites/Montal`  
**Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Neon PostgreSQL · Prisma 7 · Jose (JWT) · Zustand 5 · GitHub + jsDelivr CDN

---

## Structure

```
Montal/
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout
│   │   ├── globals.css
│   │   ├── (store)/                     # Customer-facing store
│   │   │   ├── layout.tsx               # Store layout (Navbar + Footer)
│   │   │   ├── page.tsx                 # Homepage (banners, categories, products)
│   │   │   ├── about/page.tsx
│   │   │   ├── shop/page.tsx            # All products
│   │   │   ├── shop/[category]/page.tsx # Products by category
│   │   │   ├── products/[id]/page.tsx   # Product detail
│   │   │   └── checkout/page.tsx        # Checkout
│   │   ├── admin/                       # Admin panel (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 # Dashboard + login — password: 1415
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── banners/page.tsx
│   │   └── api/
│   │       ├── admin/login · logout · products · orders · categories · banners · stats · upload
│   │       └── (public) products · categories · banners · orders
│   ├── components/
│   │   ├── layout/  Navbar, Footer, AnnouncementBar, MobileBottomNav
│   │   ├── store/   HeroBanner, CategoryGrid, ProductCard, CartDrawer, FeaturesStrip
│   │   ├── admin/   ImageUpload
│   │   └── ui/      Button
│   ├── lib/         auth, db helpers
│   ├── store/       Zustand cart store
│   └── generated/   Prisma client
├── prisma/
│   ├── schema.prisma
│   └── seed.cjs
├── public/images/   Product images (served via jsDelivr CDN)
├── package.json
└── .env.local       # Secrets (never commit)
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage — hero banners, categories, featured products |
| `/shop` | All products with filtering |
| `/shop/[category]` | Products filtered by category |
| `/products/[id]` | Product detail + size/color selection |
| `/checkout` | Order placement (Vodafone Cash / InstaPay) |
| `/about` | Brand info |
| `/admin` | Admin login (password stored in env / admin config) |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/categories` | Category management |
| `/admin/banners` | Banner management |

---

## How to Run

```bash
cd /home/sherif/sites/Montal
npm run dev        # Dev server → http://localhost:3002
npm run build      # Production build (runs prisma generate + db push + seed + next build)
npx prisma studio  # Database GUI → http://localhost:5555
```

**Required env vars in `.env.local`:**
- `POSTGRES_PRISMA_URL` — Neon PostgreSQL connection string (pooled)
- `POSTGRES_URL_NON_POOLING` — Neon non-pooled URL (for migrations)
- `SESSION_SECRET` — JWT signing key (32+ chars)
- `GITHUB_TOKEN` — GitHub PAT with `repo` scope (for image uploads via API)
- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3002` or production URL

---

## Image Storage

Images uploaded via admin are pushed to `public/images/` in the GitHub repo via GitHub API, then served through jsDelivr CDN:
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Montal@main/public/images/{folder}/{filename}
```
**GITHUB_TOKEN must be set** for image uploads to work. Without it, uploads fail silently.

---

## How to Continue

- **Add a product:** `/admin/products/new`
- **Manage orders:** `/admin/orders`
- **Add categories:** `/admin/categories`
- **Update banners:** `/admin/banners`
- **Schema changes:** Edit `prisma/schema.prisma` → `npx prisma db push` → `npx prisma generate`
- **Deploy:** Push to `main` → Vercel auto-deploys

---

## Known Issues

- Image uploads require `GITHUB_TOKEN` to be set in both `.env.local` and Vercel environment variables. Without it, admin image upload will fail.
- `npm run build` includes `prisma db push --accept-data-loss` — safe for development but be cautious if schema has breaking changes on production data.

---

## Next Steps

- No active issues as of 2026-06-14.
- Categories defined: Maternity wear, Robes, Bridal clothes (Pants/Skirts/Shirts), Bridal accessories (Veil/Banner/Face cover/Bags/Gloves), Corsets, Dresses (Long/Short).
