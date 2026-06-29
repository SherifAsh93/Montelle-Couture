# 02 — Architecture

## Route Groups: (store) vs /admin

Next.js App Router route groups allow sharing a layout without including the group name in the URL.

### (store) — Public Store

All pages under `src/app/(store)/` share `(store)/layout.tsx`, which renders:

```
AnnouncementBar → Navbar → <main className="pb-16 md:pb-0"> → Footer → CartDrawer → MobileBottomNav
```

`pb-16 md:pb-0` reserves space for the MobileBottomNav on phones. CartDrawer and MobileBottomNav are client components rendered outside `<main>` so they overlay the page without shifting content flow.

Pages in `(store)/` that query Prisma directly (homepage, shop pages, category pages) are **server components** with `export const revalidate = 60`.

Pages that need interactivity at the top level (product detail, checkout) use `'use client'` and fetch data via the API routes.

### /admin — Admin Panel

All `src/app/admin/` pages are `'use client'`. There is no middleware-based session guard. Instead, every admin page checks auth on mount:

```typescript
useEffect(() => {
  fetch('/api/admin/stats').then((r) => {
    if (!r.ok) router.push('/admin')
  })
}, [router])
```

If `/api/admin/stats` returns 401, the page redirects to `/admin` which shows the login form. This is a client-side guard; it briefly renders the protected UI before redirecting. The real enforcement is at the API layer — every admin API route calls `getAdminSession()` and returns 401 if null.

`src/app/admin/layout.tsx` is minimal — it only wraps children in `min-h-screen bg-gray-50`. No nav, no logout button — those are in each page's own header.

---

## Data Flow: Server Components

Homepage example (`src/app/(store)/page.tsx`):

```
Request → Next.js RSC render → getData() → prisma.banner.findMany + prisma.category.findMany
                                          + prisma.product.findMany (featured) + prisma.product.findMany (new arrivals)
                            ← Returns 4 arrays ← Prisma (via PrismaPg adapter) ← Neon PostgreSQL
→ Props passed to HeroBanner, CategoryGrid, ProductCard, FeaturesStrip
→ HTML streamed to client
→ ISR: cached for 60 seconds, background revalidation on next request after 60s
```

All four queries run in parallel via `Promise.all`. No waterfall. The category page (`shop/[category]/page.tsx`) first fetches the parent category, then derives all slugs (parent + children), then queries products — this is a sequential dependency and cannot be parallelized.

---

## Cart Flow: Zustand → Checkout → API → DB

```
ProductCard.handleAddToCart()
  → useCart().addItem({ id, name, price, image })
    → if existing item: increment quantity
    → else: push new CartItem
    → set({ isOpen: true })  ← auto-opens CartDrawer
    → Zustand persist middleware writes to localStorage key 'montelle-cart'

CartDrawer
  → reads items, total(), calcShipping(subtotal)
  → Link href="/checkout" → closes drawer

CheckoutPage (client component)
  → reads useCart() (hydrated from localStorage)
  → if items.length === 0 && !done: router.push('/')
  → form submit:
      1. generateOrderNumber()  → "MT-J5ABCD-XYZ" format
      2. POST /api/orders  { orderNumber, customerName, customerPhone, city, address, notes,
                             subtotal, shipping, total, items: [{ productId, name, price, quantity, image }] }
      3. Prisma: order.create({ data: { ...header, items: { create: lineItems } } })
      4. 201 response → setDone(true), setOrderNum(number), clearCart()
         clearCart() → set({ items: [] }) → localStorage updated
```

The order number is generated on the **client** before the API call. This means if the API call fails and the user retries, a new order number is generated. There is no server-side order number deduplication beyond the `orderNumber` UNIQUE constraint.

---

## Image Flow: Upload → GitHub API → jsDelivr → CDN URL

This is the most operationally important flow in the system.

```
Admin selects file OR pastes URL in ImageUpload component
  → POST /api/admin/upload
    Auth guard: getAdminSession() — returns 401 if not logged in
    GITHUB_TOKEN check — returns 500 if env var missing

  [File path]
    formData.get('file') → File object
    file.arrayBuffer() → Buffer.from().toString('base64') → base64Content
    extension from file.name (jpeg normalized to jpg)

  [URL path]
    fetch(url) → arrayBuffer() → base64Content
    extension from URL pathname

  Filename: img_${Date.now()}.${extension}
  File path: public/images/products/${filename}

  GitHub REST API call:
    PUT https://api.github.com/repos/SherifAsh93/Montelle-Couture/contents/public/images/products/${filename}
    Headers: Authorization: token ${GITHUB_TOKEN}
             Accept: application/vnd.github.v3+json
    Body: { message: "upload product image: ...", content: base64Content, branch: "main" }

  On success:
    Returns { url: "https://cdn.jsdelivr.net/gh/SherifAsh93/Montelle-Couture@main/public/images/products/${filename}" }

Client receives CDN URL → appends to images array → stored in DB as Product.images[] string array
```

