'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { useCart } from '../../../../contexts/CartContext'

export default function AddToCartSection({ product }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    if (added) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex items-center gap-4 mt-auto">
      <div className="sr-only" role="status" aria-live="polite">
        {added ? `${product.name} added to cart` : ''}
      </div>
      <div className="flex items-center border border-border rounded-xl overflow-hidden">
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-4 py-3 hover:bg-surface transition-colors text-slate-green rounded-none"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </Button>
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

      <Button
        onPress={handleAddToCart}
        isDisabled={product.stock === 0}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold rounded-full transition-colors ${
          added
            ? 'bg-success text-white'
            : 'bg-slate-green text-white hover:bg-volt hover:text-slate-green'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {added ? (
          <><Check size={18} /> Added to Cart</>
        ) : (
          <><ShoppingCart size={18} /> Add to Cart</>
        )}
      </Button>
    </div>
  )
}
