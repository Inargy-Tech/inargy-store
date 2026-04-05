'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, CreditCard, MessageSquare, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getOrders, getInstallments, getMessages } from '../../lib/queries'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatNaira, formatDate } from '../../config'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [activeInstallment, setActiveInstallment] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [ordersRes, installRes, msgRes] = await Promise.all([
        getOrders(user.id),
        getInstallments(user.id),
        getMessages(user.id),
      ])
      setOrders((ordersRes.data || []).slice(0, 3))
      const active = (installRes.data || []).find((i) => i.status === 'active')
      setActiveInstallment(active || null)
      setUnreadCount((msgRes.data || []).filter((m) => !m.read && m.from_admin).length)
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-green">Hi, {firstName}</h1>
        <p className="text-sm text-muted mt-1">Here's what's happening with your account.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/orders" className="bg-white rounded-2xl border border-border p-5 hover:border-volt/40 hover:shadow-sm transition-all">
          <div className="w-9 h-9 bg-slate-green/10 rounded-xl flex items-center justify-center mb-3">
            <Package size={18} className="text-slate-green" />
          </div>
          <p className="text-xl font-bold text-slate-green">{orders.length > 0 ? orders.length : '—'}</p>
          <p className="text-sm text-muted mt-0.5">Recent orders</p>
        </Link>

        <Link href="/dashboard/installments" className="bg-white rounded-2xl border border-border p-5 hover:border-volt/40 hover:shadow-sm transition-all">
          <div className="w-9 h-9 bg-volt/20 rounded-xl flex items-center justify-center mb-3">
            <CreditCard size={18} className="text-slate-green" />
          </div>
          <p className="text-xl font-bold text-slate-green">
            {activeInstallment ? formatNaira(activeInstallment.monthly_amount_kobo) : '—'}
          </p>
          <p className="text-sm text-muted mt-0.5">
            {activeInstallment ? 'Monthly installment' : 'No active plan'}
          </p>
        </Link>

        <Link href="/dashboard/messages" className="bg-white rounded-2xl border border-border p-5 hover:border-volt/40 hover:shadow-sm transition-all">
          <div className="relative w-9 h-9 bg-slate-green/10 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare size={18} className="text-slate-green" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-volt text-slate-green text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-slate-green">{unreadCount > 0 ? unreadCount : '—'}</p>
          <p className="text-sm text-muted mt-0.5">
            {unreadCount > 0 ? `Unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages'}
          </p>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-green">Recent Orders</h2>
          <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm text-muted hover:text-slate-green transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package size={32} className="text-border mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm text-muted">You haven't placed any orders yet.</p>
            <Link href="/" className="mt-3 inline-block text-sm font-medium text-slate-green hover:text-volt-dim transition-colors">
              Browse products →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border-light">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between py-3.5 hover:bg-surface -mx-1 px-1 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-green">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-bold text-slate-green">{formatNaira(order.total_kobo)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Active installment */}
      {activeInstallment && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-green">Active Installment Plan</h2>
            <Link href="/dashboard/installments" className="flex items-center gap-1 text-sm text-muted hover:text-slate-green transition-colors">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted">Progress</span>
            <span className="font-semibold text-slate-green">
              {activeInstallment.paid_installments}/{activeInstallment.total_installments} payments
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-volt h-2 rounded-full transition-all"
              style={{ width: `${(activeInstallment.paid_installments / activeInstallment.total_installments) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-muted">{formatNaira(activeInstallment.monthly_amount_kobo)}/month</span>
            <span className="font-semibold text-slate-green">
              {formatNaira((activeInstallment.total_installments - activeInstallment.paid_installments) * activeInstallment.monthly_amount_kobo)} remaining
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
