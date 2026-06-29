# 03 — Tech Stack

## Production Dependencies

### Next.js 16.2.6

**Why this version:** Next.js 16 is the latest stable release. It brings React 19 support, improved `use()` hook for unwrapping Promises in client components (used in `products/[id]/page.tsx`: `const { id } = use(params)`), and App Router stability improvements.

**Key configuration in `next.config.ts`:**

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },      // jsDelivr CDN for product images
      { protocol: 'https', hostname: 'res.cloudinary.com' },    // future option
      { protocol: 'https', hostname: 'images.unsplash.com' },   // seed-products.cjs sample images
      { protocol: 'https', hostname: '**.githubusercontent.com' }, // raw GitHub content
    ],
  },
}
```

Without these entries, `next/image` refuses to optimize external images and throws at runtime.

**Dev server:** `next dev --port 3002` (not default 3000 — avoids collision with other projects).

---

### React 19.2.4

The `use()` hook is a React 19 feature used in the product page to unwrap async route params:

```typescript
// src/app/(store)/products/[id]/page.tsx
const { id } = use(params)  // params is Promise<{ id: string }> in Next.js 16
```

This replaces the older `params.id` direct access pattern from Next.js 14.

---

### TypeScript ^5

Standard Next.js TypeScript setup. Notable patterns:
- No explicit `paths` aliases in `tsconfig.json` beyond the default `@/*` → `./src/*` mapping
- `@/lib/prisma`, `@/store/cart`, etc. resolve via this alias

---

### Tailwind CSS v4 + @tailwindcss/postcss ^4

Tailwind v4 changes the configuration model significantly:
- No `tailwind.config.js` file exists — configuration lives in `globals.css` via `@theme { }` directive
- PostCSS plugin is `@tailwindcss/postcss` (not the old `tailwindcss` plugin)
- Custom tokens use CSS variable format: `--color-cream-50: #fdfaf6`
- Custom classes can reference these tokens as Tailwind utilities: `bg-cream-50`, `text-gold-600`, etc.

**Critical warning:** In Tailwind v4, unlayered CSS (written outside `@layer`) beats layered utilities in specificity. The `globals.css` comment explicitly warns against duplicating `box-sizing`, `margin`, `padding` resets for this reason.

---

### Prisma ^7.8.0 with @prisma/adapter-pg ^7.8.0 and pg ^8.21.0

**Why `@prisma/adapter-pg` instead of Prisma's default driver:**

Prisma 7 dropped its built-in query engine binary in favour of driver adapters. For PostgreSQL, you must provide `@prisma/adapter-pg`. The adapter wraps the standard `pg` Node.js driver.

**Setup in `prisma.ts`:**

```typescript
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}
```

**Singleton pattern:**

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

In development, Next.js hot-reloads modules but keeps `globalThis` alive. Without the singleton, each hot-reload would create a new PrismaClient and exhaust the Neon connection pool. In production this is not an issue because the module cache persists for the lifetime of the serverless function instance.

**Generated client location:**

The Prisma schema specifies `output = "../src/generated/prisma"`. This puts the generated client inside `src/` so it's tracked by git and can be imported with `@/generated/prisma/client`. This is deliberate: it avoids needing `prisma generate` for every cold deploy (though the build script does run it anyway).

**Prisma CLI scripts in `package.json`:**

```json
"db:generate": "prisma generate",
"db:push":    "prisma db push",
"db:studio":  "prisma studio"
```

---

### Jose ^6.2.3

**Why Jose instead of NextAuth or iron-session:**

- No OAuth providers needed — single admin password, no user accounts
- NextAuth adds significant complexity and requires a database adapter for session storage
- Jose is a JOSE (JSON Object Signing and Encryption) standards library — pure JavaScript, no native dependencies, works in Edge runtime
- Iron-session would work but Jose gives more explicit control over JWT claims and is lighter

**Usage:** Only `SignJWT` and `jwtVerify` from Jose are used. Algorithm: HS256. Secret: `SESSION_SECRET` env var encoded as `Uint8Array` via `TextEncoder`.

---

### Zustand ^5.0.13

**Why Zustand instead of React Context + useReducer:**

- Context causes re-renders of all consumers on every state change
- Cart state (items array, isOpen, total) changes frequently — every add/remove/quantity-update
- Zustand uses a subscription model; components only re-render when the specific slice they subscribe to changes
- The `persist` middleware handles localStorage serialization/deserialization automatically

**Cart store file is marked `'use client'`** — Zustand stores with `persist` cannot run on the server (no `localStorage`). The `'use client'` directive at the top of `src/store/cart.ts` ensures the module is never imported in server components.

---

### Sharp ^0.34.5

**Why Sharp is needed on Vercel:**

Next.js uses Sharp for server-side image optimization (the `next/image` component). Vercel's build environment does not include Sharp by default for Node.js runtimes. Without it in `dependencies` (not `devDependencies`), `next/image` optimization silently falls back to lower quality or errors at runtime.

Sharp must be in `dependencies` (not `devDependencies`) to be included in the production bundle.

---

### lucide-react ^1.16.0

Icon library used throughout. All icons are imported as named exports:

```typescript
import { ShoppingBag, Search, Menu, X, Calendar } from 'lucide-react'  // Navbar
import { Heart, Gem, Globe, Gift } from 'lucide-react'  // FeaturesStrip
import { Upload, Link2, X, Plus } from 'lucide-react'   // ImageUpload
import { Package, ShoppingBag, LayoutGrid, Image, LogOut, TrendingUp, Clock } from 'lucide-react'  // Admin dashboard
```

Icons are used with `size={N}` prop. No global icon configuration.

---

### server-only ^0.0.1

The `server-only` package, when imported, throws a build error if the importing module is ever bundled for the client. Used in `src/lib/session.ts`:

```typescript
import 'server-only'
```

This prevents the JWT secret and cookie manipulation code from ever reaching the browser bundle.

---

## Dev Dependencies

| Package | Purpose |
|---|---|
| `@tailwindcss/postcss ^4` | PostCSS plugin for Tailwind v4 |
| `@types/node ^20` | Node.js type definitions |
| `@types/react ^19` | React 19 type definitions |
| `@types/react-dom ^19` | ReactDOM type definitions |
| `dotenv ^17.4.2` | Used by `prisma.config.ts` (`import 'dotenv/config'`) to load `.env.local` for CLI commands |
| `eslint ^9` | Linting |
| `eslint-config-next 16.2.6` | Next.js ESLint preset |
| `typescript ^5` | TypeScript compiler |

---

## Build Script Dissection

```json
"build": "prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build"
```

**Step 1: `prisma generate`**
Regenerates `src/generated/prisma/` from `prisma/schema.prisma`. Ensures the Prisma client matches the current schema before the build reads any Prisma types.

**Step 2: `prisma db push --accept-data-loss`**
Pushes schema changes directly to the Neon database without a migration file. `--accept-data-loss` is required when a change would cause data loss (e.g., removing a column, changing a type). This is safe for this project because the schema is stable and product data is managed through the admin, not migrations.

**Warning about `--accept-data-loss`:** If you rename a column, `db push` drops the old column and creates the new one — existing data in that column is silently destroyed. Only use `db push` when you understand the diff or are working on a fresh database.

**Step 3: `node prisma/seed.cjs`**
Runs the category seed. This upserts the category hierarchy on every build. It does NOT touch products, orders, or banners. Safe to run repeatedly because all inserts use `ON CONFLICT (slug) DO UPDATE`.

**Step 4: `next build`**
Standard Next.js production build. Generates static pages for ISR routes.

---

## `prisma.config.ts`

```typescript
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env['DATABASE_URL'] },
})
```

`import 'dotenv/config'` loads `.env.local` when running Prisma CLI commands locally, so `DATABASE_URL` is available without manually setting environment variables. On Vercel this file is not executed during build — Vercel injects environment variables directly.
