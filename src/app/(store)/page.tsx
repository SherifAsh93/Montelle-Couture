import { prisma } from '@/lib/prisma'
import { HeroBanner } from '@/components/store/HeroBanner'
import { CategoryGrid } from '@/components/store/CategoryGrid'
import { ProductCard } from '@/components/store/ProductCard'
import { FeaturesStrip } from '@/components/store/FeaturesStrip'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

async function getData() {
  const [banners, categories, featured, newArrivals] = await Promise.all([
    prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({ where: { featured: true, active: true }, take: 8, orderBy: { createdAt: 'desc' }, include: { category: { select: { name: true } } } }),
    prisma.product.findMany({ where: { active: true }, take: 8, orderBy: { createdAt: 'desc' }, include: { category: { select: { name: true } } } }),
  ])
  return { banners, categories, featured, newArrivals }
}

export default async function HomePage() {
  const { banners, categories, featured, newArrivals } = await getData()

  return (
    <>
      <HeroBanner banners={banners} />

      <FeaturesStrip />

      <CategoryGrid categories={categories} />

      {/* Brand story strip */}
      <section className="py-16 px-4 bg-cream-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600">Crafted with Love</p>
            <h2 className="font-cormorant text-4xl md:text-5xl text-dark-900 leading-tight">
              Made for your most<br />unforgettable moments
            </h2>
            <div className="w-12 h-[1px] bg-gold-400" />
            <p className="text-sm text-dark-700 leading-relaxed max-w-sm">
              Each piece is thoughtfully designed and handcrafted with the finest materials to celebrate your unique story.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-gold-700 hover:text-gold-600 transition-colors mt-2">
              Our Story →
            </Link>
          </div>
          <div className="h-80 md:h-96 bg-gradient-to-br from-cream-200 to-cream-300 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-5 border border-cream-300 pointer-events-none" />
            <Image src="/logo.jpeg" alt="" width={160} height={128} className="object-contain opacity-20" />
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 mb-1">✦</p>
              <h2 className="font-cormorant text-3xl md:text-4xl text-dark-900">Featured Pieces</h2>
            </div>
            <Link href="/shop" className="text-[10px] tracking-widest uppercase text-dark-700 hover:text-gold-600 transition-colors border-b border-dark-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 mb-1">✦</p>
              <h2 className="font-cormorant text-3xl md:text-4xl text-dark-900">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-[10px] tracking-widest uppercase text-dark-700 hover:text-gold-600 transition-colors border-b border-dark-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  )
}
