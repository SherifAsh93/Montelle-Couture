# 04 — Coding Standards

## TypeScript Patterns

### `type` vs `interface`

The codebase uses `type` aliases exclusively for all data shapes. No `interface` declarations appear anywhere in the source.

```typescript
// Pattern used throughout
type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  // ...
}
```

Local component prop types are also `type`:

```typescript
type Product = {
  id: string
  name: string
  price: number
  comparePrice?: number | null
  images: string[]
  featured?: boolean
  category?: { name: string } | null
}

export function ProductCard({ product }: { product: Product }) { ... }
```

The `?` modifier is used for optional fields; `| null` for fields that can be explicitly null (matching Prisma's nullable return types where the field is optional in the schema).

### Utility Types

`Omit<CartItem, 'quantity'>` is used in the `addItem` function signature because the caller doesn't supply quantity (it defaults to 1). This is the only mapped type in use.

---

## No Validation Library

There is no Zod, Yup, Joi, or similar validation library. All validation is manual if-checks:

**API routes:**

```typescript
// src/app/api/orders/route.ts
if (!customerName || !customerPhone || !city || !address || !items?.length) {
  return Response.json({ error: 'Missing required fields' }, { status: 400 })
}
```

**Client forms:**

```typescript
// src/app/admin/products/new/page.tsx
if (!form.name || !form.price) {
  setError('Name and price are required')
  return
}
```

**Numeric conversions are explicit:**

```typescript
price: parseFloat(form.price),
comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
stock: parseInt(form.stock) || 0,
```

The `|| 0` fallback handles empty string input for stock — parseInt('') is NaN, so `NaN || 0` yields 0.

---

## Error Handling

### API Routes: Inline Response

Errors are returned as JSON with appropriate status codes. No try/catch wrapper around Prisma calls in most routes — unhandled Prisma errors bubble up to Next.js's error boundary and return a 500.

```typescript
// Standard pattern
const session = await getAdminSession()
if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

The upload route is the exception — it wraps the URL fetch in try/catch because external URLs can fail:

```typescript
try {
  const imgRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!imgRes.ok) return Response.json({ error: 'Failed to fetch image from URL' }, { status: 400 })
  // ...
} catch {
  return Response.json({ error: 'Invalid URL or could not download image' }, { status: 400 })
}
```

### Client Components: Inline `setError` State

```typescript
const [error, setError] = useState('')

async function handleSubmit(e: React.FormEvent) {
  setError('')
  // ...
  if (!res.ok) {
    const d = await res.json()
    setError(d.error || 'Failed to save')
  }
}

// Rendered:
{error && <p className="text-red-500 text-sm">{error}</p>}
```

No toast library, no global error boundary for normal user-facing errors. Errors are shown inline near the form.

### Session Function: Silent Null

`getAdminSession()` catches all JWT errors and returns null — it never throws:

```typescript
export async function getAdminSession() {
  try {
    // ...
    return payload.role === 'ADMIN' ? payload : null
  } catch {
    return null  // expired, malformed, wrong key — all treated the same
  }
}
```

---

## Import Patterns

All internal imports use the `@/` alias resolving to `src/`:

```typescript
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { useCart } from '@/store/cart'
import { formatPrice, calcShipping } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/ImageUpload'
```

External packages are imported from their package names without aliases. Named imports are preferred over default imports for external packages:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
```

---

## Client vs Server Component Rules

### Server Components (no `'use client'` directive)

- `src/app/(store)/page.tsx` — queries Prisma directly
- `src/app/(store)/shop/page.tsx` — queries Prisma directly
- `src/app/(store)/shop/[category]/page.tsx` — queries Prisma directly
- `src/app/(store)/layout.tsx` — imports client components but is itself a server component
- `src/app/(store)/about/page.tsx` — static content + metadata export
- `src/components/layout/AnnouncementBar.tsx` — pure display, no hooks
- `src/components/layout/Footer.tsx` — pure display, no hooks
- `src/components/store/CategoryGrid.tsx` — pure display, no hooks
- `src/components/store/FeaturesStrip.tsx` — pure display, no hooks

### Client Components (`'use client'` at top)

