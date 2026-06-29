# 06 — Backend Patterns

## API Route Structure

### Public Store API (no auth)

| Route | Method | Description |
|---|---|---|
| `/api/products` | GET | List active products, optional filters |
| `/api/products/[id]` | GET | Single product by ID |
| `/api/categories` | GET | Top-level categories with children |
| `/api/banners` | GET | Active banners ordered by sortOrder |
| `/api/orders` | POST | Create new order (public checkout) |

### Admin API (requires session)

| Route | Methods | Description |
|---|---|---|
| `/api/admin/login` | POST | Verify password → set JWT cookie |
| `/api/admin/logout` | POST | Delete JWT cookie |
| `/api/admin/stats` | GET | Dashboard stats (also used as auth probe) |
| `/api/admin/upload` | POST | Upload image to GitHub → return CDN URL |
| `/api/admin/products` | GET, POST, DELETE | List all / create / bulk delete |
| `/api/admin/products/[id]` | GET, PUT, DELETE | Get / update / delete single |
| `/api/admin/orders` | GET | List all orders with items |
| `/api/admin/orders/[id]` | PUT, DELETE | Update status / delete |
| `/api/admin/categories` | GET, POST | List tree / create |
| `/api/admin/categories/[id]` | PUT, DELETE | Update / delete |
| `/api/admin/banners` | GET, POST | List all / create |
| `/api/admin/banners/[id]` | PUT, DELETE | Update / delete |

---

## Session Guard Pattern

Every admin API route starts with the same two lines:

```typescript
const session = await getAdminSession()
if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

`getAdminSession()` is imported from `@/lib/session` (a server-only module). It reads the `admin_session` cookie, verifies the JWT signature with HS256, checks that `payload.role === 'ADMIN'`, and returns the payload on success or null on any failure.

The only admin route that does NOT check session is `/api/admin/login` (because the session doesn't exist yet) and `/api/admin/logout` (which just deletes the cookie regardless).

**Why client pages also probe `stats`:**

Admin pages (`'use client'`) cannot use server-only session checking. They probe `/api/admin/stats` on mount — if it returns 401, they redirect to `/admin`. This is a second layer of protection but the primary protection is always the API route guard.

---

## Prisma Singleton Pattern

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Why `globalThis`:** In development, Next.js hot-reloads individual modules when files change but keeps the global object alive across reloads. Without storing the client on `globalThis`, each reload creates a new `PrismaClient` → new connection pool → Neon connection limit is hit quickly.

**In production:** Module cache is long-lived (serverless function stays warm), so `globalForPrisma.prisma` is never written. Each new serverless instance creates one PrismaClient and keeps it for its lifetime.

**The `as unknown as { prisma: PrismaClient }` cast:** TypeScript doesn't know about this custom property on `globalThis`. The double cast satisfies the type checker without adding unnecessary type declarations.

---

## GitHub CDN Upload Flow

Complete implementation in `src/app/api/admin/upload/route.ts`:

```typescript
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = 'SherifAsh93/Montelle-Couture'
const BRANCH = 'main'
const BASE_PATH = 'public/images/products'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`
```

### File Upload Path

1. Parse `multipart/form-data` via `req.formData()`
2. Get `formData.get('file')` as `File` object
3. Normalize extension: `jpeg → jpg`, discard non-image extensions, default to `jpg`
4. `file.arrayBuffer()` → `Buffer.from(bytes).toString('base64')` → `base64Content`

### URL Upload Path

1. `req.json()` → `{ url }`
2. `fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })` — User-Agent header avoids 403 from some CDNs
3. `imgRes.arrayBuffer()` → `Buffer.from(bytes).toString('base64')` → `base64Content`

### GitHub API Call

```typescript
const filename = `img_${Date.now()}.${extension}`
const filePath = `${BASE_PATH}/${filename}`  // public/images/products/img_1234567890.jpg

await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
  method: 'PUT',
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  },
  body: JSON.stringify({
    message: `upload product image: ${originalName || filename}`,
    content: base64Content,
    branch: BRANCH,
  }),
})
```

### Response

```json
{ "url": "https://cdn.jsdelivr.net/gh/SherifAsh93/Montelle-Couture@main/public/images/products/img_1234567890.jpg", "filename": "img_1234567890.jpg" }
```

The client appends this URL to the images array and stores it in the database.

---

## Order Creation with Nested Create

The public order creation route (`POST /api/orders`):

```typescript
// src/app/api/orders/route.ts
const order = await prisma.order.create({
  data: {
    orderNumber,      // client-generated: "MT-J5ABCD-XYZ"
    customerName,
    customerPhone,
    city,
    address,
    notes,
    subtotal,
    shipping,
    total,
    items: {
      create: items.map((i: { productId: string; name: string; price: number; quantity: number; image?: string }) => ({
        productId: i.productId,
        name: i.name,      // snapshot — NOT a foreign key lookup
        price: i.price,    // snapshot — locked at order time
        quantity: i.quantity,
        image: i.image,    // snapshot — CDN URL at time of order
      })),
    },
  },
})
```

