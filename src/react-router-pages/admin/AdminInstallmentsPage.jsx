import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle } from 'lucide-react'
import { adminGetInstallments, updateInstallmentStatus } from '../../lib/queries'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatNaira, formatDate } from '../../config'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
]

export default function AdminInstallmentsPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await adminGetInstallments({ status: statusFilter || undefined })
      setPlans(data || [])
      setLoading(false)
    }
    load()
  }, [statusFilter])

  async function markPaid(plan) {
    setSaving(plan.id)
    await updateInstallmentStatus(plan.id, {
      status: 'paid',
      paid_kobo: plan.total_kobo,
    })
    setSaving(null)
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
                          <button
                            onClick={() => markPaid(plan)}
                            disabled={saving === plan.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success text-xs font-semibold rounded-full hover:bg-success/20 transition-colors disabled:opacity-60 ml-auto"
                          >
                            <CheckCircle size={13} />
                            {saving === plan.id ? '…' : 'Mark Paid'}
                          </button>
                        )}
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
