import Link from 'next/link'
import Image from 'next/image'

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.38 1.27-5.38s-.32-.65-.32-1.61c0-1.51.88-2.63 1.96-2.63.93 0 1.38.7 1.38 1.53 0 .94-.6 2.33-.9 3.62-.26 1.08.54 1.96 1.6 1.96 1.92 0 3.2-2.46 3.2-5.38 0-2.22-1.5-3.88-4.21-3.88-3.07 0-4.98 2.29-4.98 4.85 0 .88.26 1.5.66 1.97.18.22.21.3.14.55-.05.17-.16.58-.2.74-.06.24-.26.33-.47.24-1.32-.54-1.93-2-1.93-3.62 0-2.69 2.27-5.92 6.78-5.92 3.64 0 6.04 2.64 6.04 5.47 0 3.75-2.08 6.57-5.14 6.57-1.03 0-2-.55-2.33-1.18l-.65 2.48c-.19.72-.7 1.62-1.05 2.17A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.25 8.25 0 0 0 4.83 1.55V6.85a4.85 4.85 0 0 1-1.06-.16z"/>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-dark-900 text-cream-200">
      {/* Newsletter */}
      <div className="border-b border-dark-700 py-12 px-6 text-center">
        <p className="font-cormorant text-xl italic text-gold-300 mb-1">Join the Montelle World</p>
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
          <div className="mb-4">
            <Image src="/logo.jpeg" alt="Montelle Couture" width={80} height={64} className="object-contain opacity-90" />
          </div>
          <p className="text-[11px] text-cream-300 mt-2 leading-relaxed">
            Timeless elegance for the modern bride. Luxury bridal essentials crafted with love.
          </p>
          <div className="flex items-center gap-4 mt-5">
            <a href="#" aria-label="Instagram" className="text-cream-300 hover:text-gold-400 transition-colors">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="Pinterest" className="text-cream-300 hover:text-gold-400 transition-colors">
              <PinterestIcon />
            </a>
            <a href="#" aria-label="TikTok" className="text-cream-300 hover:text-gold-400 transition-colors">
              <TikTokIcon />
            </a>
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-gold-400 mb-4">Shop</p>
          <ul className="space-y-3">
            {[
              { label: 'All Products', href: '/shop' },
              { label: 'Robes', href: '/shop/robes' },
              { label: 'Veils', href: '/shop/accessories-veil' },
              { label: 'Corsets', href: '/shop/corsets' },
              { label: 'Dresses', href: '/shop/dresses' },
              { label: 'Gift Cards', href: '/shop' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-[12px] text-cream-300 hover:text-gold-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-gold-400 mb-4">Customer Care</p>
          <ul className="space-y-3 text-[12px] text-cream-300">
            <li className="hover:text-gold-400 transition-colors cursor-pointer">Shipping & Delivery</li>
            <li className="hover:text-gold-400 transition-colors cursor-pointer">Returns & Exchanges</li>
            <li className="hover:text-gold-400 transition-colors cursor-pointer">FAQs</li>
            <li className="hover:text-gold-400 transition-colors cursor-pointer">Care Instructions</li>
            <li className="hover:text-gold-400 transition-colors cursor-pointer">Contact Us</li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-gold-400 mb-4">Company</p>
          <ul className="space-y-3 text-[12px] text-cream-300">
            <li><Link href="/about" className="hover:text-gold-400 transition-colors">About Us</Link></li>
            <li><Link href="/about" className="hover:text-gold-400 transition-colors">Our Story</Link></li>
            <li className="hover:text-gold-400 transition-colors cursor-pointer">Privacy Policy</li>
            <li className="hover:text-gold-400 transition-colors cursor-pointer">Terms & Conditions</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dark-700 py-5 text-center">
        <p className="text-[10px] tracking-widest uppercase text-dark-700">
          ✦ © {new Date().getFullYear()} Montelle Couture. All rights reserved. ✦
        </p>
      </div>
    </footer>
  )
}
