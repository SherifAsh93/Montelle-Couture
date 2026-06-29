# 07 — Database

## Prisma Schema Overview

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

**Generator:** `provider = "prisma-client"` is the Prisma 7 new-style generator (previously `"prisma-client-js"`). Output goes to `../src/generated/prisma` — relative to the `prisma/` folder, this resolves to `src/generated/prisma/`.

**Datasource:** No `url` in the schema file itself — it's provided via `prisma.config.ts` at runtime from `DATABASE_URL` env var.

---

## Model: Category

```prisma
model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  image     String?
  parentId  String?
  sortOrder Int        @default(0)
  parent    Category?  @relation("SubCategories", fields: [parentId], references: [id])
  children  Category[] @relation("SubCategories")
  products  Product[]
}
```

### Field Descriptions

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key, auto-generated via `cuid()` |
| `name` | String | Display name, e.g. "Bridal Accessories" |
| `slug` | String (UNIQUE) | URL-safe identifier, e.g. "bridal-accessories" |
| `image` | String? | CDN URL or null; optional — fallback gradient used when null |
| `parentId` | String? | Null for top-level categories; FK to self for subcategories |
| `sortOrder` | Int | Controls display order (ascending); default 0 |
| `parent` | Category? | Self-relation back to parent |
| `children` | Category[] | Self-relation list of subcategories |
| `products` | Product[] | Products assigned to this category |

### Self-Referential Relationship

The `"SubCategories"` named relation allows a category to be both a parent and a child. The naming is required by Prisma when a model relates to itself to disambiguate which side of the relation you're on.

**Hierarchy in practice (from seed.cjs):**

```
Maternity Wear (top-level, sortOrder: 1)
Robes (top-level, sortOrder: 2)
Bridal Clothes (top-level, sortOrder: 3)
  └ Pants (child, sortOrder: 1)
  └ Skirts (child, sortOrder: 2)
  └ Shirts (child, sortOrder: 3)
Bridal Accessories (top-level, sortOrder: 4)
  └ Veil (child, sortOrder: 1)
  └ Banner (child, sortOrder: 2)
  └ Face Cover (child, sortOrder: 3)
  └ Bags (child, sortOrder: 4)
  └ Gloves (child, sortOrder: 5)
Corsets (top-level, sortOrder: 5)
Dresses (top-level, sortOrder: 6)
  └ Long Dress (child, sortOrder: 1)
  └ Short Dress (child, sortOrder: 2)
```

The category page query handles the hierarchy by collecting all slugs (parent + all children) and querying products matching any of them:

```typescript
const allSlugs = [cat.slug, ...cat.children.map((c) => c.slug)]
const products = await prisma.product.findMany({
  where: { active: true, category: { slug: { in: allSlugs } } },
})
```

---

## Model: Product

```prisma
model Product {
  id           String      @id @default(cuid())
  name         String
  description  String?
  price        Float
  comparePrice Float?
  images       String[]
  stock        Int         @default(0)
  featured     Boolean     @default(false)
  active       Boolean     @default(true)
  categoryId   String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  category     Category?   @relation(fields: [categoryId], references: [id])
  orderItems   OrderItem[]
}
```

### Field Descriptions

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `name` | String | Product display name |
| `description` | String? | Long-form text, markdown not used |
| `price` | Float | Current selling price in EGP |
| `comparePrice` | Float? | Original price for showing discounts; null = no sale |
| `images` | String[] | Array of CDN URLs; first element is the main image |
| `stock` | Int | Inventory count; 0 = "Out of Stock" on product page |
| `featured` | Boolean | If true, appears in "Featured Pieces" on homepage |
| `active` | Boolean | If false, hidden from all public routes |
| `categoryId` | String? | FK to Category; null = uncategorized |
| `createdAt` | DateTime | Auto-set at creation, used for "New Arrivals" ordering |
| `updatedAt` | DateTime | Auto-updated by Prisma on any change |

### Discount Calculation

Used in `ProductCard` and product detail page:

```typescript
const discount = product.comparePrice
  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
  : 0
```

If `comparePrice` is set and greater than `price`, the discount percentage badge appears. No enforcement that `comparePrice > price` — that's left to the admin's judgment.

---

## Model: Order

