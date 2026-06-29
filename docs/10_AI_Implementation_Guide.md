# 10 — AI Implementation Guide

This document tells any future agent or developer exactly how to continue this project safely. Every rule traces to actual code.

---

## Architecture Rules

### Rule 1: Always use ISR (revalidate 60), never force-dynamic on store pages

```typescript
// CORRECT — all public store pages use this
export const revalidate = 60

// WRONG — do not add this to store pages
export const dynamic = 'force-dynamic'
```

**Why:** `force-dynamic` causes every page request to hit Neon over the network. With ISR, cached HTML is served for 60 seconds and Neon only gets one query per 60s. On Vercel's serverless infrastructure, cold-start + DB query latency adds 400-800ms per request without ISR. For a boutique store with infrequent catalog changes, 60s staleness is acceptable.

**Exception:** Admin pages are already `'use client'` and fetch fresh data on every mount — they are not affected by ISR at all.

---

### Rule 2: Always use nested `create` (not `createMany`) for order creation

```typescript
// CORRECT
prisma.order.create({
  data: {
    ...orderHeader,
    items: {
      create: lineItems,  // single atomic transaction
    },
  },
})

// WRONG — two separate calls, not atomic
const order = await prisma.order.create({ data: orderHeader })
await prisma.orderItem.createMany({ data: lineItems.map(i => ({ ...i, orderId: order.id })) })
```

**Why:** If the second call fails, you'd have an Order with no items. The nested `create` wraps both in a single transaction — if item creation fails, the order is rolled back.

---

### Rule 3: Always snapshot prices (name, price, image) in OrderItem

```typescript
// CORRECT — copies data at order time
items: {
  create: items.map(i => ({
    productId: i.productId,
    name: i.name,      // snapshot
    price: i.price,    // snapshot
    quantity: i.quantity,
    image: i.image,    // snapshot
  })),
}

// WRONG — storing only the FK and looking up at display time
items: {
  create: items.map(i => ({
    productId: i.productId,
    quantity: i.quantity,
  })),
}
```

**Why:** Product prices change. If you store only `productId` and look up the current price at display time, the order history shows the wrong price. The snapshot is the historical record of what the customer paid.

---

### Rule 4: Always use the session guard at the top of every admin API route

