'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'

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

export default function CatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at:desc'

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`?${next.toString()}`)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParam('search', searchInput)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <>
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
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

        <div className="relative">
          <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

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
    </>
  )
}