The CDN URL pattern `cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/public/images/products/...` means images are served from jsDelivr's global CDN and cached. After a GitHub push, jsDelivr may serve a stale version for up to 24 hours unless the `@main` reference is pinned — using `@main` means jsDelivr always serves the latest commit on main.

**Why GitHub instead of a proper CDN:** Avoids needing a separate storage service (S3, Cloudinary) and keeps all assets in the same repository as the code. The tradeoff is rate limits on the GitHub API and a dependency on the GITHUB_TOKEN not expiring.

---

## ISR Strategy: revalidate 60 vs force-dynamic

Pages with `export const revalidate = 60`:
- `src/app/(store)/page.tsx` (homepage)
- `src/app/(store)/shop/page.tsx`
- `src/app/(store)/shop/[category]/page.tsx`

This means Next.js builds a static HTML page, caches it for 60 seconds, and regenerates it in the background when a request arrives after 60 seconds has elapsed. This is Incremental Static Regeneration (ISR).

**Why not `force-dynamic`:** With `force-dynamic` every request hits Prisma + Neon on every page load. On Vercel's free/hobby tier this adds latency. ISR means the 60-second-old cached page is returned instantly for most visitors, and Neon only sees one query per 60s per page.

**Tradeoff:** Product or banner changes take up to 60 seconds to appear on the store. This is acceptable for this use case.

Admin pages are `'use client'` and fetch fresh data from API routes on every mount — they are never cached by ISR.

Product detail (`/products/[id]`) is a client component fetching via `fetch('/api/products/${id}')`. It is also not ISR; it re-fetches on every navigation to that page.

---

## Session Architecture

Session management lives entirely in `src/lib/session.ts`, marked `import 'server-only'` to prevent accidental import in client components.

**Token creation (`createAdminSession`):**
1. `new SignJWT({ role: 'ADMIN' }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('8h').sign(encodedKey)`
2. Cookie set: `admin_session`, `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'`, `maxAge: 28800` (8h in seconds), `path: '/'`

**Token verification (`getAdminSession`):**
1. Read `admin_session` cookie
2. `jwtVerify(raw, encodedKey, { algorithms: ['HS256'] })`
3. Check `payload.role === 'ADMIN'` — returns payload if valid, null otherwise
4. Entire function wrapped in try/catch — any error (expired, malformed, wrong key) returns null

**Logout (`deleteAdminSession`):**
- `cookieStore.delete('admin_session')`

The `SESSION_SECRET` must be at least 32 characters. It is encoded to `Uint8Array` once via `new TextEncoder().encode(secretKey)` and reused across calls.

---

## Why Prisma Over Raw SQL

The seed file (`prisma/seed.cjs`) uses raw `pg` queries because it runs as a CommonJS script before Prisma client is available and needs `ON CONFLICT` upsert syntax. All application code uses Prisma's generated client because:

1. Type-safe query results — `prisma.product.findMany` returns `Product[]` with full TypeScript types
2. Nested creates — `order.create({ data: { items: { create: [...] } } })` is impossible with raw SQL in one call
3. `include` for relations — `include: { category: { select: { name: true } } }` without writing JOINs
4. The generated client is output to `src/generated/prisma/` so it's co-located with app code and version-controlled

---

## Why Neon

Neon is a serverless PostgreSQL provider with:
- HTTP-based connection pooling compatible with Vercel's serverless functions (no persistent connections)
- Free tier sufficient for this scale
- Automatic scaling

The `PrismaPg` adapter from `@prisma/adapter-pg` connects using the standard `pg` Node.js driver to Neon's connection string. This is needed because Prisma 7 with PostgreSQL requires an explicit driver adapter rather than Prisma's own query engine.

---

## Why GitHub CDN

Three alternatives were considered:

| Option | Tradeoff |
|---|---|
| Vercel Blob / S3 | Requires paid service, additional env vars, more complex setup |
| Cloudinary | Free tier limits; already have `res.cloudinary.com` in next.config.ts remote patterns (future option) |
| GitHub + jsDelivr | Free, assets in same repo, global CDN, no extra billing |

The risk: GitHub API has a 1GB file size limit per file and rate limits of 5,000 requests/hour for authenticated requests. For a boutique store uploading ~10-50 product images, this is never a concern.
