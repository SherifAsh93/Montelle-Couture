import { Heart, Gem, Globe, Gift } from 'lucide-react'

const features = [
  { icon: Heart, label: 'Handmade', sub: 'With Love' },
  { icon: Gem, label: 'Premium', sub: 'Quality Fabrics' },
  { icon: Globe, label: 'Worldwide', sub: 'Shipping' },
  { icon: Gift, label: 'Luxury', sub: 'Packaging' },
]

export function FeaturesStrip() {
  return (
    <section className="border-y border-cream-200 py-8 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-4 gap-4">
        {features.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2">
            <div className="w-9 h-9 rounded-full border border-gold-400 flex items-center justify-center">
              <Icon size={15} className="text-gold-600" />
            </div>
            <div>
              <p className="font-montserrat text-[9px] tracking-widest uppercase text-dark-900 font-medium leading-tight">{label}</p>
              <p className="font-montserrat text-[9px] tracking-widest uppercase text-dark-700 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
