'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Users, ShoppingCart } from 'lucide-react'
import { Card } from '@heroui/react/card'
import { adminGetCustomerById, adminGetCustomerOrders } from '../../../../lib/queries'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import StatusBadge from '../../../../components/ui/StatusBadge'
import Pagination from '../../../../components/ui/Pagination'
import { formatNaira, formatDate } from '../../../../config'

const PAGE_SIZE = 20

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    adminGetCustomerById(id).then(({ data }) => {
      setCustomer(data)
      setLoading(false)
    })
  }, [id])

  const loadOrders = useCallback(async (status, p) => {
    setOrdersLoading(true)
    const { data, count } = await adminGetCustomerOrders(id, { status: status || undefined, page: p })
    setOrders(data || [])
    setTotal(count || 0)
    setOrdersLoading(false)
  }, [id])

  useEffect(() => {
    setPage(1)
    loadOrders(statusFilter, 1)
  }, [statusFilter, loadOrders])

  useEffect(() => {
    loadOrders(statusFilter, page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>

  if (!customer) return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6">
        <ChevronLeft size={16} /> Customers
      </Link>
      <Card className="p-16 text-center">
        <Users size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
        <p className="text-slate-green font-semibold">Customer not found</p>
      </Card>
    </div>
  )

  return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6">
        <ChevronLeft size={16} /> Customers
      </Link>

      {/* Customer header card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-green text-volt rounded-full flex items-center justify-center text-xl font-bold shrink-0">
            {(customer.full_name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-green">{customer.full_name || 'Unknown'}</h1>
            <p className="text-sm text-muted">{customer.email || '—'}</p>
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-6 text-right">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Phone</p>
              <p className="text-sm font-medium text-slate-green">{customer.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Joined</p>
              <p className="text-sm font-medium text-slate-green">{formatDate(customer.created_at)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-green">Orders</h2>
        <span className="text-sm text-muted">{total} total</span>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-slate-green text-white'
                : 'bg-white border border-border text-muted hover:border-slate-green/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {ordersLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-16 text-center">
          <ShoppingCart size={36} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No orders found</p>
          <p className="text-sm text-muted mt-1">
            {statusFilter ? `No ${statusFilter} orders for this customer.` : 'This customer has not placed any orders yet.'}
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light bg-surface/50">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Order ID</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-slate-green hover:text-volt-dim transition-colors"
                        >
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-muted">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-green">{formatNaira(order.total_kobo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
