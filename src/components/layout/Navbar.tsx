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

const CATEGORY_LINKS = [
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

  const handleLogoClick = useCallback(() => {
    logoClickCount.current += 1
    if (logoTimer.current) clearTimeout(logoTimer.current)
    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0
      router.push('/admin')
      return
    }
    logoTimer.current = setTimeout(() => { logoClickCount.current = 0 }, 800)
  }, [router])

  const cartCount = count()

  return (
    <>
      {/* Main sticky header */}
      <header className={`sticky top-0 z-50 bg-cream-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        {/* Desktop: 3-column header */}
        <div className="hidden md:grid grid-cols-3 items-center px-8 py-4 border-b border-cream-200">
          {/* Left nav */}
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link key={l.href + l.label} href={l.href}
                className="text-[11px] tracking-widest uppercase text-dark-700 hover:text-gold-600 font-montserrat transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Center logo */}
          <div className="flex justify-center">
            <button onClick={handleLogoClick} className="focus:outline-none select-none">
              <Image src="/logo.jpeg" alt="Montelle Couture" width={110} height={88} className="object-contain" priority />
            </button>
          </div>

          {/* Right icons */}
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

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-cream-200">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-dark-900 p-1">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <button onClick={handleLogoClick} className="select-none focus:outline-none">
            <Image src="/logo.jpeg" alt="Montelle Couture" width={80} height={64} className="object-contain" priority />
          </button>
          <button onClick={openCart} className="relative text-dark-700 p-1">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Secondary category bar (desktop) */}
        <div className="hidden md:flex items-center justify-between px-8 py-0 border-b border-cream-200 bg-cream-100">
          <div className="flex items-center gap-8">
            {CATEGORY_LINKS.map((l, i) => (
              <span key={l.href + l.label} className="flex items-center gap-8">
                {i > 0 && <span className="text-cream-300 text-xs select-none">|</span>}
                <Link href={l.href}
                  className="text-[10px] tracking-widest uppercase text-dark-700 hover:text-gold-600 font-montserrat transition-colors py-3">
                  {l.label}
                </Link>
              </span>
            ))}
          </div>
          <Link href="/about"
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-dark-900 text-[9px] tracking-widest uppercase px-4 py-2.5 font-montserrat font-medium transition-colors my-1.5">
            <Calendar size={12} />
            Book an Appointment
          </Link>
        </div>
      </header>

      {/* Mobile drawer menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-cream-50 shadow-2xl flex flex-col pt-20 pb-8 px-8 animate-slide-in-right overflow-y-auto">
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((l) => (
                <Link key={l.href + l.label} href={l.href} onClick={() => setMobileOpen(false)}
                  className="font-cormorant text-2xl text-dark-900 tracking-wide">
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-cream-300 pt-6 flex flex-col gap-4">
                {CATEGORY_LINKS.map((l) => (
                  <Link key={l.href + l.label} href={l.href} onClick={() => setMobileOpen(false)}
                    className="text-[11px] tracking-widest uppercase text-dark-700 hover:text-gold-600 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
              <Link href="/about" onClick={() => setMobileOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 bg-gold-500 text-dark-900 text-[10px] tracking-widest uppercase px-4 py-3 font-montserrat font-medium">
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
