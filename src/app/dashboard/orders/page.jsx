'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { getOrders } from '../../../lib/queries'
import StatusBadge from '../../../components/ui/StatusBadge'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import EmptyState from '../../../components/ui/EmptyState'
import { formatNaira, formatDate } from '../../../config'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await getOrders(user.id)
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-green mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place an order, it will appear here."
          action={
            <Link
              href="/catalog"
              className="inline-flex items-center px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors"
            >
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-border hover:border-volt/40 hover:shadow-md transition-all p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-green">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
                <p className="text-xs text-muted">
                  {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                </p>
                <p className="text-sm font-bold text-slate-green">{formatNaira(order.total_kobo)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
