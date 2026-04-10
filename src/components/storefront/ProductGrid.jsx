import ProductCard from './ProductCard'
import EmptyState from '../ui/EmptyState'
import { Package } from 'lucide-react'

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="rounded-2xl border border-border overflow-hidden">
          <div className="aspect-square bg-surface animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-16 bg-surface rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-surface rounded animate-pulse" />
            <div className="h-5 w-24 bg-surface rounded animate-pulse" />
            <div className="h-10 w-full bg-surface rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return <SkeletonGrid />
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="We don't have any products matching your criteria yet. Check back soon!"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 2} />
      ))}
    </div>
  )
}
