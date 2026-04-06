'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Package, MapPin, CreditCard, XCircle, Check } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { getOrderById, cancelOrder } from '../../../../lib/queries'
import StatusBadge from '../../../../components/ui/StatusBadge'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import ConfirmModal from '../../../../components/ui/ConfirmModal'
import { formatNaira, formatDate } from '../../../../config'

const STEPS = [
  { key: 'pending',    label: 'Order Placed',  description: 'Your order has been received.' },
  { key: 'processing', label: 'Processing',    description: 'Payment confirmed, preparing your order.' },
  { key: 'shipped',    label: 'Shipped',        description: 'Your order is on its way.' },
  { key: 'delivered',  label: 'Delivered',      description: 'Order delivered successfully.' },
]

const STEP_INDEX = { pending: 0, processing: 1, shipped: 2, delivered: 3 }

function OrderTimeline({ status }) {
  const current = STEP_INDEX[status] ?? 0
  return (
    <div className="bg-white rounded-2xl border border-border p-5 mb-6">
      <div className="flex items-center justify-between relative">
        {/* connector line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border-light" aria-hidden="true" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-volt transition-all duration-500"
          style={{ width: `${(current / (STEPS.length - 1)) * 100}%` }}
          aria-hidden="true"
        />
        {STEPS.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <div key={step.key} className="relative flex flex-col items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                done  ? 'bg-volt border-volt' :
                active ? 'bg-white border-slate-green' :
                         'bg-white border-border'
              }`}>
                {done ? (
                  <Check size={14} className="text-slate-green" strokeWidth={3} />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${active ? 'bg-slate-green' : 'bg-border'}`} />
                )}
              </div>
              <div className="text-center hidden sm:block">
                <p className={`text-xs font-semibold ${active ? 'text-slate-green' : done ? 'text-muted' : 'text-border'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted text-center mt-4 sm:hidden font-medium">{STEPS[current].label}</p>
      <p className="text-xs text-muted text-center mt-1">{STEPS[current].description}</p>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await getOrderById(id, user.id)
      setLoading(false)
      if (error || !data) setNotFound(true)
      else setOrder(data)
    }
    load()
  }, [id, user.id])

  async function handleCancel() {
    setCancelling(true)
    setCancelError('')
    const { data, error } = await cancelOrder(order.id)
    setCancelling(false)
    if (error) {
      setCancelError(error.message || 'Could not cancel order.')
    } else {
      setOrder(data)
      setShowCancel(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-green mb-2">Order not found</h2>
        <Link href="/dashboard/orders" className="text-sm text-muted hover:text-slate-green">
          ← Back to orders
        </Link>
      </div>
    )
  }

  const addr = order.delivery_address || {}

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6"
      >
        <ChevronLeft size={16} /> All Orders
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-green">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {order.status === 'pending' && (
            <button
              onClick={() => { setCancelError(''); setShowCancel(true) }}
              className="inline-flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 transition-colors"
            >
              <XCircle size={16} /> Cancel order
            </button>
          )}
        </div>
      </div>

      {cancelError && (
        <p className="mb-4 text-sm text-danger">{cancelError}</p>
      )}

      <ConfirmModal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        message="This cannot be undone. If you've already made a payment, please contact support."
        confirmLabel="Yes, cancel order"
        danger
        loading={cancelling}
      />

      {/* Order timeline */}
      {order.status !== 'cancelled' && (
        <OrderTimeline status={order.status} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Delivery address */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-slate-green" />
            <h2 className="text-sm font-semibold text-slate-green">Delivery Address</h2>
          </div>
          <p className="text-sm text-slate-green font-medium">{addr.full_name}</p>
          <p className="text-sm text-muted">{addr.phone}</p>
          <p className="text-sm text-muted mt-1 whitespace-pre-line">{addr.address}</p>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-slate-green" />
            <h2 className="text-sm font-semibold text-slate-green">Payment</h2>
          </div>
          <p className="text-sm text-slate-green font-medium capitalize">
            {order.payment_method?.replace(/_/g, ' ')}
          </p>
          {order.notes && (
            <p className="text-sm text-muted mt-2 italic">"{order.notes}"</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-slate-green mb-4 flex items-center gap-2">
          <Package size={16} /> Items ({order.order_items?.length || 0})
        </h2>
        <ul className="divide-y divide-border-light">
          {(order.order_items || []).map((item) => (
            <li key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
              <div className="w-16 h-16 bg-surface rounded-xl overflow-hidden shrink-0 relative">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.product_name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-green">{item.product_name}</p>
                <p className="text-xs text-muted">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-slate-green shrink-0">
                {formatNaira(item.price_kobo * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-t border-border mt-4 pt-4 flex justify-between">
          <span className="font-semibold text-slate-green">Total</span>
          <span className="text-lg font-bold text-slate-green">{formatNaira(order.total_kobo)}</span>
        </div>
      </div>
    </div>
  )
}
