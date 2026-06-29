# 09 — Development Workflow

## Environment Variables

All must be set in `.env.local` for local development, and in the Vercel project's Environment Variables for production.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string, e.g. `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `SESSION_SECRET` | Yes | Minimum 32 characters. Used as the HMAC key for HS256 JWT signing. Generate with: `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Yes | Plaintext password for the admin login form. No hashing — store a strong random value. |
| `GITHUB_TOKEN` | Yes for uploads | GitHub Personal Access Token (PAT) with `repo` scope (write access to `SherifAsh93/Montelle-Couture`). Without this, all image uploads return 500. |

**Example `.env.local`:**

```
DATABASE_URL="postgresql://montelle:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET="your-32-char-minimum-random-secret-here"
ADMIN_PASSWORD="your-admin-password"
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## Local Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with all 4 required variables

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to database (creates tables)
npm run db:push

# 5. Seed category hierarchy
node prisma/seed.cjs

# 6. (Optional) Seed sample products
node prisma/seed-products.cjs

# 7. Start development server
npm run dev
```

**Dev server:** `http://localhost:3002`

**Admin panel:** `http://localhost:3002/admin` (or triple-click the logo on any store page)

---

## Dev Server

```json
"dev": "next dev --port 3002"
```

Port 3002 is hardcoded to avoid collision with other local projects. If 3002 is occupied, change the `--port` value.

Next.js dev server features:
- Hot Module Replacement (HMR) for client components
- Fast Refresh for React state preservation across edits
- Server components re-execute on browser refresh (no HMR for RSC)
- Route handler changes require a browser refresh

---

## Prisma Workflow

### Generating the Client

After modifying `prisma/schema.prisma`:

```bash
npm run db:generate
# runs: prisma generate
```

This regenerates `src/generated/prisma/`. **Do this before running the dev server after schema changes**, otherwise the TypeScript types will be stale.

### Pushing Schema to Database

```bash
npm run db:push
# runs: prisma db push
```

Without `--accept-data-loss`. If the push would cause data loss (dropping columns), it will ask for confirmation. Use this for safe changes.

For destructive changes you understand:

```bash
npx prisma db push --accept-data-loss
```

### Seeding Categories

```bash
node prisma/seed.cjs
```

Safe to run any time — idempotent. Will update names/sortOrder but not create or delete products.

### Seeding Sample Products

```bash
node prisma/seed-products.cjs
```

Adds sample products with Unsplash images. NOT idempotent — running it twice creates duplicate products. Only run on a fresh database.

### Opening Prisma Studio

```bash
npm run db:studio
# runs: prisma studio
```

Opens a GUI at `http://localhost:5555` to browse and edit database records directly. Useful for debugging data issues.

---

## GitHub Token Requirement for Image Uploads

The `GITHUB_TOKEN` must be a GitHub PAT (Personal Access Token) with the `repo` scope. To generate:

1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → check `repo` scope → copy the `ghp_xxx` value
3. Add to `.env.local` as `GITHUB_TOKEN="ghp_xxx..."`
4. On Vercel: Project Settings → Environment Variables → add `GITHUB_TOKEN`

**Token expiry:** Classic PATs can be set to no expiry. If the token expires, all image uploads will return `500 GitHub upload failed`. Products can still be created without images, but images cannot be added.

**Testing uploads locally:** The upload route works in development — it will actually push files to the GitHub repository. Use a test repository or a development branch to avoid polluting production images during development.

---

## Vercel Deployment

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod
```

Or push to the `main` branch of the GitHub repository if Vercel is connected via Git integration (recommended).

**Build command on Vercel:** `npm run build` which runs:

```
prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build
```

**Output directory:** `.next` (Vercel detects automatically)

**Framework preset:** Next.js (Vercel detects automatically)

**Important:** All 4 environment variables (`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `GITHUB_TOKEN`) must be configured in Vercel project settings before deploying. A build without `DATABASE_URL` will fail at `prisma db push`. A build without `SESSION_SECRET` or `ADMIN_PASSWORD` will succeed but the admin panel won't work.

---

## How to Add a New Product Field

Example: adding a `material` field (string, optional) to Product.

**Step 1: Update schema**

```prisma
model Product {
  // ... existing fields ...
  material String?  // add this
}
```

**Step 2: Regenerate Prisma client**

```bash
npm run db:generate
```

**Step 3: Push to database**

```bash
npm run db:push
```

The new nullable column is added to the `Product` table without data loss.

**Step 4: Update the admin form (`src/app/admin/products/new/page.tsx` and `src/app/admin/products/[id]/page.tsx`)**

Add to the `form` state:
```typescript
const [form, setForm] = useState({
  // ...existing fields...
  material: '',
})
```

Add the form field:
```tsx
<div>
  <label className="text-[10px] tracking-widest uppercase text-gray-600 block mb-1.5">Material</label>
  <input type="text" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}
    className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gold-500 transition-colors" />
</div>
```

Add to the submit payload:
```typescript
body: JSON.stringify({
  // ...existing fields...
  material: form.material || null,
})
```

**Step 5: Update the product type definition in client components**

In `ProductCard.tsx`, `products/[id]/page.tsx`, and any other component that displays the field, add `material?: string | null` to the local `type Product` definition.

**Step 6: Display in store if needed**

In `src/app/(store)/products/[id]/page.tsx`, add the field to the displayed info block.

**Step 7: Update API route types if needed**

The admin products routes (`/api/admin/products`) pass `body` directly to Prisma — no type annotation change needed there. The public products route returns Prisma's full object, so the new field will be included automatically.

---

## How to Add a New Admin Section

Example: adding a "Reviews" section.

**Step 1: Add Prisma model**

```prisma
model Review {
  id        String   @id @default(cuid())
  productId String
  author    String
  text      String
  rating    Int      @default(5)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  product   Product  @relation(fields: [productId], references: [id])
}
```

Update Product to include the relation:
```prisma
model Product {
  // ...
  reviews Review[]
}
```

**Step 2: Run generate and push**

```bash
npm run db:generate && npm run db:push
```

**Step 3: Create API routes**

```
src/app/api/admin/reviews/route.ts      → GET (list), POST (create)
src/app/api/admin/reviews/[id]/route.ts → PUT, DELETE
```

Follow the exact same pattern as existing admin routes: session guard at top, Prisma call, JSON response.

**Step 4: Create admin page**

```
src/app/admin/reviews/page.tsx
```

Follow the existing pattern: `'use client'`, `useEffect` to probe stats for auth, fetch data from API, render UI.

**Step 5: Add to dashboard navigation**

In `src/app/admin/page.tsx`, add to the `NAV` array:
```typescript
{ label: 'Reviews', href: '/admin/reviews', icon: Star, desc: 'Manage product reviews' }
```

Import `Star` from `lucide-react`.

---

## Vercel Environment Variable Sync

If `.env.local` is out of sync with Vercel, use the Vercel CLI:

```bash
# Pull env vars from Vercel to local
vercel env pull

# This creates/updates .env.local with values from Vercel
```

**Note:** Vercel's pulled `.env.local` will contain placeholder values for secrets — you'll need to add the real `GITHUB_TOKEN` and other secrets manually since Vercel masks them when pulling.
