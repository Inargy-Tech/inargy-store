'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Mail } from 'lucide-react'
import { adminGetCustomers } from '../../../lib/queries'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Pagination from '../../../components/ui/Pagination'
import { formatDate } from '../../../config'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load(p = 1) {
    setLoading(true)
    const { data, count } = await adminGetCustomers({ page: p })
    setCustomers(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => {
    load(page)
  }, [page])

  // Client-side filtering on current page results
  const filtered = search
    ? customers.filter((c) => {
        const q = search.toLowerCase()
        return (
          (c.full_name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q)
        )
      })
    : customers

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Customers</h1>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="customer-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <Users size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No customers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-surface/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Joined</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-green text-volt rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                          {(customer.full_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-green">{customer.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted truncate max-w-[160px]">{customer.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">{customer.phone || '—'}</td>
                    <td className="px-4 py-4 text-muted">{formatDate(customer.created_at)}</td>
                    <td className="px-6 py-4">
                      {customer.email && (
                        <a
                          href={`mailto:${customer.email}`}
                          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-slate-green transition-colors"
                        >
                          <Mail size={13} /> Email
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
