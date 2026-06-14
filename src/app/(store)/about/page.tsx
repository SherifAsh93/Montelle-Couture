export const metadata = { title: 'About | Montelle Couture' }

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 mb-4">✦</p>
      <h1 className="font-cormorant text-5xl text-dark-900 mb-6">Our Story</h1>
      <div className="w-12 h-[1px] bg-gold-400 mx-auto mb-8" />
      <p className="text-sm text-dark-700 leading-relaxed max-w-xl mx-auto mb-6">
        Montelle Couture was born from a passion for timeless elegance and the belief that every bride deserves to feel extraordinary.
        Each piece in our collection is thoughtfully designed and handcrafted with the finest materials.
      </p>
      <p className="text-sm text-dark-700 leading-relaxed max-w-xl mx-auto">
        From luxurious bridal robes to intricate accessories, we celebrate the moments before forever —
        because the details matter just as much as the day itself.
      </p>
    </div>
  )
}
