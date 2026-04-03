'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, AlertCircle, CheckCircle, Truck, CreditCard, Smartphone, Building2 } from 'lucide-react'
import { useCart } from '../../../contexts/CartContext'
import { useAuth } from '../../../contexts/AuthContext'
import { createOrder, getProductsByIds } from '../../../lib/queries'
import { openPaystackPopup } from '../../../lib/paystack'
import { supabase } from '../../../lib/supabase'
import NairaPrice from '../../../components/ui/NairaPrice'
import { formatNaira } from '../../../config'
import ProtectedRoute from '../../../components/layout/ProtectedRoute'

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2, description: 'We\'ll send you account details after placing your order' },
  { value: 'installment', label: 'Monthly Installment', icon: Smartphone, description: 'Split into 12 monthly payments — flexible & affordable' },
  { value: 'card', label: 'Debit / Credit Card', icon: CreditCard, description: 'Pay securely with Paystack' },
]

function CheckoutContent() {
  const { items, totalKobo, clearCart } = useCart()
  const { user, profile } = useAuth()

  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    paymentMethod: 'bank_transfer',
    notes: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)

  // Reset current order if items change
  useEffect(() => {
    setCurrentOrder(null)
  }, [items])

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please fill in all required delivery fields.')
      return
    }

    setLoading(true)

    // Pre-validate stock against current DB values before placing the order
    const { data: freshProducts, error: stockErr } = await getProductsByIds(items.map((i) => i.id))
    if (stockErr || !freshProducts) {
      setLoading(false)
      setError('Could not verify product availability. Please try again.')
      return
    }
    if (freshProducts) {
      for (const item of items) {
        const p = freshProducts.find((fp) => fp.id === item.id)
        if (!p || !p.is_active) {
          setLoading(false)
          setError(`"${item.name}" is no longer available.`)
          return
        }
        if (p.stock < item.quantity) {
          setLoading(false)
          setError(
            `Only ${p.stock} unit${p.stock !== 1 ? 's' : ''} of "${item.name}" available. Update your cart and try again.`
          )
          return
        }
      }
    }

    let order = currentOrder
    if (!order) {
      const { data: newOrder, error: orderError } = await createOrder({
        items,
        deliveryAddress: {
          full_name: form.fullName,
          phone: form.phone,
          address: form.address,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      })

      if (orderError) {
        setLoading(false)
        const msg = orderError.message || ''
        const safePatterns = ['stock', 'unavailable', 'payment method', 'at least one item', 'delivery address']
        const isSafe = safePatterns.some((p) => msg.toLowerCase().includes(p))
        setError(isSafe ? msg : 'Could not place order. Please try again.')
        return
      }
      order = newOrder
      setCurrentOrder(order)
    }

    if (form.paymentMethod === 'card') {
      try {
        const paystackRef = `inargy_${order.id}`
        const response = await openPaystackPopup({
          email: user.email,
          amountKobo: order.total_kobo,
          reference: paystackRef,
          metadata: { order_id: order.id },
        })

        if (response) {
          // Verify the payment server-side before confirming the order
          const { data: { session } } = await supabase.auth.getSession()
          const confirmRes = await fetch('/api/paystack/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token ?? ''}`,
            },
            body: JSON.stringify({ orderId: order.id, reference: response.reference }),
          })
          if (!confirmRes.ok) {
            // Payment received by Paystack but server confirmation failed.
            // The webhook will confirm it automatically — don't block the user.
            console.error('Client-side payment confirmation failed; webhook will confirm')
          }
        } else {
          setLoading(false)
          setError('Payment window was closed. You can try again or choose another payment method.')
          return
        }
      } catch (err) {
        setLoading(false)
        setError(err.message || 'Payment failed. You can try again or contact support.')
        return
      }
    }

    setLoading(false)
    clearCart()
    setSuccess(order)
  }

  if (items.length === 0 && !success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={36} strokeWidth={1} className="text-muted" />
        </div>
        <h2 className="text-2xl font-bold text-slate-green mb-2">Your cart is empty</h2>
        <p className="text-muted mb-8">Add some products before checking out.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-3xl font-bold text-slate-green mb-3">Order placed!</h1>
          <p className="text-muted mb-2">
            Your order <span className="font-semibold text-slate-green">#{success.id.slice(0, 8).toUpperCase()}</span> has been received.
          </p>
          <p className="text-sm text-muted mb-8">
            {form.paymentMethod === 'card'
              ? 'Payment received — your order is now being processed.'
              : <>We&apos;ll contact you on <strong>{form.phone}</strong> with next steps and payment details.</>
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/orders"
              className="px-6 py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/catalog"
              className="px-6 py-3 border border-border text-slate-green font-semibold rounded-full hover:bg-surface transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const deliveryFee = 0
  const grandTotal = totalKobo + deliveryFee

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-green mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck size={18} className="text-slate-green" />
                <h2 className="text-lg font-semibold text-slate-green">Delivery Details</h2>
              </div>

              {error && (
                <div id="checkout-error" role="alert" className="flex items-center gap-2 p-3 mb-5 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-fullName" className="block text-sm font-medium text-slate-green mb-1.5">Full name *</label>
                  <input id="checkout-fullName" name="fullName" type="text" required autoComplete="shipping name" value={form.fullName} onChange={update('fullName')} placeholder="Amara Okafor" aria-describedby={error ? 'checkout-error' : undefined} className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-phone" className="block text-sm font-medium text-slate-green mb-1.5">Phone number *</label>
                  <input id="checkout-phone" name="phone" type="tel" required autoComplete="shipping tel" value={form.phone} onChange={update('phone')} placeholder="+234 800 000 0000" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-address" className="block text-sm font-medium text-slate-green mb-1.5">Delivery address *</label>
                  <textarea id="checkout-address" name="address" required autoComplete="shipping street-address" value={form.address} onChange={update('address')} rows={3} placeholder="12 Solar Avenue, GRA, Lagos" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-notes" className="block text-sm font-medium text-slate-green mb-1.5">Order notes <span className="text-muted font-normal">(optional)</span></label>
                  <textarea id="checkout-notes" name="notes" value={form.notes} onChange={update('notes')} rows={3} placeholder="Any special delivery instructions…" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={18} className="text-slate-green" />
                <h2 className="text-lg font-semibold text-slate-green">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon, description }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      form.paymentMethod === value ? 'border-slate-green bg-slate-green/5' : 'border-border hover:border-slate-green/30'
                    }`}
                  >
                    <input type="radio" name="paymentMethod" value={value} checked={form.paymentMethod === value} onChange={update('paymentMethod')} className="mt-0.5 accent-slate-green" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-slate-green" />
                        <span className="text-sm font-semibold text-slate-green">{label}</span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-green mb-5">Order Summary</h2>
              <ul className="space-y-4 mb-6">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-surface rounded-xl overflow-hidden shrink-0 relative">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-green truncate">{item.name}</p>
                      <p className="text-xs text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-green shrink-0">{formatNaira(item.price_kobo * item.quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 py-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-slate-green">{formatNaira(totalKobo)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Delivery</span>
                  <span className="font-medium text-success">Free</span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-border mb-6">
                <span className="font-semibold text-slate-green">Total</span>
                <NairaPrice kobo={grandTotal} size="lg" />
              </div>
              <Button
                type="submit"
                isDisabled={loading}
                isLoading={loading}
                className="w-full py-3.5 bg-volt text-slate-green font-bold rounded-full hover:bg-volt-dim hover:text-slate-green transition-colors disabled:opacity-60 text-sm"
              >
                {form.paymentMethod === 'card' ? 'Pay Now' : 'Place Order'}
              </Button>
              <p className="text-xs text-muted text-center mt-3">By placing your order you agree to our terms of service.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  )
}
