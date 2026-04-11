'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight, CalendarCheck, Truck, CreditCard, BarChart3, LayoutGrid, LineChart } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { adminGetStats, adminGetOrders, adminGetChartData } from '../../lib/queries'
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

const RANGE_OPTIONS = [
  { label: '7D',  value: 7  },
  { label: '14D', value: 14 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

function RangeToggle({ value, onChange }) {
  return (
    <div className="flex items-center bg-surface border border-border rounded-full p-0.5">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold transition-all ${
            value === opt.value
              ? 'bg-slate-green text-white shadow-sm'
              : 'text-muted hover:text-slate-green'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ChartCard({ title, children, className = '', topRight }) {
  return (
    <div className={`bg-white rounded-2xl border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-green">{title}</h2>
        {topRight}
      </div>
      {children}
    </div>
  )
}

const STATUS_COLORS = {
  Pending: '#E8A838',
  Processing: '#3B82F6',
  Shipped: '#8B5CF6',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
}

const CHART_GREEN = '#0A2E25'
const CHART_VOLT = '#b8cf1e'

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg border border-border rounded-xl px-4 py-3 text-sm">
      <p className="font-medium text-slate-green mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('metrics') // 'metrics' | 'charts'
  const [revenueRange, setRevenueRange] = useState(30)
  const [ordersRange, setOrdersRange] = useState(30)

  useEffect(() => {
    async function load() {
      try {
        const [statsResult, ordersResult, chartResult] = await Promise.all([
          adminGetStats(),
          adminGetOrders(),
          adminGetChartData(),
        ])
        setStats(statsResult)
        setRecentOrders((ordersResult.data || []).slice(0, 5))
        setChartData(chartResult)
      } catch (err) {
        console.error('Admin dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-green">Dashboard</h1>
        <div className="flex items-center bg-surface border border-border rounded-full p-1">
          <button
            onClick={() => setView('metrics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              view === 'metrics'
                ? 'bg-slate-green text-white shadow-sm'
                : 'text-muted hover:text-slate-green'
            }`}
          >
            <LayoutGrid size={13} />
            Metrics
          </button>
          <button
            onClick={() => setView('charts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              view === 'charts'
                ? 'bg-slate-green text-white shadow-sm'
                : 'text-muted hover:text-slate-green'
            }`}
          >
            <LineChart size={13} />
            Charts
          </button>
        </div>
      </div>

      {view === 'metrics' ? (
        <>
          {/* Primary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
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
              icon={BarChart3}
              label="Avg. Order Value"
              value={formatNaira(stats?.avgOrderValueKobo || 0)}
              sub={`${stats?.conversionRate ?? 0}% fulfilment rate`}
              color="bg-emerald-600"
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={stats?.totalCustomers ?? '—'}
              color="bg-muted-dark"
            />
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={CalendarCheck}
              label="Orders Today"
              value={stats?.ordersToday ?? '—'}
              sub={stats?.todayRevenueKobo ? formatNaira(stats.todayRevenueKobo) + ' today' : 'no revenue yet'}
              color="bg-blue-600"
            />
            <StatCard
              icon={Truck}
              label="Delivered"
              value={stats?.deliveredOrders ?? '—'}
              sub={`${stats?.cancelledOrders ?? 0} cancelled`}
              color="bg-teal-600"
            />
            <StatCard
              icon={Package}
              label="Active Products"
              value={stats?.activeProducts ?? '—'}
              sub={stats?.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : 'stock healthy'}
              color={stats?.lowStockProducts > 0 ? 'bg-amber-500' : 'bg-slate-green'}
            />
            <StatCard
              icon={CreditCard}
              label="Active Installments"
              value={stats?.activeInstallments ?? '—'}
              sub={stats?.unreadMessages > 0 ? `${stats.unreadMessages} unread messages` : 'no new messages'}
              color="bg-purple-600"
            />
          </div>
        </>
      ) : (
        <>
          {/* Charts row 1: Revenue + Order Status */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
            <ChartCard
              title="Revenue"
              className="xl:col-span-2"
              topRight={<RangeToggle value={revenueRange} onChange={setRevenueRange} />}
            >
              {chartData?.revenueTimeline?.length > 0 ? (() => {
                const data = chartData.revenueTimeline.slice(-revenueRange)
                return (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2EE" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#627062' }}
                      tickLine={false}
                      axisLine={{ stroke: '#D5DDD5' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#627062' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    />
                    <Tooltip content={<CustomTooltip formatter={(v) => `\u20A6${v.toLocaleString()}`} />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (\u20A6)"
                      stroke={CHART_GREEN}
                      strokeWidth={2}
                      fill="url(#gradRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )
              })() : (
                <p className="text-sm text-muted text-center py-16">No revenue data yet.</p>
              )}
            </ChartCard>

            <ChartCard title="Order Status Breakdown">
              {chartData?.orderStatusBreakdown?.length > 0 ? (() => {
                const total = chartData.orderStatusBreakdown.reduce((s, e) => s + e.count, 0)
                return (
                  <div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={chartData.orderStatusBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={88}
                          paddingAngle={3}
                          dataKey="count"
                          nameKey="status"
                          stroke="none"
                          label={({ cx, cy, midAngle, outerRadius, count }) => {
                            const RADIAN = Math.PI / 180
                            const radius = outerRadius + 22
                            const x = cx + radius * Math.cos(-midAngle * RADIAN)
                            const y = cy + radius * Math.sin(-midAngle * RADIAN)
                            const pct = Math.round((count / total) * 100)
                            return (
                              <text x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="700" fill="#0A2E25">
                                {pct}%
                              </text>
                            )
                          }}
                          labelLine={{ stroke: '#D5DDD5', strokeWidth: 1 }}
                        >
                          {chartData.orderStatusBreakdown.map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                          ))}
                          <Label content={({ viewBox }) => {
                            const { cx, cy } = viewBox
                            return (
                              <g>
                                <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="800" fill="#0A2E25">{total}</text>
                                <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#627062">orders</text>
                              </g>
                            )
                          }} />
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const d = payload[0].payload
                            return (
                              <div className="bg-white shadow-lg border border-border rounded-xl px-4 py-3 text-sm">
                                <p className="font-medium text-slate-green">{d.status}</p>
                                <p className="text-muted">{d.count} order{d.count !== 1 ? 's' : ''} · {Math.round((d.count / total) * 100)}%</p>
                              </div>
                            )
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend: status + bold percentage only */}
                    <div className="mt-2 space-y-2">
                      {chartData.orderStatusBreakdown.map((entry) => (
                        <div key={entry.status} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.status] || '#94a3b8' }} />
                            <span className="text-muted">{entry.status}</span>
                          </div>
                          <span className="font-bold text-slate-green">{entry.count} order{entry.count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })() : (
                <p className="text-sm text-muted text-center py-16">No orders yet.</p>
              )}
            </ChartCard>
          </div>

          {/* Charts row 2: Daily orders + Stock levels */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
            <ChartCard
              title="Daily Orders"
              topRight={<RangeToggle value={ordersRange} onChange={setOrdersRange} />}
            >
              {chartData?.revenueTimeline?.length > 0 ? (() => {
                const data = chartData.revenueTimeline.slice(-ordersRange)
                return (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2EE" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#627062' }}
                      tickLine={false}
                      axisLine={{ stroke: '#D5DDD5' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#627062' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="Orders" fill={CHART_VOLT} radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
                )
              })() : (
                <p className="text-sm text-muted text-center py-16">No order data yet.</p>
              )}
            </ChartCard>

            <ChartCard title="Stock Levels — Lowest Products">
              {chartData?.stockLevels?.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData.stockLevels} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2EE" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#627062' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#627062' }}
                      tickLine={false}
                      axisLine={false}
                      width={130}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0].payload
                        return (
                          <div className="bg-white shadow-lg border border-border rounded-xl px-4 py-3 text-sm">
                            <p className="font-medium text-slate-green">{d.name}</p>
                            <p className="text-muted">{d.stock} units in stock</p>
                            <p className="text-xs text-muted capitalize">{d.category}</p>
                          </div>
                        )
                      }}
                    />
                    <Bar
                      dataKey="stock"
                      name="Stock"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                    >
                      {chartData.stockLevels.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.stock <= 5 ? '#EF4444' : entry.stock <= 15 ? '#E8A838' : CHART_GREEN}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted text-center py-16">No products yet.</p>
              )}
            </ChartCard>
          </div>
        </>
      )}

      {view === 'metrics' && <div className="bg-white rounded-2xl border border-border p-6">
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
      </div>}
    </div>
  )
}