```typescript
// CORRECT — first two lines of every admin route handler
const session = await getAdminSession()
if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

No exceptions. Even for GET routes that seem harmless. The admin order list includes customer names and phone numbers — it must be protected.

---

### Rule 5: Never import session.ts in client components

```typescript
// src/lib/session.ts starts with:
import 'server-only'
```

Attempting to import `session` in a `'use client'` file will throw a build error:
```
Error: This module cannot be imported from a Client Component module.
```

Client components check auth by probing `/api/admin/stats` — they do not touch session functions directly.

---

### Rule 6: Always run `prisma generate` before running the app after schema changes

After editing `prisma/schema.prisma`:

```bash
npm run db:generate  # MUST run this first
npm run db:push      # then push to DB
npm run dev          # then start app
```

If you skip `db:generate`, TypeScript will have type errors on new fields, and Prisma queries using the new fields will fail at runtime with obscure errors.

---

### Rule 7: Always clear cart after successful order

```typescript
// src/app/(store)/checkout/page.tsx
if (res.ok) {
  setOrderNum(number)
  clearCart()         // MUST do this
  setDone(true)
}
```

`clearCart()` sets `items: []` in Zustand and persists to localStorage. If you omit this:
- The cart drawer still shows old items
- The user can accidentally re-submit the same order
- The localStorage entry remains stale indefinitely

---

## Implementation Checklist for New Features

When adding any new feature, go through this checklist:

**Database changes:**
- [ ] Added field/model to `prisma/schema.prisma`
- [ ] Ran `npm run db:generate`
- [ ] Ran `npm run db:push`
- [ ] Verified no data loss for existing records

**API routes:**
- [ ] Admin routes have session guard as first two lines
- [ ] Public routes return only what's necessary (use `select` to limit fields)
- [ ] Error responses use appropriate HTTP status codes (400 for bad input, 401 for unauth, 404 for not found, 500 for server errors)
- [ ] Prisma queries include relevant relations via `include`

**Client components:**
- [ ] New component is `'use client'` if it uses any hooks or browser APIs
- [ ] Loading state is shown while fetching (gold spinner pattern)
- [ ] Empty state is handled (never blank — use a descriptive message)
- [ ] Error state is handled (inline `setError` state pattern)

**Admin pages:**
- [ ] Auth probe on mount: `fetch('/api/admin/stats').then(r => { if (!r.ok) router.push('/admin') })`
- [ ] Added to admin dashboard `NAV` array in `src/app/admin/page.tsx`

**Store pages:**
- [ ] `export const revalidate = 60` present on all server component pages
- [ ] Fallback/empty state handled with luxury aesthetic

**Images:**
- [ ] Uses `next/image` with `fill` (for containers with fixed aspect ratio) or explicit `width/height`
- [ ] All external image domains added to `next.config.ts` `remotePatterns`

---

## Common Mistakes

### Mistake 1: Missing GITHUB_TOKEN

**Symptom:** Image uploads return `{ "error": "GITHUB_TOKEN not configured" }` or `{ "error": "GitHub upload failed" }` with status 500.

**Fix:** Add `GITHUB_TOKEN` to `.env.local` and to Vercel environment variables. The token needs `repo` scope. Test: try uploading an image in the admin panel → if it succeeds, the token is working.

---

### Mistake 2: Forgetting `prisma generate` before querying new fields

**Symptom:** TypeScript errors like `Property 'material' does not exist on type 'Product'` after adding a schema field.

**Fix:** Run `npm run db:generate`. The error is in the generated types, not your code.

---

### Mistake 3: Not clearing cart after order

**Symptom:** After checkout, the cart still shows the ordered items. User can navigate back and resubmit.

**Fix:** Call `clearCart()` from `useCart()` in the success branch of the checkout form submit handler.

---

### Mistake 4: Adding an external image domain without updating next.config.ts

**Symptom:** `next/image` throws `Error: Invalid src ... hostname "..." is not configured under images in your next.config.ts`.

**Fix:** Add the hostname to `remotePatterns` in `next.config.ts` and restart the dev server.

---

### Mistake 5: Using `force-dynamic` on a store page that doesn't need real-time data

**Symptom:** Page feels slow, especially on cold starts. Neon connection count spikes under traffic.

**Fix:** Switch to `export const revalidate = 60` (or another appropriate number of seconds). Only use `force-dynamic` if the page truly must show real-time data on every request.

---

### Mistake 6: Running `seed-products.cjs` twice

**Symptom:** Admin product list shows duplicate products with identical names.

**Fix:** Delete duplicates via the admin panel. The seed products script is NOT idempotent — it runs raw inserts without conflict handling. Only run it on a fresh database.

---

### Mistake 7: Deploying without setting all env vars on Vercel

**Symptom:** Build fails at `prisma db push` (missing `DATABASE_URL`), or admin login doesn't work (missing `SESSION_SECRET` or `ADMIN_PASSWORD`), or image uploads fail (missing `GITHUB_TOKEN`).

**Fix:** Vercel project settings → Environment Variables → add all four: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `GITHUB_TOKEN`.

---

### Mistake 8: Deleting a product that has been ordered

**Symptom:** Prisma throws `Foreign key constraint failed on the field: 'productId'` when deleting a product.

**Cause:** The `OrderItem.product` relation uses the default PostgreSQL `RESTRICT` delete behavior — you cannot delete a product if any OrderItem references it.

**Fix options:**
1. First delete or reassign all orders containing the product
2. Or change the schema to add `onDelete: SetNull` on the `product` relation in `OrderItem` (requires `productId` to be nullable: `productId String?`)
3. Or soft-delete by setting `active: false` instead of hard-deleting

---

## Code Patterns to Replicate

### Session Guard (copy exactly for new admin routes)

```typescript
import { getAdminSession } from '@/lib/session'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // your logic here
}
```

### Order Number Generation

```typescript
// src/lib/utils.ts — already exported, just import and call
import { generateOrderNumber } from '@/lib/utils'

