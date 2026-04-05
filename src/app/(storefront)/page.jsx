import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE } from '../../config'
import { getProducts } from '../../lib/queries'
import { createServerSupabase } from '../../lib/supabase-server'
import ProductGrid from '../../components/storefront/ProductGrid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop Solar Panels, Inverters & Batteries',
  description: 'Browse affordable solar energy products for Nigerian homes and businesses. Free delivery on select items.',
  alternates: { canonical: SITE.url },
}

const CATEGORIES = [
  { value: 'solar-panels', label: 'Solar Panels' },
  { value: 'inverters', label: 'Inverters' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'controllers', label: 'Controllers' },
  { value: 'accessories', label: 'Accessories' },
]

export default async function HomePage() {
  const supabase = await createServerSupabase()
  const { data } = await getProducts(
    { category: '', search: '', sort: 'created_at', order: 'desc', page: 1 },
    supabase
  )
  const featured = (data || []).slice(0, 8)

  return (
    <div className="py-8 space-y-10">
      {/* Category pills */}
      <nav aria-label="Shop by category" className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/catalog?category=${cat.value}`}
            className="px-4 py-2 rounded-full border border-border text-sm font-medium text-slate-green hover:border-volt hover:bg-volt/10 transition-colors"
          >
            {cat.label}
          </Link>
        ))}
      </nav>

      {/* Featured products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-green">Featured Products</h2>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-green hover:text-volt transition-colors"
          >
            Browse all <ArrowRight size={15} />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  )
}
