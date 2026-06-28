'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Search, Menu, X, Calendar } from 'lucide-react'
import { useCart } from '@/store/cart'
import { useRef, useState, useEffect, useCallback } from 'react'

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/about' },
]

// Desktop secondary bar — 6 items matching the design mockup
const SECONDARY_LINKS = [
  { label: 'Veils', href: '/shop/accessories-veil' },
  { label: 'Robes', href: '/shop/robes' },
  { label: 'Corsets', href: '/shop/corsets' },
  { label: 'Bridal Sets', href: '/shop/bridal-clothes' },
  { label: 'Gift Cards', href: '/shop' },
  { label: 'Custom Orders', href: '/about' },
]

// Mobile drawer — all categories
const ALL_CATEGORY_LINKS = [
  { label: 'Veils', href: '/shop/accessories-veil' },
  { label: 'Robes', href: '/shop/robes' },
  { label: 'Corsets', href: '/shop/corsets' },
  { label: 'Bridal Sets', href: '/shop/bridal-clothes' },
  { label: 'Dresses', href: '/shop/dresses' },
  { label: 'Accessories', href: '/shop/bridal-accessories' },
  { label: 'Gift Cards', href: '/shop' },
  { label: 'Custom Orders', href: '/about' },
]

export function Navbar() {
  const router = useRouter()
  const { count, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const logoClickCount = useRef(0)
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Single click → home. Triple click within 800 ms → admin.
  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    logoClickCount.current += 1
    if (logoTimer.current) clearTimeout(logoTimer.current)
    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0
      e.preventDefault()
      router.push('/admin')
      return
    }
    logoTimer.current = setTimeout(() => { logoClickCount.current = 0 }, 800)
  }, [router])

  const cartCount = count()

  return (
    <>
      <header className={`sticky top-0 z-50 bg-cream-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>

        {/* ── Desktop 3-column header ── */}
        <div className="hidden md:grid grid-cols-3 items-center px-8 py-4 border-b border-cream-200">
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href}
                className="font-montserrat text-[11px] tracking-widest uppercase text-dark-700 hover:text-gold-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex justify-center">
            <Link href="/" onClick={handleLogoClick} className="block cursor-pointer focus:outline-none select-none">
              <Image src="/logo.jpeg" alt="Montelle Couture" width={110} height={88} className="object-contain" priority />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-6">
            <Link href="/shop" className="text-dark-700 hover:text-gold-600 transition-colors">
              <Search size={18} />
            </Link>
            <button onClick={openCart} className="relative text-dark-700 hover:text-gold-600 transition-colors">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile header ── */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-cream-200">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-dark-900 p-1">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" onClick={handleLogoClick} className="block cursor-pointer select-none focus:outline-none">
            <Image src="/logo.jpeg" alt="Montelle Couture" width={72} height={58} className="object-contain" priority />
          </Link>
          <button onClick={openCart} className="relative text-dark-700 p-1">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Secondary category bar — desktop only ── */}
        {/* CSS grid ensures the CTA button always gets its natural width */}
        <div className="hidden md:grid border-b border-cream-200 bg-cream-100"
             style={{ gridTemplateColumns: '1fr auto' }}>
          <div className="flex items-center overflow-x-auto">
            {SECONDARY_LINKS.map((l, i) => (
              <Link key={l.label} href={l.href}
                className={`flex-shrink-0 font-montserrat text-[10px] tracking-[0.12em] uppercase text-dark-700 hover:text-gold-600 hover:bg-cream-200 transition-colors px-6 py-3 whitespace-nowrap${i < SECONDARY_LINKS.length - 1 ? ' border-r border-r-[#eddcc8]' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/about"
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-dark-900 font-montserrat text-[9px] tracking-[0.12em] uppercase px-6 py-3 font-medium transition-colors whitespace-nowrap border-l border-l-[#a8873d]">
            <Calendar size={12} />
            Book an Appointment
          </Link>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-cream-50 shadow-2xl flex flex-col pt-16 pb-8 px-8 animate-slide-in-right overflow-y-auto">
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                  className="font-cormorant text-2xl text-dark-900 tracking-wide">
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-cream-300 pt-5 flex flex-col gap-3.5">
                {ALL_CATEGORY_LINKS.map((l) => (
                  <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                    className="font-montserrat text-[11px] tracking-widest uppercase text-dark-700 hover:text-gold-600 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
              <Link href="/about" onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 bg-gold-500 text-dark-900 font-montserrat text-[10px] tracking-widest uppercase px-4 py-3 font-medium">
                <Calendar size={13} />
                Book an Appointment
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
