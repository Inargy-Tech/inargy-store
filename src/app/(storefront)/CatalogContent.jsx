'use client'

import { Button } from '@heroui/react/button'
import { Suspense } from 'react'
import { BrandMark } from '../../assets/logo'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getProducts, getFeaturedProducts } from '../../lib/queries'
import { Star } from 'lucide-react'
import ProductGrid from '../../components/storefront/ProductGrid'
import Pagination from '../../components/ui/Pagination'

const CATEGORIES = [
  { value: '', label: 'All Products' },
  { value: 'featured', label: 'Featured', icon: true },
  { value: 'solar-panels', label: 'Solar Panels' },
  { value: 'inverters', label: 'Inverters' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'controllers', label: 'Controllers' },
  { value: 'accessories', label: 'Accessories' },
]

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest' },
  { value: 'created_at:asc', label: 'Oldest' },
  { value: 'price_kobo:asc', label: 'Price: Low to High' },
  { value: 'price_kobo:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name A–Z' },
]

function CatalogInner({ initialProducts = [], initialTotal = 0 }) {
  const searchParams = useSearchParams()
  const hasInitialData = initialProducts && initialProducts.length > 0
  const [products, setProducts] = useState(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(!hasInitialData)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sortRaw = searchParams.get('sort') || 'created_at:desc'
  const [sortField, sortOrder] = sortRaw.split(':')

  function updateURL(key, value) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    const qs = next.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    window.dispatchEvent(new Event('popstate'))
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const isFeatured = category === 'featured'
      const { data, count } = await getProducts({
        category: isFeatured ? '' : category,
        search,
        sort: sortField,
        order: sortOrder,
        page,
        featured: isFeatured || undefined,
      })
      setProducts(data || [])
      setTotal(count || 0)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [category, search, sortField, sortOrder, page])

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (initialProducts && initialProducts.length > 0) {
        return
      }
    }
    fetchProducts()
  }, [fetchProducts, initialProducts])

  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL('search', searchInput)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const activeCategory = CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]

  return (
    <div className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-green">
          {activeCategory.label}
        </h1>
        {total > 0 && !loading && (
          <p className="text-sm text-muted mt-1">{total} product{total !== 1 ? 's' : ''}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <label htmlFor="catalog-search" className="sr-only">Search products</label>
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="catalog-search"
            type="text"
            autoComplete="off"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); updateURL('search', '') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-green"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="relative">
          <label htmlFor="catalog-sort" className="sr-only">Sort products</label>
          <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <select
            id="catalog-sort"
            value={sortRaw}
            onChange={(e) => updateURL('sort', e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted px-3 mb-2">
              Category
            </p>
            <nav className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => updateURL('category', cat.value)}
                  aria-pressed={category === cat.value}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                    category === cat.value
                      ? 'bg-slate-green text-white'
                      : 'text-muted hover:bg-surface'
                  }`}
                >
                  {cat.label}
                  {cat.icon && (
                    <Star size={13} className={`shrink-0 ${category === cat.value ? 'fill-white text-white' : 'fill-volt text-volt'}`} />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {search && (
            <p className="text-sm text-muted mb-4">
              Showing results for <span className="font-medium text-slate-green">&ldquo;{search}&rdquo;</span>
              {' '}&mdash;{' '}
              <Button
                variant="ghost"
                onPress={() => { setSearchInput(''); updateURL('search', '') }}
                className="text-slate-green hover:underline p-0 min-w-0 h-auto font-normal inline"
              >
                clear
              </Button>
            </p>
          )}
          <ProductGrid products={products} loading={loading} />
          <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}

export default function CatalogContent({ initialProducts, initialTotal }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <BrandMark size={48} className="text-volt animate-breathe" />
      </div>
    }>
      <CatalogInner initialProducts={initialProducts} initialTotal={initialTotal} />
    </Suspense>
  )
}