const orderNumber = generateOrderNumber()  // "MT-LMABCD-XYZ"
```

### Cart Persistence

Zustand's `persist` middleware handles this automatically. Adding a new field to the cart:

```typescript
// Add to CartItem type
type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string  // new optional field
}
```

The persist middleware will merge the stored object with defaults. New fields added to existing items will be `undefined` until the item is re-added to cart.

### Loading Spinner (standard pattern)

```tsx
<div className="flex justify-center py-20">
  <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
</div>
```

### Inline Error Display

```tsx
const [error, setError] = useState('')

// In form handler:
setError('')
// ... on failure:
setError(data.error || 'Something went wrong')

// In JSX:
{error && <p className="text-red-500 text-sm">{error}</p>}
```

### Admin Page Auth Probe

```typescript
useEffect(() => {
  fetch('/api/admin/stats').then((r) => {
    if (!r.ok) router.push('/admin')
  })
}, [router])
```

### Client-Side Prisma-Style Type (matches API response shape)

```typescript
type Product = {
  id: string
  name: string
  price: number
  comparePrice?: number | null
  images: string[]
  stock: number
  featured: boolean
  active: boolean
  categoryId?: string | null
  createdAt: string  // ISO string in JSON (not Date object)
  category?: { name: string; slug: string } | null
}
```

Note `createdAt: string` not `Date` — JSON serialization converts DateTime to ISO string.

---

## Things That Break If Done Wrong

### Seeding on every build — risk

The build script runs `node prisma/seed.cjs` on every Vercel deployment. This is intentional and safe because:
- The seed uses `ON CONFLICT (slug) DO UPDATE` — idempotent for categories
- It does NOT touch products, orders, or banners

**What would break it:** If you add a category to the seed with a slug that conflicts with a user-created category that has the same slug but different data, the seed will overwrite the admin's custom name/sortOrder. Keep seeded slugs in the seed file and user-created slugs in the admin panel.

### `--accept-data-loss` on every build — risk

`prisma db push --accept-data-loss` runs on every Vercel deployment. If you add a schema change that drops a column, production data in that column is silently destroyed the next time you deploy.

**Mitigation:** Before deploying any schema change, review the diff that `db push` would apply by running `prisma db push --dry-run` locally first (note: `--dry-run` may not be available in all Prisma versions — use `prisma migrate diff` instead to preview changes).

### `SESSION_SECRET` rotation — risk

If you change `SESSION_SECRET`, all existing admin sessions are immediately invalidated (existing cookies fail `jwtVerify`). Admin users are logged out. This is expected behavior but must be communicated if rotating the secret in production.

### GitHub token expiry — cascade failure

If `GITHUB_TOKEN` expires, the entire image upload flow fails with 500. Products can still be created (by omitting images or pasting CDN URLs that already exist), but no new images can be added. Monitor token expiry dates or use tokens with no expiry.

### CartDrawer and MobileBottomNav must stay in (store)/layout.tsx

Both components need to be outside `<main>` and available on every store page. If you move CartDrawer inside a specific page, it won't be available on other pages. If you remove MobileBottomNav from the layout, mobile users lose the bottom navigation entirely.

### The `pb-16 md:pb-0` on `<main>` must match MobileBottomNav height

```tsx
// (store)/layout.tsx
<main className="pb-16 md:pb-0">{children}</main>
```

`pb-16` = 64px = h-16. MobileBottomNav is implicitly `h-16` from its `py-3` padding + icon/label content. If MobileBottomNav height changes (e.g., larger icons), this padding must be updated or content will scroll behind the nav bar on mobile.
