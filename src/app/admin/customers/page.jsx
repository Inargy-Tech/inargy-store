'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@heroui/react/card'
import { Table } from '@heroui/react/table'
import { Users, Search, Mail, X } from 'lucide-react'
import { adminGetCustomers } from '../../../lib/queries'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Pagination from '../../../components/ui/Pagination'
import { formatDate } from '../../../config'

const PAGE_SIZE = 20

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const load = useCallback(async (q, p) => {
    setLoading(true)
    const { data, error, count } = await adminGetCustomers({ search: q, page: p })
    if (error) console.error('Failed to load customers:', error.message)
    setCustomers(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [])

  // Debounce search, reset to page 1
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(search, 1) }, 350)
    return () => clearTimeout(t)
  }, [search, load])

  useEffect(() => {
    load(search, page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Customers</h1>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full pl-10 pr-9 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-green transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : customers.length === 0 ? (
        <Card className="p-16 text-center">
          <Users size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No customers found</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Customers table" className="w-full text-sm" onRowAction={!isMobile ? (id) => router.push(`/admin/customers/${id}`) : undefined}>
                  <Table.Header className="border-b border-border-light bg-surface/50">
                    <Table.Column id="customer" isRowHeader className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Customer
                    </Table.Column>
                    <Table.Column id="phone" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Phone
                    </Table.Column>
                    <Table.Column id="joined" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Joined
                    </Table.Column>
                    <Table.Column id="actions" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Actions
                    </Table.Column>
                  </Table.Header>
                  <Table.Body className="divide-y divide-border-light">
                    {customers.map((customer) => (
                      <Table.Row key={customer.id} id={customer.id} className="hover:bg-surface/50 transition-colors cursor-pointer">
                        <Table.Cell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-green text-volt rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                              {(customer.full_name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-green">{customer.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted truncate max-w-[160px]">{customer.id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 text-muted">{customer.phone || '—'}</Table.Cell>
                        <Table.Cell className="px-4 py-4 text-muted">{formatDate(customer.created_at)}</Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          {customer.email && (
                            <a
                              href={`mailto:${customer.email}`}
                              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-slate-green transition-colors"
                            >
                              <Mail size={13} /> Email
                            </a>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
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
