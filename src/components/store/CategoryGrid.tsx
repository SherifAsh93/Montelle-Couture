import Image from 'next/image'
import Link from 'next/link'

type Category = { id: string; name: string; slug: string; image?: string | null }

// Warm champagne-to-gold tones, lighter so text reads without heavy overlay
const FALLBACK_GRADIENTS = [
  'from-[#e8dcc4] to-[#c8a870]',
  'from-[#e0d4b8] to-[#c0a060]',
  'from-[#ecddc8] to-[#ccac78]',
  'from-[#e4d8c0] to-[#c4a46a]',
  'from-[#e8dcc4] to-[#c8aa72]',
  'from-[#e2d6bc] to-[#c2a26c]',
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

            {/* Overlay — keep light so gradient warmth shows through */}
            <div className="absolute inset-0 bg-dark-900/10 group-hover:bg-dark-900/30 transition-colors duration-300" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4">
              <div className="w-6 h-px bg-dark-900/40" />
              <p className="font-cormorant text-lg md:text-2xl text-dark-900 tracking-wide text-center leading-tight drop-shadow-sm">
                {cat.name}
              </p>
              <p className="font-montserrat text-[8px] md:text-[9px] tracking-[0.35em] uppercase text-gold-700 group-hover:text-dark-900 transition-colors">
                Explore
              </p>
              <div className="w-6 h-px bg-dark-900/40" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
