'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Check } from 'lucide-react'

const CartContext = createContext(null)
const CART_KEY = 'inargy_cart'
const TOAST_DURATION = 2500

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

function CartToast({ toast, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast, onDone])

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 bg-volt text-slate-green rounded-full shadow-lg border border-slate-green/15 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <span className="w-6 h-6 bg-slate-green rounded-full flex items-center justify-center shrink-0">
        <Check size={14} className="text-volt" />
      </span>
      <span className="text-sm font-medium whitespace-nowrap">{toast}</span>
    </div>
  )
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    saveCart(items)
  }, [items])

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current)
    setToast(null)
    requestAnimationFrame(() => setToast(message))
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
    showToast(`${product.name} added to cart`)
  }, [showToast])

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const totalKobo = useMemo(
    () => items.reduce((sum, item) => sum + item.price_kobo * item.quantity, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      totalKobo,
      isOpen,
      setIsOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, totalKobo, isOpen, addItem, updateQuantity, removeItem, clearCart]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToast toast={toast} onDone={clearToast} />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
