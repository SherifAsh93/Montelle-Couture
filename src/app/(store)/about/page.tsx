import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Our Story | Montelle Couture' }

export default function AboutPage() {
  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="py-20 px-6 text-center bg-cream-100 border-b border-cream-200">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 mb-4">✦ Our Story ✦</p>
        <h1 className="font-cormorant text-5xl md:text-6xl text-dark-900 mb-6 leading-tight">
          Crafted with Love,<br /><em>Made for Forever</em>
        </h1>
        <div className="w-16 h-[1px] bg-gold-400 mx-auto mb-8" />
        <p className="text-sm text-dark-700 leading-relaxed max-w-xl mx-auto">
          Montelle Couture was born from a passion for timeless elegance and the belief that every bride
          deserves to feel extraordinary in every moment — before, during, and long after the celebration.
        </p>
      </section>

      {/* Story section */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-5">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600">Who We Are</p>
          <h2 className="font-cormorant text-4xl text-dark-900 leading-tight">
            Where Every Detail<br />Tells Your Story
          </h2>
          <div className="w-10 h-[1px] bg-gold-400" />
          <p className="text-sm text-dark-700 leading-relaxed">
            Each piece in the Montelle Couture collection is thoughtfully designed and handcrafted with the finest
            materials — from delicate veils and luxurious robes to beautifully structured corsets and flowing gowns.
          </p>
          <p className="text-sm text-dark-700 leading-relaxed">
            We celebrate the moments before forever, because those quiet details — the robe you slip into on your wedding
            morning, the veil that frames your face — matter just as much as the day itself.
          </p>
          <Link href="/shop"
            className="inline-block border border-dark-900 text-dark-900 text-[10px] tracking-widest uppercase px-8 py-4 hover:bg-dark-900 hover:text-cream-50 transition-all duration-300 mt-2">
            Explore the Collection
          </Link>
        </div>
        <div className="h-96 bg-cream-200 rounded-sm overflow-hidden flex items-center justify-center relative">
          <Image src="/logo.jpeg" alt="Montelle Couture" fill className="object-contain p-8 opacity-60" />
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-100 border-y border-cream-200 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 mb-3">✦</p>
          <h2 className="font-cormorant text-4xl text-dark-900">Our Promise to You</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { title: 'Handmade', sub: 'Every piece is crafted by hand with care and precision.' },
            { title: 'Premium Fabrics', sub: 'We source only the finest silks, laces, and satins.' },
            { title: 'Custom Orders', sub: 'Your vision, brought to life with a personal touch.' },
            { title: 'Luxury Packaging', sub: 'A gifting experience as beautiful as the piece itself.' },
          ].map(({ title, sub }) => (
            <div key={title} className="text-center space-y-3">
              <div className="w-10 h-[1px] bg-gold-400 mx-auto" />
              <p className="font-cormorant text-xl text-dark-900">{title}</p>
              <p className="text-[11px] text-dark-700 leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Appointment */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 mb-4">✦ Get in Touch ✦</p>
        <h2 className="font-cormorant text-4xl text-dark-900 mb-4">Book an Appointment</h2>
        <p className="text-sm text-dark-700 leading-relaxed mb-10 max-w-md mx-auto">
          We would love to help you find the perfect piece for your most unforgettable moments.
          Reach out to us and we will be in touch within 24 hours.
        </p>
        <form className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase text-dark-700 block mb-1.5">Your Name</label>
              <input type="text" placeholder="Full name" required
                className="w-full border border-cream-300 px-4 py-3 text-sm text-dark-900 bg-cream-50 focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase text-dark-700 block mb-1.5">Phone Number</label>
              <input type="tel" placeholder="+20 xxx xxx xxxx" required
                className="w-full border border-cream-300 px-4 py-3 text-sm text-dark-900 bg-cream-50 focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-dark-700 block mb-1.5">Message</label>
            <textarea rows={4} placeholder="Tell us what you are looking for..." required
              className="w-full border border-cream-300 px-4 py-3 text-sm text-dark-900 bg-cream-50 focus:outline-none focus:border-gold-500 transition-colors resize-none" />
          </div>
          <button type="submit"
            className="w-full bg-dark-900 text-cream-50 py-4 text-[11px] tracking-widest uppercase font-montserrat font-medium hover:bg-dark-800 transition-colors">
            Send Message
          </button>
        </form>
      </section>
    </div>
  )
}
