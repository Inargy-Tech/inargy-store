'use client'

import { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'inargy_cart'

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

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setIsMounted(true)
  }, [])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      let newItems
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        const maxQty = product.stock ?? Infinity
        newItems = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxQty) }
            : item
        )
      } else {
        newItems = [...prev, { ...product, quantity: Math.min(quantity, product.stock ?? Infinity) }]
      }
      saveCart(newItems)
      return newItems
    })
    setIsOpen(true)
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const newItems = prev.filter((item) => item.id !== productId)
        saveCart(newItems)
        return newItems
      }
      const newItems = prev.map((item) => {
        if (item.id !== productId) return item
        const maxQty = item.stock ?? Infinity
        return { ...item, quantity: Math.min(quantity, maxQty) }
      })
      saveCart(newItems)
      return newItems
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== productId)
      saveCart(newItems)
      return newItems
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    saveCart([])
  }, [])

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const totalKobo = useMemo(() => items.reduce((sum, item) => sum + item.price_kobo * item.quantity, 0), [items])

  const value = useMemo(() => ({
    items,
    itemCount,
    totalKobo,
    isOpen,
    setIsOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [items, itemCount, totalKobo, isOpen, addItem, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
