'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { adminGetStats, adminGetOrders } from '../../lib/queries'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatNaira, formatDate } from '../../config'

function StatCard({ icon: Icon, label, value, sub, color = 'bg-slate-green' }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-green">{value}</p>
      <p className="text-sm font-medium text-slate-green mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [statsResult, ordersResult] = await Promise.all([
        adminGetStats(),
        adminGetOrders(),
      ])
      setStats(statsResult)
      setRecentOrders((ordersResult.data || []).slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats?.totalOrders ?? '—'}
          sub={`${stats?.pendingOrders ?? 0} pending`}
          color="bg-slate-green"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={formatNaira(stats?.totalRevenueKobo || 0)}
          sub="confirmed orders"
          color="bg-volt-dim"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={stats?.totalCustomers ?? '—'}
          color="bg-blue-600"
        />
        <StatCard
          icon={Package}
          label="Pending Orders"
          value={stats?.pendingOrders ?? '—'}
          sub="awaiting action"
          color="bg-warning"
        />
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-green">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm text-muted hover:text-slate-green transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {recentOrders.map((order) => (
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
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-green">
                      {formatNaira(order.total_kobo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