This is one Prisma `create` call that creates the `Order` row and all `OrderItem` rows in a single database transaction. If any item insert fails, the entire operation rolls back.

**Why price snapshots in OrderItem:** The product's price may change after the order is placed. By copying `name`, `price`, and `image` into `OrderItem` at order time, the admin always sees what the customer actually ordered at the price they paid — not the current product data.

---

## Admin Login Flow

```typescript
// POST /api/admin/login
const { password } = await req.json()
if (password !== process.env.ADMIN_PASSWORD) {
  return Response.json({ error: 'Invalid password' }, { status: 401 })
}
await createAdminSession()
return Response.json({ ok: true })
```

`createAdminSession()` (from `src/lib/session.ts`):
1. Creates JWT: `{ role: 'ADMIN' }` with `HS256`, `setIssuedAt()`, `setExpirationTime('8h')`
2. Signs with `new TextEncoder().encode(process.env.SESSION_SECRET!)`
3. Sets cookie: `admin_session`, `httpOnly: true`, `secure: true (prod)`, `sameSite: 'lax'`, `maxAge: 28800`, `path: '/'`

**On the client (`src/app/admin/page.tsx`):**
```typescript
const res = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password }),
})
if (res.ok) {
  setAuthed(true)
  fetch('/api/admin/stats').then((r) => r.json()).then(setStats)
}
else setError('Incorrect password')
```

---

## Logout

```typescript
// POST /api/admin/logout
await deleteAdminSession()
return Response.json({ ok: true })
```

`deleteAdminSession()` calls `cookieStore.delete('admin_session')`. The cookie is removed; any subsequent admin API call returns 401.

**On the client:**
```typescript
async function handleLogout() {
  await fetch('/api/admin/logout', { method: 'POST' })
  setAuthed(false)
  setStats(null)
}
```

---

## Stats Aggregation

```typescript
// GET /api/admin/stats
const [products, orders, pendingOrders] = await Promise.all([
  prisma.product.count({ where: { active: true } }),
  prisma.order.count(),
  prisma.order.count({ where: { status: 'PENDING' } }),
])

const revenue = await prisma.order.aggregate({
  _sum: { total: true },
  where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
})

return Response.json({
  products,
  orders,
  pendingOrders,
  revenue: revenue._sum.total ?? 0
})
```

Three count queries run in parallel. The aggregate runs sequentially after (no strict reason it couldn't be in the `Promise.all` too). Revenue excludes `PENDING` (unconfirmed) and `CANCELLED` orders — only counts orders that are being processed or have been delivered.

`revenue._sum.total ?? 0` handles the case where no qualifying orders exist (Prisma returns `null` for empty aggregations).

---

## Admin API: Product Routes

### GET /api/admin/products

Returns all products (including inactive) with category name. Unlike the public route which filters `active: true`, the admin sees everything.

### POST /api/admin/products

```typescript
const body = await req.json()
const product = await prisma.product.create({ data: body })
```

The body is passed directly to `prisma.product.create`. Field validation is on the client (required name and price check). The Prisma schema defines default values for `stock` (0), `featured` (false), `active` (true).

### DELETE /api/admin/products (bulk)

```typescript
const { ids } = await req.json()
await prisma.product.deleteMany({ where: { id: { in: ids } } })
```

### PUT /api/admin/products/[id]

```typescript
const body = await req.json()
const product = await prisma.product.update({ where: { id }, data: body })
```

Also passes body directly to Prisma update. Handles partial updates because Prisma `update` only touches fields present in `data`.

---

## Admin API: Category Routes

GET returns the full tree with children and product counts:

```typescript
prisma.category.findMany({
  orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  include: {
    children: { orderBy: { sortOrder: 'asc' } },
    _count: { select: { products: true } },
  },
})
```

Double `orderBy` array: first sort by `sortOrder`, then within same `sortOrder` alphabetically by `name`.

When a category is deleted with `prisma.category.delete`, products assigned to it have their `categoryId` set to null because the schema defines `categoryId` as nullable (`String?`). No cascade is configured on the Category side of the Product relation.

The admin categories page shows the confirm dialog: "Delete this category? Products will be unassigned." This is accurate.

---

## Admin API: Order Routes

Admin orders list includes items:

```typescript
prisma.order.findMany({
  orderBy: { createdAt: 'desc' },
  include: { items: true },
})
```

Status update only accepts the `status` field:

```typescript
const { status } = await req.json()
const order = await prisma.order.update({ where: { id }, data: { status } })
```

Order deletion cascades to OrderItems because `OrderItem.order` has `onDelete: Cascade`:

```prisma
order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
```

When an Order is deleted, all its OrderItems are automatically deleted by the database. No `deleteMany` on items needed.
