import ProductCard from './ProductCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'
import { Package } from 'lucide-react'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
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
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
