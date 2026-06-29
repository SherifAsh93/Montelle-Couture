# 08 — API Reference

All routes are in `src/app/api/`. All responses are JSON. All admin routes require a valid `admin_session` cookie (set by `/api/admin/login`).

---

## Public Store API

### GET /api/products

Returns active products with optional filters.

**Auth:** None

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category slug (e.g. `robes`) |
| `featured` | `"1"` | If `"1"`, returns only featured products |
| `limit` | number | Maximum results; default `100` |

**Response `200`:**

```json
[
  {
    "id": "clxxx...",
    "name": "Lace Trim Bridal Robe",
    "description": "...",
    "price": 1200,
    "comparePrice": 1500,
    "images": ["https://cdn.jsdelivr.net/..."],
    "stock": 5,
    "featured": true,
    "active": true,
    "categoryId": "clyyy...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "category": { "name": "Robes", "slug": "robes" }
  }
]
```

**Side effects:** None

---

### GET /api/products/[id]

Returns a single product by CUID.

**Auth:** None

**Path:** `/api/products/clxxx...`

**Response `200`:**

```json
{
  "id": "clxxx...",
  "name": "Lace Trim Bridal Robe",
  "description": "...",
  "price": 1200,
  "comparePrice": null,
  "images": ["https://cdn.jsdelivr.net/..."],
  "stock": 5,
  "featured": false,
  "active": true,
  "categoryId": "clyyy...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "category": { "name": "Robes", "slug": "robes" }
}
```

**Response `404`:**

```json
{ "error": "Not found" }
```

---

### GET /api/categories

Returns top-level categories with their children.

**Auth:** None

**Response `200`:**

```json
[
  {
    "id": "clxxx...",
    "name": "Bridal Accessories",
    "slug": "bridal-accessories",
    "image": null,
    "parentId": null,
    "sortOrder": 4,
    "children": [
      {
        "id": "clyyy...",
        "name": "Veil",
        "slug": "accessories-veil",
        "image": null,
        "parentId": "clxxx...",
        "sortOrder": 1
      }
    ]
  }
]
```

**Note:** Only root categories (parentId null) are returned; children are nested under each parent.

---

### GET /api/banners

Returns active banners ordered by sortOrder.

**Auth:** None

**Response `200`:**

