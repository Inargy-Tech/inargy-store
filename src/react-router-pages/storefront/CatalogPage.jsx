import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { getProducts } from '../../lib/queries'
import ProductGrid from '../../components/storefront/ProductGrid'

const CATEGORIES = [
  { value: '', label: 'All Products' },
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

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sortRaw = searchParams.get('sort') || 'created_at:desc'
  const [sortField, sortOrder] = sortRaw.split(':')

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await getProducts({ category, search, sort: sortField, order: sortOrder })
    setProducts(data || [])
    setLoading(false)
  }, [category, search, sortField, sortOrder])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Debounced search: update URL param after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam('search', searchInput)
    }, 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const activeCategory = CATEGORIES.find((c) => c.value === category) || CATEGORIES[0]
  const activeSort = SORT_OPTIONS.find((s) => s.value === sortRaw) || SORT_OPTIONS[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-green">
          {activeCategory.label}
        </h1>
        {products.length > 0 && !loading && (
          <p className="text-sm text-muted mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); updateParam('search', '') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-green"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <select
            value={sortRaw}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Category sidebar */}
        <aside className="lg:w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted px-3 mb-2">
              Category
            </p>
            <nav className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => updateParam('category', cat.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    category === cat.value
                      ? 'bg-slate-green text-white'
                      : 'text-muted hover:bg-surface'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {search && (
            <p className="text-sm text-muted mb-4">
              Showing results for <span className="font-medium text-slate-green">"{search}"</span>
              {' '}—{' '}
              <button
                onClick={() => { setSearchInput(''); updateParam('search', '') }}
                className="text-slate-green hover:underline"
              >
                clear
              </button>
            </p>
          )}
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  )
}
