import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/store/ProductCard'

export const revalidate = 60

async function getData(cat?: string) {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(cat ? { category: { slug: cat } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } },
    }),
  ])
  return { categories, products }
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams
  const { categories, products } = await getData(cat)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="font-cormorant text-4xl md:text-5xl text-dark-900">All Collections</h1>
        <p className="text-[11px] tracking-widest uppercase text-dark-700 mt-2">{products.length} pieces</p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <a href="/shop"
          className={`text-[10px] tracking-widest uppercase px-5 py-3 border transition-colors ${!cat ? 'bg-dark-900 text-cream-50 border-dark-900' : 'border-cream-300 text-dark-700 hover:border-dark-900'}`}>
          All
        </a>
        {categories.map((c) => (
          <a key={c.id} href={`/shop?cat=${c.slug}`}
            className={`text-[10px] tracking-widest uppercase px-5 py-3 border transition-colors ${cat === c.slug ? 'bg-dark-900 text-cream-50 border-dark-900' : 'border-cream-300 text-dark-700 hover:border-dark-900'}`}>
            {c.name}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-cormorant text-3xl text-dark-700 italic">No products yet</p>
          <p className="text-[11px] tracking-widest uppercase text-dark-700 mt-2">Check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
