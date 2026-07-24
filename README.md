# Montelle Couture

Luxury bridal ecommerce store built with Next.js 16, Neon PostgreSQL, and Prisma.

**Live:** https://montelle-couture.vercel.app

## Stack

- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** Neon PostgreSQL + Prisma 7
- **Auth:** JWT via `jose` (HTTP-only cookies)
- **State:** Zustand 5 (cart)
- **Image CDN:** GitHub + jsDelivr
- **Deployment:** Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in DATABASE_URL, SESSION_SECRET, ADMIN_PASSWORD, GITHUB_TOKEN

# Start dev server (port 3002)
npm run dev

# Production build
npm run build
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `SESSION_SECRET` | Yes | JWT signing key (32+ chars) |
| `ADMIN_PASSWORD` | Yes | Admin panel password |
| `GITHUB_TOKEN` | Yes* | GitHub PAT for image uploads (*needed in production) |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — banners, categories, featured products |
| `/shop` | All products |
| `/shop/[category]` | Products by category |
| `/products/[id]` | Product detail |
| `/checkout` | Order placement |
| `/about` | Brand story |
| `/admin` | Admin panel (triple-click logo to access) |

## Admin Panel

Access: triple-click the logo within 800ms → enter password

- **Products:** Create, edit, delete products with multi-image upload
- **Orders:** View and update order status
- **Categories:** Manage nested categories
- **Banners:** Manage homepage hero banners

## Image Storage

Images are uploaded to GitHub (`public/images/products/`) via the GitHub API and served via jsDelivr CDN:

```
https://cdn.jsdelivr.net/gh/SherifAsh93/Montelle-Couture@main/public/images/products/{filename}
```

`GITHUB_TOKEN` (PAT with `repo` scope) must be set in Vercel env vars.

## Deployment

Push to `main` → Vercel auto-deploys.

Build command: `prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build`

## Project Docs

See `PROJECT_CONTEXT.md` for full architecture, lessons learned, and developer notes.
See `docs/` for detailed documentation (architecture, API reference, UI patterns, etc.).
