'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@heroui/react/card'
import Image from 'next/image'
import { ChevronLeft, Package, MapPin, CreditCard, CheckCircle } from 'lucide-react'
import { getOrderById, updateOrderStatus } from '../../../../lib/queries'
import StatusBadge from '../../../../components/ui/StatusBadge'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import { formatNaira, formatDate } from '../../../../config'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await getOrderById(id)
      setLoading(false)
      if (!error && data) setOrder(data)
    }
    load()
  }, [id])

  const [statusError, setStatusError] = useState('')

  async function handleStatusChange(e) {
    const newStatus = e.target.value
    setUpdating(true)
    setStatusError('')
    const { data, error } = await updateOrderStatus(id, newStatus)
    setUpdating(false)
    if (error) {
      setStatusError('Could not update status. Please try again.')
    } else if (data) {
      setOrder(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-green mb-2">Order not found</h2>
        <Link href="/admin/orders" className="text-sm text-muted hover:text-slate-green">← Back to orders</Link>
      </div>
    )
  }

  const addr = order.delivery_address || {}

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6"
      >
        <ChevronLeft size={16} /> All Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-green">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>

        {/* Status updater */}
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle size={15} /> Saved
            </span>
          )}
          <select
            value={order.status}
            onChange={handleStatusChange}
            disabled={updating}
            className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-slate-green bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 cursor-pointer disabled:opacity-60"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {statusError && (
        <div className="mb-6 p-3 bg-danger/10 text-danger text-sm rounded-xl">
          {statusError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Delivery */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-slate-green" />
            <h2 className="text-sm font-semibold text-slate-green">Delivery Address</h2>
          </div>
          <p className="text-sm font-medium text-slate-green">{addr.full_name || '—'}</p>
          <p className="text-sm text-muted">{addr.phone || '—'}</p>
          <p className="text-sm text-muted mt-1">{addr.address}</p>
          <p className="text-sm text-muted">{[addr.city, addr.state].filter(Boolean).join(', ')}</p>
        </Card>

        {/* Payment */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-slate-green" />
            <h2 className="text-sm font-semibold text-slate-green">Payment</h2>
          </div>
          <p className="text-sm text-slate-green font-medium capitalize">
            {order.payment_method?.replace(/_/g, ' ') || '—'}
          </p>
          {order.notes && (
            <p className="text-sm text-muted mt-2 italic">"{order.notes}"</p>
          )}
        </Card>
      </div>

      {/* Items */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-green mb-4 flex items-center gap-2">
          <Package size={16} /> Items ({order.order_items?.length || 0})
        </h2>
        <ul className="divide-y divide-border-light">
          {(order.order_items || []).map((item) => (
            <li key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
              <div className="w-16 h-16 bg-surface rounded-xl overflow-hidden shrink-0">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.product_name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-green">{item.product_name}</p>
                <p className="text-xs text-muted">Qty: {item.quantity} × {formatNaira(item.price_kobo)}</p>
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
      </Card>
    </div>
  )
}
