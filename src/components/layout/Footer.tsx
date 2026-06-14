import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-dark-900 text-cream-200">
      {/* Newsletter */}
      <div className="border-b border-dark-700 py-12 px-6 text-center">
        <p className="font-cormorant text-xl italic text-gold-300 mb-1">Join the Montelle Couture World</p>
        <p className="text-[11px] tracking-widest uppercase text-cream-300 mb-6">Be the first to know about new collections & exclusive offers</p>
        <form className="flex max-w-md mx-auto gap-0">
          <input type="email" placeholder="Enter your email" required
            className="flex-1 bg-dark-800 border border-dark-700 border-r-0 px-4 py-3 text-sm text-cream-100 placeholder-dark-700 focus:outline-none focus:border-gold-500" />
          <button type="submit"
            className="bg-gold-500 hover:bg-gold-600 text-dark-900 px-6 py-3 text-[10px] tracking-widest uppercase font-montserrat font-medium transition-colors">
            Subscribe
          </button>
        </form>
      </div>

      {/* Links grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <span className="font-cormorant text-2xl tracking-[0.2em] text-cream-100 font-light uppercase">Montelle Couture</span>
          <p className="text-[11px] text-cream-300 mt-3 leading-relaxed">
            Timeless elegance for the modern bride. Luxury bridal essentials crafted with love.
          </p>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-gold-400 mb-4">Shop</p>
          <ul className="space-y-3">
            {['Maternity Wear', 'Robes', 'Bridal Clothes', 'Bridal Accessories', 'Corsets', 'Dresses'].map((item) => (
              <li key={item}>
                <Link href={`/shop/${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-[12px] text-cream-300 hover:text-gold-400 transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-gold-400 mb-4">Customer Care</p>
          <ul className="space-y-3 text-[12px] text-cream-300">
            <li>Shipping & Delivery</li>
            <li>Returns & Exchanges</li>
            <li>FAQs</li>
            <li>Care Instructions</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-gold-400 mb-4">Company</p>
          <ul className="space-y-3 text-[12px] text-cream-300">
            <li><Link href="/about" className="hover:text-gold-400 transition-colors">About Us</Link></li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dark-700 py-5 text-center">
        <p className="text-[10px] tracking-widest uppercase text-dark-700">
          © {new Date().getFullYear()} Montelle Couture. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