```prisma
model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  customerName  String
  customerPhone String
  city          String
  address       String
  notes         String?
  status        OrderStatus @default(PENDING)
  subtotal      Float
  shipping      Float       @default(0)
  total         Float
  items         OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### Field Descriptions

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `orderNumber` | String (UNIQUE) | Human-readable e.g. "MT-J5ABCD-XYZ"; client-generated |
| `customerName` | String | Full name |
| `customerPhone` | String | No format validation in schema |
| `city` | String | Egyptian city |
| `address` | String | Street/building/apartment |
| `notes` | String? | Optional special instructions |
| `status` | OrderStatus | Enum; default PENDING |
| `subtotal` | Float | Sum of item prices before shipping |
| `shipping` | Float | 0 if subtotal >= 800, else 60 |
| `total` | Float | subtotal + shipping |
| `createdAt` | DateTime | Order timestamp |
| `updatedAt` | DateTime | Last status change timestamp |

### OrderNumber Format

Generated in `src/lib/utils.ts`:

```typescript
export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase()  // base-36 timestamp
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase()  // 3 random chars
  return `MT-${ts}-${rand}`  // e.g. MT-LMABCD-XYZ
}
```

`Date.now()` gives milliseconds since epoch. `.toString(36)` converts to base-36 (0-9, a-z) giving a compact string. `.toUpperCase()` for readability. The random suffix prevents collisions if two orders arrive in the same millisecond.

---

## Model: OrderItem

```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  name      String
  price     Float
  quantity  Int
  image     String?
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}
```

### Field Descriptions

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `orderId` | String | FK to Order; cascade delete |
| `productId` | String | FK to Product; NO cascade |
| `name` | String | Snapshot of product name at order time |
| `price` | Float | Snapshot of product price at order time |
| `quantity` | Int | Number of units ordered |
| `image` | String? | Snapshot of first product image URL at order time |

### Snapshot Pattern (Denormalization)

`name`, `price`, and `image` are copied from the Product into the OrderItem at creation time. This is intentional denormalization:

- If the product's price changes after the order is placed, the historical order shows the correct price
- If the product is deleted, the order line items still show what was ordered
- The `productId` FK is kept for potential future use (analytics, re-order functionality) but is not required for order display

**Risk:** If a product is deleted, `productId` becomes an orphaned FK. Prisma does not define `onDelete` on `product Product @relation(...)`, which means the database default applies. PostgreSQL default is `RESTRICT` — it will PREVENT product deletion if any OrderItem references it. This could be a bug: admins trying to delete a product that has ever been ordered will get a database error.

---

## Model: Banner

```prisma
model Banner {
  id        String   @id @default(cuid())
  title     String
  subtitle  String?
  image     String
  link      String?
  active    Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
}
```

### Field Descriptions

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `title` | String | Large text shown on banner overlay |
| `subtitle` | String? | Smaller text below title; optional |
| `image` | String | CDN URL; required (banner without image is unusable) |
| `link` | String? | Where "Discover" CTA links; defaults to `/shop` if null |
| `active` | Boolean | If false, excluded from public banner query |
| `sortOrder` | Int | Controls display order in carousel |
| `createdAt` | DateTime | Creation timestamp (no `updatedAt` — banners are recreated, not updated) |

---

## OrderStatus Enum

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

All caps, matching PostgreSQL enum convention. In TypeScript, referenced as string literals in queries:

```typescript
where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } }
```

**Status flow (informal):**

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                   ↘ CANCELLED
```

No enforcement — any transition is allowed from the admin dropdown.

---

## Naming Conventions

| Convention | Applied To | Examples |
|---|---|---|
| CUID | All primary keys (`@id @default(cuid())`) | `id` on all models |
| camelCase | All field names | `customerName`, `comparePrice`, `sortOrder`, `createdAt` |
| PascalCase | Model names | `Category`, `Product`, `Order`, `OrderItem`, `Banner` |
| UPPER_CASE | Enum values | `PENDING`, `CONFIRMED`, `OrderStatus` |
| lowercase | Provider name | `postgresql` |

---

## Idempotent Seed Strategy

The `prisma/seed.cjs` file uses raw SQL with `ON CONFLICT (slug) DO UPDATE` to make every category insert idempotent:

```sql
INSERT INTO "Category" (id, name, slug, "sortOrder")
VALUES ($1, $2, $3, $4)
ON CONFLICT (slug) DO UPDATE SET name=$2, "sortOrder"=$4
```

**What this means:**
- First build: inserts all categories
- Second build: updates name and sortOrder if slug already exists, creates if new slug
- No data loss: existing products, orders, and banners are untouched
- The CUID `id` generated for new rows differs on each conflict — the `ON CONFLICT` branch reuses the existing row's `id`

The seed uses `crypto.randomUUID()` (Node.js built-in) to generate IDs, not `cuid()`. Since CUIDs and UUIDs are both valid as strings, this works fine.

**Child categories:** After upserting each parent, the script SELECTs the parent's actual `id` (`SELECT id FROM "Category" WHERE slug=$1`) and uses it as `parentId` for children. This handles both insert and conflict scenarios correctly.

---

## Index Strategy

Prisma `db push` creates the following indexes automatically from schema annotations:

- `Category.slug` — `@unique` creates a unique index (also used for fast upsert lookups)
- `Order.orderNumber` — `@unique` creates a unique index

No explicit `@@index` directives are defined. For the scale of this boutique store (hundreds to low thousands of products), this is sufficient.

---

## Migration Approach

This project uses `prisma db push` (schema push) rather than `prisma migrate dev` (migration files).

**`db push` characteristics:**
- Syncs schema to database without creating migration files
- `--accept-data-loss` allows destructive changes (column drops, type changes)
- No migration history tracked in `prisma/migrations/`
- Suitable for projects where the schema is still evolving and rollback is not needed

**Implications for production:**
- If you rename a column, the old data is lost (the old column is dropped, new one created empty)
- If you add a non-nullable column without a default, `db push` may fail unless you add `@default(...)` to the schema first
- No rollback capability — if a bad schema change goes to production, manual database intervention is needed

**When to switch to migrations:** If the database contains critical customer data that cannot be lost, switch to `prisma migrate dev` for local development and `prisma migrate deploy` in the build script. This maintains a full history of schema changes and allows safe rollbacks.
