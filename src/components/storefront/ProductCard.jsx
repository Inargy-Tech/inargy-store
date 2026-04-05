'use client'

import { memo } from 'react'
import { Button } from '@heroui/react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Package } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import NairaPrice from '../ui/NairaPrice'

export default memo(function ProductCard({ product, priority = false }) {
  const { addItem } = useCart()

  return (
    <div className="group bg-white rounded-2xl border border-border hover:border-volt/40 hover:shadow-lg active:shadow-md focus-within:border-volt/40 transition-all duration-300 overflow-hidden">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block aspect-square bg-surface overflow-hidden relative">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted" role="img" aria-label={product.name}>
            <Package size={48} strokeWidth={1} />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-5">
        {product.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {product.category}
          </span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-base font-semibold text-slate-green mt-1 mb-2 group-hover:text-volt-dim transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <NairaPrice kobo={product.price_kobo} size="md" showInstallment />

        {product.stock === 0 ? (
          <p className="mt-4 w-full text-center py-2.5 text-sm font-medium text-danger">
            Out of stock
          </p>
        ) : (
          <Button
            onPress={() => addItem(product)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors"
          >
            <ShoppingCart size={16} /> Add to Cart
          </Button>
        )}
      </div>
    </div>
  )
})
