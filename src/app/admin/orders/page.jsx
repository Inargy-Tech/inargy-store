'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Alert } from '@heroui/react/alert'
import { Button } from '@heroui/react/button'
import { Card } from '@heroui/react/card'
import { Table } from '@heroui/react/table'
import { ShoppingCart, ChevronRight, Search, X } from 'lucide-react'
import { adminGetOrders } from '../../../lib/queries'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import StatusBadge from '../../../components/ui/StatusBadge'
import Pagination from '../../../components/ui/Pagination'
import { formatNaira, formatDate } from '../../../config'

const PAGE_SIZE = 20

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef(null)

  // Debounce search input
  function handleSearchChange(e) {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400)
  }

  function clearSearch() {
    setSearch('')
    setDebouncedSearch('')
    clearTimeout(debounceRef.current)
  }

  const load = useCallback(async (status, p, searchTerm) => {
    setLoading(true)
    setFetchError('')
    const { data, error, count } = await adminGetOrders({
      status: status || undefined,
      page: p,
      search: searchTerm || undefined,
    })
    if (error) setFetchError('Could not load orders. Please try again.')
    setOrders(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    load(statusFilter, 1, debouncedSearch)
  }, [statusFilter, debouncedSearch, load])

  useEffect(() => {
    load(statusFilter, page, debouncedSearch)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSearching = debouncedSearch.trim().length > 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Orders</h1>

      {/* Search bar */}
      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by order ID, phone or email…"
          className="w-full pl-10 pr-9 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-green transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status filter tabs */}
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

      {fetchError && (
        <Alert status="danger" className="mb-6">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{fetchError}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-16 text-center">
          <ShoppingCart size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold">No orders found</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Orders table" className="w-full text-sm">
                  <Table.Header className="border-b border-border-light bg-surface/50">
                    <Table.Column id="order" isRowHeader className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Order
                    </Table.Column>
                    <Table.Column id="customer" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Customer
                    </Table.Column>
                    <Table.Column id="date" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Date
                    </Table.Column>
                    <Table.Column id="payment" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Payment
                    </Table.Column>
                    <Table.Column id="status" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Status
                    </Table.Column>
                    <Table.Column id="total" className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Total
                    </Table.Column>
                    <Table.Column id="details" className="px-4 py-3" aria-label="View order" />
                  </Table.Header>
                  <Table.Body className="divide-y divide-border-light">
                    {orders.map((order) => {
                      const addr = order.delivery_address || {}
                      return (
                        <Table.Row key={order.id} id={order.id} className="hover:bg-surface/30 transition-colors">
                          <Table.Cell className="px-6 py-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-medium text-slate-green hover:text-volt-dim transition-colors"
                            >
                              #{order.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4">
                            <p className="text-slate-green font-medium">{addr.full_name || '—'}</p>
                            <p className="text-xs text-muted">{addr.phone || ''}</p>
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4 text-muted">{formatDate(order.created_at)}</Table.Cell>
                          <Table.Cell className="px-4 py-4 text-muted capitalize">
                            {order.payment_method?.replace(/_/g, ' ') || '—'}
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4">
                            <StatusBadge status={order.status} />
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4 text-right font-semibold text-slate-green">
                            {formatNaira(order.total_kobo)}
                          </Table.Cell>
                          <Table.Cell className="px-4 py-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="p-1.5 rounded-lg text-muted hover:text-slate-green hover:bg-surface transition-colors inline-flex"
                            >
                              <ChevronRight size={16} />
                            </Link>
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card>

          {!isSearching && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}
