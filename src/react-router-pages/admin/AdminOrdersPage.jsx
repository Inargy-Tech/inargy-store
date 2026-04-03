import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import { adminGetOrders } from '../../lib/queries'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatNaira, formatDate } from '../../config'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await adminGetOrders({ status: statusFilter || undefined })
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [statusFilter])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Orders</h1>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-slate-green text-white'
                : 'bg-white border border-border text-muted hover:border-slate-green/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <ShoppingCart size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-surface/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Payment</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {orders.map((order) => {
                  const addr = order.delivery_address || {}
                  return (
                    <tr key={order.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="font-medium text-slate-green hover:text-volt-dim transition-colors"
                        >
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-slate-green font-medium">{addr.full_name || '—'}</p>
                        <p className="text-xs text-muted">{addr.phone || ''}</p>
                      </td>
                      <td className="px-4 py-4 text-muted">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-4 text-muted capitalize">
                        {order.payment_method?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-green">
                        {formatNaira(order.total_kobo)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-lg text-muted hover:text-slate-green hover:bg-surface transition-colors inline-flex"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