```json
[
  {
    "id": "clxxx...",
    "title": "For the Moments Before Forever",
    "subtitle": "Luxury bridal robes and veils",
    "image": "https://cdn.jsdelivr.net/...",
    "link": "/shop/robes",
    "active": true,
    "sortOrder": 0,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### POST /api/orders

Creates a new order with line items. Called by the checkout page.

**Auth:** None (public)

**Request Body:**

```json
{
  "orderNumber": "MT-LMABCD-XYZ",
  "customerName": "Jane Smith",
  "customerPhone": "+201234567890",
  "city": "Cairo",
  "address": "123 Main St, Apt 4",
  "notes": "Please wrap as a gift",
  "subtotal": 1200,
  "shipping": 0,
  "total": 1200,
  "items": [
    {
      "productId": "clxxx...",
      "name": "Lace Trim Bridal Robe",
      "price": 1200,
      "quantity": 1,
      "image": "https://cdn.jsdelivr.net/..."
    }
  ]
}
```

**Required fields:** `customerName`, `customerPhone`, `city`, `address`, `items` (non-empty array)

**Response `201`:** The created Order object (without items — top-level order fields only)

**Response `400`:**

```json
{ "error": "Missing required fields" }
```

**Side effects:** Creates `Order` row + `OrderItem` rows in a single Prisma transaction.

---

## Auth API

### POST /api/admin/login

**Auth:** None (this IS the auth endpoint)

**Request Body:**

```json
{ "password": "your_admin_password" }
```

**Response `200`:**

```json
{ "ok": true }
```

Sets `admin_session` cookie (httpOnly, secure in prod, sameSite lax, 8h expiry).

**Response `401`:**

```json
{ "error": "Invalid password" }
```

---

### POST /api/admin/logout

**Auth:** None (safe to call without session)

**Request Body:** None

**Response `200`:**

```json
{ "ok": true }
```

Deletes `admin_session` cookie.

---

## Admin Stats API

### GET /api/admin/stats

Also used by admin pages to probe authentication status on mount.

**Auth:** Required

**Response `200`:**

```json
{
  "products": 42,
  "orders": 18,
  "pendingOrders": 3,
  "revenue": 45600.00
}
```

- `products`: count of active products only
- `orders`: total count of all orders
- `pendingOrders`: count of orders with status PENDING
- `revenue`: sum of `total` for orders with status CONFIRMED, PROCESSING, SHIPPED, or DELIVERED

**Response `401`:**

```json
{ "error": "Unauthorized" }
```

---

## Admin Upload API

### POST /api/admin/upload

Uploads an image to GitHub and returns the jsDelivr CDN URL. Accepts either a file or a URL.

**Auth:** Required

**Request (file upload):**
- Content-Type: `multipart/form-data`
- Form field: `file` (File object)
- Accepted extensions: jpg, jpeg, png, webp (jpeg normalized to jpg)

**Request (URL):**
- Content-Type: `application/json`

```json
{ "url": "https://images.unsplash.com/photo-..." }
```

**Response `200`:**

```json
{
  "url": "https://cdn.jsdelivr.net/gh/SherifAsh93/Montelle-Couture@main/public/images/products/img_1234567890123.jpg",
  "filename": "img_1234567890123.jpg"
}
```

**Response `400`:**

```json
{ "error": "No file provided" }
// or
{ "error": "Failed to fetch image from URL" }
// or
{ "error": "Invalid URL or could not download image" }
```

**Response `401`:** `{ "error": "Unauthorized" }`

**Response `500`:**

```json
{ "error": "GITHUB_TOKEN not configured" }
// or
{ "error": "GitHub upload failed" }
```

**Side effects:** Creates a new file in `SherifAsh93/Montelle-Couture` repository at `public/images/products/img_{timestamp}.{ext}` on the `main` branch. Creates a git commit with message `"upload product image: {filename}"`.

---

## Admin Products API

### GET /api/admin/products

Returns ALL products (including inactive) with category names.

**Auth:** Required

**Response `200`:** Array of product objects with `category: { name: string } | null`

---

### POST /api/admin/products

Creates a new product.

**Auth:** Required

**Request Body:**

```json
{
  "name": "Silk Bridal Robe",
  "description": "Luxurious silk robe with lace trim",
  "price": 1200,
  "comparePrice": 1500,
  "stock": 10,
  "categoryId": "clxxx...",
  "featured": false,
  "active": true,
  "images": ["https://cdn.jsdelivr.net/..."]
}
```

**Response `201`:** Created product object

---

### DELETE /api/admin/products (bulk)

**Auth:** Required

**Request Body:**

```json
{ "ids": ["clxxx...", "clyyy..."] }
```

**Response `200`:** `{ "ok": true }`

---

### GET /api/admin/products/[id]

Returns single product with full category relation (not just name/slug).

**Auth:** Required

**Response `200`:** Product with `category: Category | null`

**Response `404`:** `{ "error": "Not found" }`

---

### PUT /api/admin/products/[id]

Updates any product fields.

**Auth:** Required

**Request Body:** Partial product fields (only fields to update)

```json
{
  "price": 1100,
  "active": false
}
```

**Response `200`:** Updated product object

---

### DELETE /api/admin/products/[id]

Hard deletes a single product.

**Auth:** Required

**Response `200`:** `{ "ok": true }`

**Warning:** Will fail if any OrderItem references this product (PostgreSQL RESTRICT by default). See the Database doc for details.

---

## Admin Orders API

### GET /api/admin/orders

Returns all orders (all statuses) ordered newest first, with all items included.

**Auth:** Required

**Response `200`:**

```json
[
  {
    "id": "clxxx...",
    "orderNumber": "MT-LMABCD-XYZ",
    "customerName": "Jane Smith",
    "customerPhone": "+201234567890",
    "city": "Cairo",
    "address": "123 Main St",
    "notes": null,
    "status": "PENDING",
    "subtotal": 1200,
    "shipping": 0,
    "total": 1200,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "items": [
      {
        "id": "clyyy...",
        "orderId": "clxxx...",
        "productId": "clzzz...",
        "name": "Lace Trim Bridal Robe",
        "price": 1200,
        "quantity": 1,
        "image": "https://cdn.jsdelivr.net/..."
      }
    ]
  }
]
```

---

### PUT /api/admin/orders/[id]

Updates order status only.

**Auth:** Required

**Request Body:**

```json
{ "status": "CONFIRMED" }
```

Valid values: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

**Response `200`:** Updated order object

---

### DELETE /api/admin/orders/[id]

Hard deletes order. Cascades to all OrderItems automatically.

**Auth:** Required

**Response `200`:** `{ "ok": true }`

---

## Admin Categories API

### GET /api/admin/categories

Returns all categories as a flat array with children nested and product counts.

**Auth:** Required

**Response `200`:**

```json
[
  {
    "id": "clxxx...",
    "name": "Bridal Accessories",
    "slug": "bridal-accessories",
    "image": null,
    "parentId": null,
    "sortOrder": 4,
    "_count": { "products": 12 },
    "children": [
      {
        "id": "clyyy...",
        "name": "Veil",
        "slug": "accessories-veil",
        "image": null,
        "parentId": "clxxx...",
        "sortOrder": 1
      }
    ]
  }
]
```

---

### POST /api/admin/categories

Creates a new category.

**Auth:** Required

**Request Body:**

```json
{
  "name": "Wedding Gowns",
  "slug": "wedding-gowns",
  "parentId": null,
  "sortOrder": 99
}
```

**Response `201`:** Created category object

---

### PUT /api/admin/categories/[id]

Updates a category (typically name and auto-generated slug).

**Auth:** Required

**Request Body:**

```json
{ "name": "Bridal Gowns", "slug": "bridal-gowns" }
```

**Response `200`:** Updated category object

---

### DELETE /api/admin/categories/[id]

Hard deletes a category. Products assigned to it have their `categoryId` set to null by PostgreSQL.

**Auth:** Required

**Response `200`:** `{ "ok": true }`

---

## Admin Banners API

### GET /api/admin/banners

Returns ALL banners (including inactive) ordered by sortOrder.

**Auth:** Required

**Response `200`:** Array of banner objects

---

### POST /api/admin/banners

Creates a new banner.

**Auth:** Required

**Request Body:**

```json
{
  "title": "New Collection",
  "subtitle": "Discover our latest arrivals",
  "image": "https://cdn.jsdelivr.net/...",
  "link": "/shop/robes",
  "active": true,
  "sortOrder": 0
}
```

**Response `201`:** Created banner object

---

### PUT /api/admin/banners/[id]

Updates a banner (any fields).

**Auth:** Required

**Request Body:** Partial banner fields

```json
{ "active": false }
```

**Response `200`:** Updated banner object

---

### DELETE /api/admin/banners/[id]

Hard deletes a banner.

**Auth:** Required

**Response `200`:** `{ "ok": true }`
