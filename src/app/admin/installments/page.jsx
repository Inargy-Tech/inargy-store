'use client'

import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@heroui/react'
import { adminGetInstallments, updateInstallmentStatus } from '../../../lib/queries'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import StatusBadge from '../../../components/ui/StatusBadge'
import Pagination from '../../../components/ui/Pagination'
import { formatNaira, formatDate } from '../../../config'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

export default function AdminInstallmentsPage() {
  const [plans, setPlans] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, count } = await adminGetInstallments({ status: statusFilter || undefined, page })
      setPlans(data || [])
      setTotal(count || 0)
      setLoading(false)
    }
    load()
  }, [statusFilter, page])

  const [error, setError] = useState('')

  async function markPaid(plan) {
    setSaving(plan.id)
    setError('')
    const { error: upErr } = await updateInstallmentStatus(plan.id, {
      status: 'paid',
      paid_kobo: plan.total_kobo,
    })
    setSaving(null)
    if (upErr) {
      setError('Failed to mark installment as paid. Please try again.')
      return
    }
    setPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id ? { ...p, status: 'paid', paid_kobo: plan.total_kobo } : p
      )
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Installments</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            onPress={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors min-w-0 h-auto ${
              statusFilter === f.value
                ? 'bg-slate-green text-white'
                : 'bg-white border border-border text-muted hover:border-slate-green/40'
            }`}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <CreditCard size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No installment plans</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-surface/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Plan</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Paid</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Next Due</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {plans.map((plan) => {
                  const paidPct = plan.total_kobo
                    ? Math.round(((plan.paid_kobo || 0) / plan.total_kobo) * 100)
                    : 0
                  return (
                    <tr key={plan.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-green">#{plan.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted">{plan.months}mo · {formatDate(plan.created_at)}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-green">
                        {plan.profiles?.full_name || '—'}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-green">
                        {formatNaira(plan.total_kobo)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-medium text-slate-green">{formatNaira(plan.paid_kobo || 0)}</p>
                        <p className="text-xs text-muted">{paidPct}%</p>
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {plan.next_due_date ? formatDate(plan.next_due_date) : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={plan.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {plan.status !== 'paid' && (
                          <Button
                            onPress={() => markPaid(plan)}
                            isLoading={saving === plan.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success text-xs font-semibold rounded-full hover:bg-success/20 transition-colors disabled:opacity-60 ml-auto min-w-0 h-auto"
                          >
                            <CheckCircle size={13} />
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
