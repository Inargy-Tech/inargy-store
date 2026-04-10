'use client'

import { useState, useEffect, useCallback } from 'react'
import { CreditCard, CheckCircle } from 'lucide-react'
import { Button } from '@heroui/react/button'
import { Card } from '@heroui/react/card'
import { Table } from '@heroui/react/table'
import { adminGetInstallments, updateInstallmentStatus } from '../../../lib/queries'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import StatusBadge from '../../../components/ui/StatusBadge'
import Pagination from '../../../components/ui/Pagination'
import { formatNaira, formatDate } from '../../../config'

const PAGE_SIZE = 20

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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async (status, p) => {
    setLoading(true)
    const { data, error, count } = await adminGetInstallments({ status: status || undefined, page: p })
    if (error) console.error('Failed to load installments:', error.message)
    setPlans(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    load(statusFilter, 1)
  }, [statusFilter, load])

  useEffect(() => {
    load(statusFilter, page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="p-16 text-center">
          <CreditCard size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No installment plans</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Installment plans table" className="w-full text-sm">
                  <Table.Header className="border-b border-border-light bg-surface/50">
                    <Table.Column id="plan" isRowHeader className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Plan
                    </Table.Column>
                    <Table.Column id="customer" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Customer
                    </Table.Column>
                    <Table.Column id="total" className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Total
                    </Table.Column>
                    <Table.Column id="paid" className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Paid
                    </Table.Column>
                    <Table.Column id="nextDue" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Next Due
                    </Table.Column>
                    <Table.Column id="status" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Status
                    </Table.Column>
                    <Table.Column id="actions" className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Actions
                    </Table.Column>
                  </Table.Header>
                  <Table.Body className="divide-y divide-border-light">
                    {plans.map((plan) => {
                      const paidPct = plan.total_kobo
                        ? Math.round(((plan.paid_kobo || 0) / plan.total_kobo) * 100)
                        : 0
                      return (
                        <Table.Row key={plan.id} id={plan.id} className="hover:bg-surface/30 transition-colors">
                          <Table.Cell className="px-6 py-4">
                            <p className="font-medium text-slate-green">#{plan.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-muted">{plan.months}mo · {formatDate(plan.created_at)}</p>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4 text-slate-green">
                            {plan.profiles?.full_name || '—'}
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4 text-right font-semibold text-slate-green">
                            {formatNaira(plan.total_kobo)}
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4 text-right">
                            <p className="font-medium text-slate-green">{formatNaira(plan.paid_kobo || 0)}</p>
                            <p className="text-xs text-muted">{paidPct}%</p>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4 text-muted">
                            {plan.next_due_date ? formatDate(plan.next_due_date) : '—'}
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4">
                            <StatusBadge status={plan.status} />
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4 text-right">
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
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card>

          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
