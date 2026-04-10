'use client'

import { useState } from 'react'
import { Button } from '@heroui/react/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, Search } from 'lucide-react'
import { Logo, BrandMark } from '../../assets/logo'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

export default function StoreNavbar() {
  const { user, isAdmin, signOut, loading } = useAuth()
  const { itemCount, setIsOpen } = useCart()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setSearchOpen(false)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-none flex items-center gap-2 text-slate-green">
          <BrandMark size={44} className="sm:hidden" />
          <Logo height={40} className="hidden sm:block" />
        </Link>

        {/* Desktop centre: nav links + search icon, or search form */}
        <div className="flex-1 hidden md:flex items-center justify-center">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                placeholder="Search products…"
                className="w-80 px-4 py-2 text-sm border border-slate-green/30 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors bg-white"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="p-2 rounded-full hover:bg-slate-green/5 transition-colors">
                <X size={18} className="text-slate-green" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-8">
              <Link href="/catalog" className="text-sm font-medium text-muted hover:text-slate-green transition-colors">
                All Products
              </Link>
              <Link href="/catalog?category=solar-panels" className="text-sm font-medium text-muted hover:text-slate-green transition-colors">
                Solar Panels
              </Link>
              <Link href="/catalog?category=inverters" className="text-sm font-medium text-muted hover:text-slate-green transition-colors">
                Inverters
              </Link>
              <Link href="/catalog?category=batteries" className="text-sm font-medium text-muted hover:text-slate-green transition-colors">
                Batteries
              </Link>
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="p-2 rounded-full hover:bg-slate-green/5 transition-colors"
              >
                <Search size={20} className="text-slate-green" />
              </button>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart button */}
          <Button
            variant="ghost"
            onPress={() => setIsOpen(true)}
            className="relative p-2 rounded-full hover:bg-slate-green/5 transition-colors"
            aria-label={`Cart with ${itemCount} items`}
          >
            <ShoppingCart size={20} className="text-slate-green" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-volt text-slate-green text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Button>

          {/* User menu */}
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-slate-green/5 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <Button
                variant="ghost"
                isIconOnly
                onPress={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 rounded-full hover:bg-slate-green/5 transition-colors"
                aria-label="User menu"
              >
                <User size={20} className="text-slate-green" />
              </Button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-border-light">
                      <p className="text-sm font-medium text-slate-green truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/dashboard/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-surface transition-colors"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-surface transition-colors"
                    >
                      <User size={16} /> Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-surface transition-colors"
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}

                    <hr className="my-1 border-border-light" />

                    <Button
                      variant="ghost"
                      onPress={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors w-full justify-start rounded-none font-normal"
                    >
                      <LogOut size={16} /> Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              data-testid="navbar-signin"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            isIconOnly
            onPress={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full hover:bg-slate-green/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={20} className="text-slate-green" />
            ) : (
              <Menu size={20} className="text-slate-green" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-1">
          <form onSubmit={(e) => { handleSearchSubmit(e); setMobileOpen(false) }} className="flex items-center gap-2 mb-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 px-4 py-2 text-sm border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors bg-white"
            />
            <button type="submit" aria-label="Search" className="p-2 rounded-full hover:bg-slate-green/5 transition-colors">
              <Search size={18} className="text-slate-green" />
            </button>
          </form>
          <Link
            href="/catalog"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-muted hover:bg-surface rounded-lg transition-colors"
          >
            All Products
          </Link>
          <Link
            href="/catalog?category=solar-panels"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-muted hover:bg-surface rounded-lg transition-colors"
          >
            Solar Panels
          </Link>
          <Link
            href="/catalog?category=inverters"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-muted hover:bg-surface rounded-lg transition-colors"
          >
            Inverters
          </Link>
          <Link
            href="/catalog?category=batteries"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-muted hover:bg-surface rounded-lg transition-colors"
          >
            Batteries
          </Link>

          {!user && (
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-slate-green hover:bg-surface rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
