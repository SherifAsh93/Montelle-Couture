'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag, LayoutGrid, Image, LogOut, TrendingUp, Clock } from 'lucide-react'

type Stats = { products: number; orders: number; pendingOrders: number; revenue: number }

const NAV = [
  { label: 'Products', href: '/admin/products', icon: Package, desc: 'Add, edit, delete products' },
  { label: 'Categories', href: '/admin/categories', icon: LayoutGrid, desc: 'Manage categories & sub-categories' },
  { label: 'Banners', href: '/admin/banners', icon: Image, desc: 'Manage hero banner images' },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, desc: 'View and manage orders' },
]

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => {
      if (r.ok) { setAuthed(true); r.json().then(setStats) }
      else setAuthed(false)
    })
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) { setAuthed(true); fetch('/api/admin/stats').then((r) => r.json()).then(setStats) }
    else setError('Incorrect password')
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAuthed(false); setStats(null)
  }

  if (authed === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-cormorant text-4xl tracking-[0.2em] text-dark-900 uppercase">Montelle</span>
          <p className="text-[10px] tracking-widest uppercase text-dark-700 mt-2">Admin Panel</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white shadow-sm border border-cream-200 p-8 space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="text-[10px] tracking-widest uppercase text-dark-700 block mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              autoFocus placeholder="••••"
              className="w-full border border-cream-300 px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:border-gold-500 transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-dark-900 text-cream-50 py-3 text-[11px] tracking-widest uppercase font-montserrat font-medium hover:bg-dark-800 transition-colors disabled:opacity-60">
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-dark-900 text-cream-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-cormorant text-2xl tracking-[0.2em] uppercase">Montelle</span>
          <span className="text-[10px] tracking-widest uppercase text-gold-400">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[10px] tracking-widest uppercase text-cream-300 hover:text-cream-50 transition-colors">
            View Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-cream-300 hover:text-cream-50 transition-colors">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Products', value: stats.products, icon: Package, color: 'text-blue-600' },
              { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-green-600' },
              { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600' },
              { label: 'Revenue', value: `${stats.revenue.toFixed(0)} EGP`, icon: TrendingUp, color: 'text-gold-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] tracking-widest uppercase text-gray-500">{label}</p>
                  <Icon size={16} className={color} />
                </div>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Navigation cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NAV.map(({ label, href, icon: Icon, desc }) => (
            <Link key={href} href={href}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gold-400 hover:shadow-md transition-all group">
              <Icon size={24} className="text-gold-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 mb-1">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
