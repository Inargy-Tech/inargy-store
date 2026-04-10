'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { getInstallments } from '../../../lib/queries'
import StatusBadge from '../../../components/ui/StatusBadge'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import EmptyState from '../../../components/ui/EmptyState'
import { formatNaira, formatDate } from '../../../config'
import { CONTACT } from '../../../config'
import { Card } from '@heroui/react/card'

export default function InstallmentsPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await getInstallments(user.id)
      if (error) console.error('Failed to load installments:', error.message)
      setPlans(data || [])
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
      <h1 className="text-2xl font-bold text-slate-green mb-2">Installments</h1>
      <p className="text-sm text-muted mb-6">Track your monthly payment plans.</p>

      {plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No installment plans"
          description="When you choose a monthly payment plan at checkout, your plans will appear here."
          action={
            <Link
              href="/catalog"
              className="inline-flex items-center px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
            >
              Shop Now
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const remainingKobo = plan.total_kobo - (plan.paid_kobo || 0)
            const paidPct = plan.total_kobo ? Math.round(((plan.paid_kobo || 0) / plan.total_kobo) * 100) : 0

            return (
              <Card key={plan.id} className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-green">
                      Plan #{plan.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Started {formatDate(plan.created_at)} · {plan.months} months
                    </p>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted mb-1.5">
                    <span>Paid: {formatNaira(plan.paid_kobo || 0)}</span>
                    <span>Total: {formatNaira(plan.total_kobo)}</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-volt rounded-full transition-all"
                      style={{ width: `${paidPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-1">{paidPct}% paid</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-light">
                  <div>
                    <p className="text-xs text-muted">Remaining</p>
                    <p className="text-base font-bold text-slate-green">{formatNaira(remainingKobo)}</p>
                  </div>
                  {plan.next_due_date && (
                    <div className="text-right">
                      <p className="text-xs text-muted">Next due</p>
                      <p className="text-sm font-semibold text-slate-green">{formatDate(plan.next_due_date)}</p>
                    </div>
                  )}
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-green text-white text-xs font-semibold rounded-full hover:bg-slate-dark transition-colors"
                  >
                    Make Payment
                  </a>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
