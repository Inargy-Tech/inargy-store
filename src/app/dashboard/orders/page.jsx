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
import { Alert } from '@heroui/react/alert'
import { Card } from '@heroui/react/card'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await getOrders(user.id)
      if (error) setFetchError('Could not load your orders. Please try again.')
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

      {fetchError && (
        <Alert status="danger" className="mb-6">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{fetchError}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {orders.length === 0 && !fetchError ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place an order, it will appear here."
          action={
            <Link
              href="/catalog"
              className="inline-flex items-center px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
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
              className="block"
            >
              <Card className="p-5 hover:border-volt/40 hover:shadow-md transition-all">
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
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
