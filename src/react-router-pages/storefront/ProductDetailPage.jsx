import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { ShoppingCart, Package, ChevronLeft, Minus, Plus, Check } from 'lucide-react'
import { getProductBySlug } from '../../lib/queries'
import { useCart } from '../../contexts/CartContext'
import NairaPrice from '../../components/ui/NairaPrice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await getProductBySlug(slug)
      setLoading(false)
      if (error || !data) setNotFound(true)
      else setProduct(data)
    }
    load()
  }, [slug])

  function handleAddToCart() {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package size={36} strokeWidth={1} className="text-muted" />
        </div>
        <h1 className="text-2xl font-bold text-slate-green mb-2">Product not found</h1>
        <p className="text-muted mb-8">This product may have been removed or the link is incorrect.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-slate-dark transition-colors"
        >
          <ChevronLeft size={18} /> Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link to="/catalog" className="hover:text-slate-green transition-colors">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/catalog?category=${product.category}`}
              className="hover:text-slate-green transition-colors capitalize"
            >
              {product.category.replace(/-/g, ' ')}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-green font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-surface rounded-2xl overflow-hidden border border-border">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Package size={80} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              {product.category.replace(/-/g, ' ')}
            </span>
          )}
          <h1 className="text-3xl font-bold text-slate-green mb-4">{product.name}</h1>

          <NairaPrice kobo={product.price_kobo} size="xl" showInstallment className="mb-6" />

          {/* Stock badge */}
          {product.stock !== undefined && (
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  {product.stock > 10 ? 'In stock' : `Only ${product.stock} left`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-danger">
                  <span className="w-2 h-2 bg-danger rounded-full" />
                  Out of stock
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none text-muted mb-8">
              <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-3 hover:bg-surface transition-colors text-slate-green"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-3 text-sm font-semibold text-slate-green min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="px-4 py-3 hover:bg-surface transition-colors text-slate-green disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold rounded-full transition-colors ${
                added
                  ? 'bg-success text-white'
                  : 'bg-slate-green text-white hover:bg-slate-dark'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {added ? (
                <><Check size={18} /> Added to Cart</>
              ) : (
                <><ShoppingCart size={18} /> Add to Cart</>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-border-light grid grid-cols-2 gap-4">
            {[
              { label: 'Flexible payment plans', sub: 'Pay monthly, worry less' },
              { label: 'Genuine products', sub: '100% authentic solar equipment' },
              { label: 'Free installation support', sub: 'Expert guidance included' },
              { label: '12-month warranty', sub: 'Peace of mind guaranteed' },
            ].map((b) => (
              <div key={b.label}>
                <p className="text-sm font-semibold text-slate-green">{b.label}</p>
                <p className="text-xs text-muted">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