- `src/app/(store)/products/[id]/page.tsx` — uses `useState`, `useEffect`, `use(params)`
- `src/app/(store)/checkout/page.tsx` — uses `useState`, `useCart`, `useRouter`
- All `src/app/admin/**/*.tsx` pages — fetch on mount, manage state
- `src/components/layout/Navbar.tsx` — `useState`, `useEffect`, `useRef`, `useCallback`
- `src/components/layout/MobileBottomNav.tsx` — `usePathname`, `useCart`
- `src/components/store/HeroBanner.tsx` — `useState`, `useEffect` (auto-rotate)
- `src/components/store/CartDrawer.tsx` — `useCart`
- `src/components/store/ProductCard.tsx` — `useCart`
- `src/components/admin/ImageUpload.tsx` — `useState`, `useRef`, fetch calls
- `src/components/ui/Button.tsx` — event handlers possible
- `src/store/cart.ts` — Zustand with persist (localStorage)

### The Rule

A component must be `'use client'` if it uses any of:
- React hooks (`useState`, `useEffect`, `useRef`, `useCallback`, `useContext`)
- Navigation hooks (`useRouter`, `usePathname`, `useSearchParams`)
- Custom hooks that use the above
- Browser APIs (`localStorage`, `window`, `document`)
- Event handlers (only if the component is at the top of a tree — child event handlers passed as props work in server components)

---

## Naming Conventions

### Files

- PascalCase for React components: `ProductCard.tsx`, `CartDrawer.tsx`, `ImageUpload.tsx`
- camelCase for utilities and stores: `prisma.ts`, `session.ts`, `utils.ts`, `cart.ts`
- kebab-case for route segments: `[category]/page.tsx`, `[id]/page.tsx`, `seed.cjs`, `seed-products.cjs`

### Functions

- PascalCase for React components: `export function ProductCard(...)`, `export function CartDrawer(...)`
- camelCase for all other functions: `createAdminSession`, `getAdminSession`, `formatPrice`, `calcShipping`, `generateOrderNumber`
- camelCase for Zustand actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `openCart`, `closeCart`

### Types

- PascalCase for named types: `CartItem`, `CartStore`, `Product`, `Banner`, `Order`, `OrderItem`, `Category`
- Types defined inline at component scope are local-only; they don't need to be re-exported unless shared

### Constants

- SCREAMING_SNAKE_CASE for module-level constants:

```typescript
// src/lib/utils.ts
export const SHIPPING_COST = 60
export const FREE_SHIPPING_THRESHOLD = 800
export const CURRENCY = 'EGP'
export const SITE_NAME = 'Montelle Couture'

// src/app/api/admin/upload/route.ts
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = 'SherifAsh93/Montelle-Couture'
const BRANCH = 'main'
const BASE_PATH = 'public/images/products'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`
```

---

## Prisma Query Patterns

### findMany with include

```typescript
// Products with category name and slug
prisma.product.findMany({
  where: { active: true },
  take: 8,
  orderBy: { createdAt: 'desc' },
  include: { category: { select: { name: true, slug: true } } },
})

// Categories with children and product count
prisma.category.findMany({
  orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  include: {
    children: { orderBy: { sortOrder: 'asc' } },
    _count: { select: { products: true } },
  },
})

// Orders with all items (admin)
prisma.order.findMany({
  orderBy: { createdAt: 'desc' },
  include: { items: true },
})
```

`select` inside `include` reduces payload size (only fetch what's needed). `_count` is Prisma's aggregation shortcut for counting related records.

### create with nested createMany

Order creation uses `create` with nested `create` (not `createMany`):

```typescript
prisma.order.create({
  data: {
    orderNumber,
    customerName,
    customerPhone,
    city,
    address,
    notes,
    subtotal,
    shipping,
    total,
    items: {
      create: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
    },
  },
})
```

This is a single atomic database operation — the order and all items are created in one transaction managed by Prisma.

### update single field

```typescript
// Toggle product active status
prisma.product.update({ where: { id }, data: { active: !product.active } })

// Update order status
prisma.order.update({ where: { id }, data: { status } })
```

### deleteMany for bulk operations

```typescript
prisma.product.deleteMany({ where: { id: { in: ids } } })
```

### aggregate for revenue

```typescript
prisma.order.aggregate({
  _sum: { total: true },
  where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
})
// Access: revenue._sum.total ?? 0
```

Revenue excludes PENDING and CANCELLED orders. The `?? 0` handles the case where no matching orders exist and `_sum.total` is null.

---

## The `cn` Utility

```typescript
// src/lib/utils.ts
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
```

A minimal class name joiner. Used in `Button.tsx` for conditional class merging. No dependency on `clsx` or `tailwind-merge`. Works for the use cases in this codebase because there are no conflicting Tailwind utility classes that need deduplication.
