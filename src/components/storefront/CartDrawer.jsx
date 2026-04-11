'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@heroui/react/button'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { formatNaira } from '../../config'
import EmptyState from '../ui/EmptyState'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalKobo, itemCount } =
    useCart()
  const drawerRef = useRef(null)
  const closeRef = useRef(null)

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') { setIsOpen(false); return }
      if (e.key !== 'Tab' || !drawerRef.current) return
      const focusable = drawerRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = '' }
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-labelledby="cart-title" ref={drawerRef}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="cart-title" className="text-lg font-semibold text-slate-green">
            Cart ({itemCount})
          </h2>
          <Button
            ref={closeRef}
            variant="ghost"
            isIconOnly
            onPress={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-surface transition-colors"
            aria-label="Close cart"
          >
            <X size={20} className="text-muted" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Browse our solar products and add items to your cart."
              action={
                <Link
                  href="/catalog"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors"
                >
                  Browse Products
                </Link>
              }
            />
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-surface/50"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-surface overflow-hidden shrink-0 relative">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-green truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm font-bold text-slate-green mt-1">
                      {formatNaira(item.price_kobo)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        isIconOnly
                        onPress={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-surface transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        isIconOnly
                        isDisabled={item.stock != null && item.quantity >= item.stock}
                        onPress={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        isIconOnly
                        onPress={() => removeItem(item.id)}
                        className="ml-auto p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-lg font-bold text-slate-green">
                {formatNaira(totalKobo)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-6 py-3 bg-volt text-slate-green font-bold rounded-full hover:bg-volt-dim hover:text-slate-green transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
