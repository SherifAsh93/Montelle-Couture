import Image from 'next/image'
import Link from 'next/link'

type Category = { id: string; name: string; slug: string; image?: string | null }

// Warm champagne-gold tones — all within brand palette, visually varied
const FALLBACK_GRADIENTS = [
  'from-[#d4c4a0] to-[#a89060]',
  'from-[#c8b88a] to-[#9c8050]',
  'from-[#d8c8a4] to-[#b09870]',
  'from-[#c4b48a] to-[#988462]',
  'from-[#ccbc98] to-[#a8906a]',
  'from-[#d0c09c] to-[#aa9468]',
]

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const display = categories.slice(0, 6)

  if (display.length === 0) return null

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-montserrat text-[9px] tracking-[0.5em] uppercase text-gold-600 mb-3">✦</p>
        <h2 className="font-cormorant text-4xl md:text-5xl text-dark-900">Shop by Category</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {display.map((cat, i) => (
          <Link key={cat.id} href={`/shop/${cat.slug}`}
            className="group relative overflow-hidden aspect-[4/5] cursor-pointer block">
            {cat.image ? (
              <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]} transition-transform duration-700 group-hover:scale-105`} />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-dark-900/25 group-hover:bg-dark-900/45 transition-colors duration-400" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4">
              <div className="w-6 h-px bg-cream-50/70" />
              <p className="font-cormorant text-lg md:text-xl text-cream-50 tracking-wide text-center leading-tight">
                {cat.name}
              </p>
              <p className="font-montserrat text-[8px] md:text-[9px] tracking-[0.35em] uppercase text-gold-300 group-hover:text-gold-200 transition-colors">
                Explore
              </p>
              <div className="w-6 h-px bg-cream-50/70" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
